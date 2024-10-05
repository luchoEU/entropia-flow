import IActionManager from '../chrome/actionInterface'
import IAlarmManager from '../chrome/alarmInterface'
import IMessagesHub from '../chrome/messagesInterface'
import { PortManagerFactory } from '../chrome/portInterface'
import IStorageArea from '../chrome/storageAreaInterface'
import ITabManager from '../chrome/tabsInterface'
import {
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_OPEN_VIEW,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REQUEST_NEW,
    MSG_NAME_REQUEST_SET_LAST,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON,
    MSG_NAME_SEND_WEB_SOCKET_MESSAGE,
    PORT_NAME_BACK_CONTENT,
    PORT_NAME_BACK_VIEW,
    STORAGE_LIST_CONTENTS,
    STORAGE_LIST_VIEWS,
    MSG_NAME_SET_WEB_SOCKET_URL,
} from '../common/const'
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
import RefreshManager from './content/refreshManager'

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

    // port manager
    const contentPortManager = portManagerFactory(contentListStorage, messages, tabs, PORT_NAME_BACK_CONTENT)
    const viewPortManager = portManagerFactory(viewListStorage, messages, tabs, PORT_NAME_BACK_VIEW)

    // state
    const refreshManager = new RefreshManager(refreshItemHtmlAlarm, refreshItemAjaxAlarm, alarmSettings)
    const inventoryManager = new InventoryManager(inventoryStorage)
    const viewStateManager = new ViewStateManager(refreshManager, viewSettings, inventoryManager)
    
    // tabs
    const contentTabManager = new ContentTabManager(contentPortManager)
    const viewTabManager = new ViewTabManager(viewPortManager, viewStateManager, tabs)

    // game log
    const gameLogManager = new GameLogManager()
    const lootHistory = new LootHistory()

    // links
    contentPortManager.onConnect = (port) => contentTabManager.onConnect(port)
    contentPortManager.onDisconnect = (port) => contentTabManager.onDisconnect(port)
    viewPortManager.onConnect = (port) => viewTabManager.onConnect(port)
    viewPortManager.onDisconnect = (port) => viewTabManager.onDisconnect(port)
    refreshManager.setViewStatus = (status) => viewStateManager.setStatus(status)
    refreshManager.onInventory = async (inventory) => {
        const keepDate = await viewSettings.getLast()
        const list = await inventoryManager.onNew(inventory, keepDate)
        await viewSettings.setLastIfEqual(list)
        await viewStateManager.setList(list)
    }
    refreshManager.setContentTab(contentTabManager)
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

    // port handlers
    contentPortManager.handlers = {
        [MSG_NAME_NEW_INVENTORY]: (m) => refreshManager.handleNewInventory(m.Inventory),
        [MSG_NAME_OPEN_VIEW]: () => viewTabManager.createOrOpenView(),
        [MSG_NAME_REQUEST_TIMER_ON]: () => refreshManager.setTimerOn(),
        [MSG_NAME_REQUEST_TIMER_OFF]: () => refreshManager.setTimerOff()
    }
    viewPortManager.handlers = {
        [MSG_NAME_REQUEST_NEW]: async (m: { tag: any }) => {
            await refreshManager.manualRefresh(m.tag) // manual request by user
        },
        [MSG_NAME_REQUEST_SET_LAST]: async (m: { tag: any, last: number }) => {
            await viewSettings.setLast(m.last)
            if (m.tag)
                await inventoryStorage.tag(m.last, m.tag)
            viewStateManager.reload()
        },
        [MSG_NAME_REQUEST_TIMER_ON]: () => refreshManager.setTimerOn(),
        [MSG_NAME_REQUEST_TIMER_OFF]: () => refreshManager.setTimerOff(),
        [MSG_NAME_SEND_WEB_SOCKET_MESSAGE]: async (m: { type: string, data: any }) => {
            await webSocketClient.send(m.type, m.data)
        },
        [MSG_NAME_SET_WEB_SOCKET_URL]: async (m: { url: string}) => {
            await webSocketClient.start(m.url)
        }
    }
}

export default wiring
