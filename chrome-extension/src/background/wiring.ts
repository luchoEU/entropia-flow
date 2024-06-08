import IActionManager from '../chrome/actionInterface'
import IAlarmManager from '../chrome/alarmInterface'
import IMessagesHub from '../chrome/messagesInterface'
import { PortManagerFactory } from '../chrome/portInterface'
import IStorageArea from '../chrome/storageAreaInterface'
import ITabManager from '../chrome/tabsInterface'
import {
    AFTER_MANUAL_WAIT_SECONDS,
    CLASS_ERROR,
    MSG_NAME_NEW_INVENTORY_NOT_READY,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_OPEN_VIEW,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REQUEST_NEW,
    MSG_NAME_REQUEST_SET_LAST,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON,
    MSG_NAME_SEND_WEB_SOCKET_MESSAGE,
    NORMAL_WAIT_SECONDS,
    PORT_NAME_BACK_CONTENT,
    PORT_NAME_BACK_VIEW,
    STORAGE_LIST_CONTENTS,
    STORAGE_LIST_VIEWS,
    STRING_ALARM_OFF,
    STRING_NO_DATA,
    STRING_PLEASE_LOG_IN,
    NEXT_HTML_CHECK_WAIT_SECONDS,
    FIRST_HTML_CHECK_WAIT_SECONDS,
    MSG_NAME_SET_WEB_SOCKET_URL,
} from '../common/const'
import { trace, traceData } from '../common/trace'
import ContentTabManager from './content/contentTab'
import InventoryManager from './inventory/inventory'
import InventoryStorage from './inventory/inventoryStorage'
import ListStorage from './listStorage'
import ViewTabManager from './view/viewTab'
import ViewStateManager from './view/viewState'
import AlarmSettings from './settings/alarmSettings'
import ViewSettings from './settings/viewSettings'
import GameLogManager from './client/gameLogManager'
import LootHistory from './client/lootHistory'
import IWebSocketClient from './client/webSocketInterface'

