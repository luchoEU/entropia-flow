import IActionManager from '../chrome/actionInterface'
import IAlarmManager from '../chrome/alarmInterface'
import IMessagesHub from '../chrome/messagesInterface'
import { PortManagerFactory } from '../chrome/portInterface'
import IStorageArea from '../chrome/storageAreaInterface'
import ITabManager from '../chrome/tabsInterface'
import {
    CLASS_ERROR,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_OPEN_VIEW,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REQUEST_NEW,
    MSG_NAME_REQUEST_SET_LAST,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON,
    PORT_NAME_BACK_CONTENT,
    PORT_NAME_BACK_VIEW,
    STORAGE_LIST_CONTENTS,
    STORAGE_LIST_VIEWS,
    STRING_ALARM_OFF,
    STRING_PLEASE_LOG_IN,
} from '../common/const'
import { trace, traceData } from '../common/trace'
import ContentTabManager from './content/contentTab'
import InventoryManager from './inventory/inventory'
import InventoryStorage from './inventory/inventoryStorage'
import ListStorage from './listStorage'
import IBackendServerManager from './server/backendInterface'
import ViewTabManager from './view/viewTab'
import ViewStateManager from './view/viewState'
import AlarmSettings from './settings/alarmSettings'
import ViewSettings from './settings/viewSettings'

async function wiring(
    messages: IMessagesHub,
    alarms: IAlarmManager,
    tabs: ITabManager,
    actions: IActionManager,
    server: IBackendServerManager,
    portManagerFactory: PortManagerFactory,
    inventoryStorageArea: IStorageArea,
    listStorageArea: IStorageArea,
    settingsStorageArea: IStorageArea) {

    // storage
    const inventoryStorage = new InventoryStorage(inventoryStorageArea)
    const contentListStorage = new ListStorage(listStorageArea, STORAGE_LIST_CONTENTS)
    const viewListStorage = new ListStorage(listStorageArea, STORAGE_LIST_VIEWS)

    // settings
    const alarmSettings = new AlarmSettings(settingsStorageArea)
    const viewSettings = new ViewSettings(settingsStorageArea)

    // state
    const inventoryManager = new InventoryManager(inventoryStorage, server)
    const viewStateManager = new ViewStateManager(alarms, alarmSettings, viewSettings, inventoryManager)

    // port manager
    const contentPortManager = portManagerFactory(contentListStorage, messages, tabs, PORT_NAME_BACK_CONTENT)
    const viewPortManager = portManagerFactory(viewListStorage, messages, tabs, PORT_NAME_BACK_VIEW)

    // tabs
    const contentTabManager = new ContentTabManager(contentPortManager)
    const viewTabManager = new ViewTabManager(viewPortManager, viewStateManager, tabs)

    // links
    contentTabManager.onMessage = (c, m) => viewStateManager.setStatus(c, m)
    contentPortManager.onConnect = async (port) => {
        await contentTabManager.onConnect(port)
        const on = await alarmSettings.isAutoRequestOn()
        await contentTabManager.setStatus(on)
        if (on) {
            // if monitoring is on do the request inmediatly
            await contentTabManager.requestItems()
        } else {
            // if monitoring is off wait the minutes
            await alarms.start()
        }
    }
    contentPortManager.onDisconnect = async (port) => {
        await alarms.end()
        await contentTabManager.onDisconnect(port)
    }
    viewPortManager.onConnect = port => viewTabManager.onConnect(port)
    viewPortManager.onDisconnect = port => viewTabManager.onDisconnect(port)

    actions.clickListen(() => {
        viewTabManager.createOrOpenView()
    })

    // listen to new content or view
    messages.listen({
        [MSG_NAME_REGISTER_CONTENT]: contentPortManager,
        [MSG_NAME_REGISTER_VIEW]: viewPortManager
    })

    // monitoring on/off
    async function setTimerOn() {
        const on = await alarmSettings.isAutoRequestOn()
        if (on) {
            await viewStateManager.setStatus()
        } else {
            await alarmSettings.turnAutoRequest(true)
            if (await alarms.getStatus() === STRING_ALARM_OFF) {
                await contentTabManager.requestItems()
            } else {
                await viewStateManager.setStatus()
            }
        }
        await contentTabManager.setStatus(true)
    }

    async function setTimerOff() {
        const on = await alarmSettings.isAutoRequestOn()
        if (on) {
            await alarmSettings.turnAutoRequest(false)
        }
        await contentTabManager.setStatus(false)
        await viewStateManager.setStatus()
    }

    // port handlers
    contentPortManager.handlers = {
        [MSG_NAME_NEW_INVENTORY]: async (m: any) => {
            try {
                if (m.inventory.log !== undefined
                    && m.inventory.log.message === STRING_PLEASE_LOG_IN) {
                    await viewStateManager.setStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN)
                } else {
                    alarms.start()
                    const keepDate = await viewSettings.getLast()
                    const list = await inventoryManager.onNew(m.inventory, keepDate)
                    await viewStateManager.setList(list)
                }
            } catch (e) {
                trace('wiring.handlers exception:')
                traceData(e)
                await viewStateManager.setStatus(CLASS_ERROR, e.message)
            }
        },
        [MSG_NAME_OPEN_VIEW]: () => viewTabManager.createOrOpenView(),
        [MSG_NAME_REQUEST_TIMER_ON]: setTimerOn,
        [MSG_NAME_REQUEST_TIMER_OFF]: setTimerOff
    }
    viewPortManager.handlers = {
        [MSG_NAME_REQUEST_NEW]: async (m: { tag: any }) => {
            await alarms.end()
            await contentTabManager.requestItems(m.tag)
        },
        [MSG_NAME_REQUEST_SET_LAST]: async (m: { tag: any, last }) => {
            await viewSettings.setLast(m.last)
            if (m.tag)
                await inventoryStorage.tag(m.last, m.tag)
            viewStateManager.reload()
        },
        [MSG_NAME_REQUEST_TIMER_ON]: setTimerOn,
        [MSG_NAME_REQUEST_TIMER_OFF]: setTimerOff
    }

    // prepare alarm
    alarms.listen(async () => {
        await alarms.end()
        if (await alarmSettings.isAutoRequestOn())
            await contentTabManager.requestItems()
    })
    trace(`alarm status ${await alarms.getStatus()}`)
}


export default wiring