async function wiring(
    messages: IMessagesHub,
    refreshItemHtmlAlarm: IAlarmManager,
    refreshItemAjaxAlarm: IAlarmManager,
    tabs: ITabManager,
    actions: IActionManager,
    webSocketClient: IWebSocketClient,
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
    const inventoryManager = new InventoryManager(inventoryStorage)
    const viewStateManager = new ViewStateManager(refreshItemAjaxAlarm, alarmSettings, viewSettings, inventoryManager)

    // port manager
    const contentPortManager = portManagerFactory(contentListStorage, messages, tabs, PORT_NAME_BACK_CONTENT)
    const viewPortManager = portManagerFactory(viewListStorage, messages, tabs, PORT_NAME_BACK_VIEW)

    // tabs
    const contentTabManager = new ContentTabManager(contentPortManager)
    const viewTabManager = new ViewTabManager(viewPortManager, viewStateManager, tabs)

    // game log
    const gameLogManager = new GameLogManager()
    const lootHistory = new LootHistory()

    // links
    contentTabManager.onMessage = (c, m) => viewStateManager.setStatus(c, m)
    contentPortManager.onConnect = async (port) => {
        await contentTabManager.onConnect(port)
        const on = await alarmSettings.isMonitoringOn()
        await contentTabManager.setStatus(on)
        await refreshItemHtmlAlarm.start(FIRST_HTML_CHECK_WAIT_SECONDS) // read the items loaded by the page when ready
    }
    contentPortManager.onDisconnect = async (port) => {
        await refreshItemHtmlAlarm.end()
        await refreshItemAjaxAlarm.end()
        await contentTabManager.onDisconnect(port)
    }
    viewPortManager.onConnect = port => viewTabManager.onConnect(port)
    viewPortManager.onDisconnect = port => viewTabManager.onDisconnect(port)
    webSocketClient.onMessage = async msg => {
        switch (msg.type) {
            case "log":
                await gameLogManager.onMessage(msg.data)
                break;
        }
    }
    webSocketClient.onStateChanged = viewStateManager.setClientState
    gameLogManager.onLoot = lootHistory.onLoot
    lootHistory.onChange = viewStateManager.setGameLog
    actions.clickListen(() => {
        viewTabManager.createOrOpenView()
    })

    // start web socket client
    const webSocketUrl = await viewSettings.getWebSocketUrl()
    webSocketClient.start(webSocketUrl)
    
    // listen to new content or view
    messages.listen({
        [MSG_NAME_REGISTER_CONTENT]: contentPortManager,
        [MSG_NAME_REGISTER_VIEW]: viewPortManager
    })

    // monitoring on/off
    async function setTimerOn() {
        const on = await alarmSettings.isMonitoringOn()
        if (on) {
            await viewStateManager.setStatus()
        } else {
            await alarmSettings.turnMonitoringOn(true)
            if (await refreshItemAjaxAlarm.getStatus() === STRING_ALARM_OFF) {
                await contentTabManager.requestItemsAjax()
            } else {
                await viewStateManager.setStatus()
            }
        }
        await contentTabManager.setStatus(true)
    }

    async function setTimerOff() {
        const on = await alarmSettings.isMonitoringOn()
        if (on) {
            await alarmSettings.turnMonitoringOn(false)
        }
        await contentTabManager.setStatus(false)
        await viewStateManager.setStatus()
    }

    // port handlers
    contentPortManager.handlers = {
        [MSG_NAME_NEW_INVENTORY_NOT_READY]: async (m: any) => {
            refreshItemHtmlAlarm.start(NEXT_HTML_CHECK_WAIT_SECONDS)
        },
        [MSG_NAME_NEW_INVENTORY]: async (m: any) => {
            try {
                if (m.inventory.log?.message === STRING_PLEASE_LOG_IN) {
                    await viewStateManager.setStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN)
                } else if (m.inventory.log?.message === STRING_NO_DATA) {
                    // the page has not load the first item list yet
                    // don't add no data to history since it is common in my items page reload
                    // don't start the alarm eighter, it will be started when the items are loaded in the page and it sends a MSG_NAME_NEW_INVENTORY message
                } else {
                    await refreshItemAjaxAlarm.start(m.inventory.waitSeconds ?? NORMAL_WAIT_SECONDS)
                    const keepDate = await viewSettings.getLast()
                    const list = await inventoryManager.onNew(m.inventory, keepDate)
                    await viewSettings.setLastIfEqual(list)
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
            // manual request by user
            await refreshItemAjaxAlarm.end()
            await contentTabManager.requestItemsAjax(m.tag, AFTER_MANUAL_WAIT_SECONDS)
        },
        [MSG_NAME_REQUEST_SET_LAST]: async (m: { tag: any, last: number }) => {
            await viewSettings.setLast(m.last)
            if (m.tag)
                await inventoryStorage.tag(m.last, m.tag)
            viewStateManager.reload()
        },
        [MSG_NAME_REQUEST_TIMER_ON]: setTimerOn,
        [MSG_NAME_REQUEST_TIMER_OFF]: setTimerOff,
        [MSG_NAME_SEND_WEB_SOCKET_MESSAGE]: async (m: { type: string, data: any }) => {
            await webSocketClient.send(m.type, m.data)
        },
        [MSG_NAME_SET_WEB_SOCKET_URL]: async (m: { url: string}) => {
            await webSocketClient.start(m.url)
        }
    }

    // prepare alarms
    refreshItemHtmlAlarm.listen(async () => {
        await refreshItemHtmlAlarm.end()
        await contentTabManager.requestItemsHtml()
    })
    refreshItemAjaxAlarm.listen(async () => {
        await refreshItemAjaxAlarm.end()
        if (await alarmSettings.isMonitoringOn())
            await contentTabManager.requestItemsAjax()
    })
    trace(`alarm status ${await refreshItemAjaxAlarm.getStatus()}`)
}

export default wiring
