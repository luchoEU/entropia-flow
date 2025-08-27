import IActionManager from '../chrome/IActionManager'
import IAlarmManager from '../chrome/IAlarmManager'
import IMessagesHub from '../chrome/IMessagesHub'
import { PortManagerFactory } from '../chrome/IPort'
import IStorageArea from '../chrome/IStorageArea'
import ITabManager from '../chrome/ITab'
import {
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
    STORAGE_TAB_CONTENTS,
    STORAGE_TAB_VIEWS,
    MSG_NAME_SET_WEB_SOCKET_URL,
    MSG_NAME_LOADING,
    MSG_NAME_REMAINING_SECONDS,
    MSG_NAME_STORAGE_CHANGED,
    MSG_NAME_SET_SHOWING_LAYOUT_ID,
} from '../common/const'
import ContentTabManager from './content/contentTab'
import InventoryManager from './inventory/inventory'
import InventoryStorage from './inventory/inventoryStorage'
import TabStorage from './tabStorage'
import ViewTabManager from './view/viewTab'
import ViewStateManager from './view/viewState'
import AlarmSettings from './settings/alarmSettings'
import ViewSettings from './settings/viewSettings'
import IWebSocketClient, { WebSocketStateCode } from './client/webSocketInterface'
import RefreshManager from './content/refreshManager'
import GameLogHistory from './client/gameLogHistory'
import GameLogParser from './client/gameLogParser'
import GameLogStorage from './client/gameLogStorage'
import INotificationManager from '../chrome/INotificationManager'
import { decodeHTML } from '../common/html'
import { StreamDataBuilder } from './client/streamDataBuilder'
import { LastDeltaVariablesBuilder } from './inventory/lastDeltaVariablesBuilder'
import { InventoryVariablesBuilder } from './inventory/inventoryVariablesBuilder'
import { StatusVariablesBuilder } from './content/statusVariablesBuilder'
import { BackgroundVariablesBuilder } from '../stream/backgroundVariablesBuilder'
import { LayoutVariablesBuilder } from './client/layoutVariablesBuilder'
import { GameLogVariablesBuilder } from './client/gameLogVariablesBuilder'

async function wiring(
    messages: IMessagesHub,
    notifications: INotificationManager,
    refreshItemAjaxAlarm: IAlarmManager,
    refreshItemFrozenAlarm: IAlarmManager,
    refreshItemSleepAlarm: IAlarmManager,
    refreshItemDeadAlarm: IAlarmManager,
    refreshItemTickAlarm: IAlarmManager,
    tabs: ITabManager,
    actions: IActionManager,
    webSocketClient: IWebSocketClient,
    portManagerFactory: PortManagerFactory,
    inventoryStorageArea: IStorageArea,
    gameLogStorageArea: IStorageArea,
    tabStorageArea: IStorageArea,
    settingsStorageArea: IStorageArea,
    isUnfreezeTabEnabled: () => Promise<boolean>,
    loadBlueprintListAtStart: boolean) {

    // storage
    const inventoryStorage = new InventoryStorage(inventoryStorageArea)
    const gameLogStorage = new GameLogStorage(gameLogStorageArea)
    const contentListStorage = new TabStorage(tabStorageArea, STORAGE_TAB_CONTENTS)
    const viewListStorage = new TabStorage(tabStorageArea, STORAGE_TAB_VIEWS)

    // settings
    const alarmSettings = new AlarmSettings(settingsStorageArea)
    const viewSettings = new ViewSettings(settingsStorageArea)

    // port manager
    const contentPortManager = portManagerFactory(contentListStorage, messages, tabs, PORT_NAME_BACK_CONTENT)
    const viewPortManager = portManagerFactory(viewListStorage, messages, tabs, PORT_NAME_BACK_VIEW)

    // game log
    const gameLogParser = new GameLogParser()
    const gameLogHistory = new GameLogHistory()

    // stream
    const streamDataBuilder = new StreamDataBuilder()

    // state
    const refreshManager = new RefreshManager(refreshItemAjaxAlarm, refreshItemFrozenAlarm, refreshItemSleepAlarm, refreshItemDeadAlarm, refreshItemTickAlarm, alarmSettings)
    const inventoryManager = new InventoryManager(inventoryStorage)
    const viewStateManager = new ViewStateManager(refreshManager, viewSettings, inventoryManager, gameLogHistory, webSocketClient, streamDataBuilder)

    // stream
    const lastDeltaBuilder = new LastDeltaVariablesBuilder(viewSettings, inventoryManager)
    const inventoryBuilder = new InventoryVariablesBuilder(inventoryManager)
    const statusBuilder = new StatusVariablesBuilder(refreshManager)
    const backgroundBuilder = new BackgroundVariablesBuilder()
    const layoutBuilder = new LayoutVariablesBuilder()
    const gameLogBuilder = new GameLogVariablesBuilder(gameLogHistory)

    // tabs
    const contentTabManager = new ContentTabManager(contentPortManager, isUnfreezeTabEnabled)
    const viewTabManager = new ViewTabManager(viewPortManager, viewStateManager, tabs, loadBlueprintListAtStart)

    // links
    contentPortManager.onConnect = (port) => contentTabManager.onConnect(port)
    contentPortManager.onDisconnect = (port) => contentTabManager.onDisconnect(port)
    viewPortManager.onConnect = (port) => viewTabManager.onConnect(port)
    viewPortManager.onDisconnect = (port) => viewTabManager.onDisconnect(port)
    refreshManager.subscribeOnChanged((status) => viewStateManager.setStatus(status))
    refreshManager.onInventory = async (inventory) => {
        const keepDate = await viewSettings.getLast()
        const list = await inventoryManager.onNew(inventory, keepDate)
        await viewSettings.setLastIfEqual(list)
        await viewStateManager.setList(list)
    }
    await refreshManager.setContentTab(contentTabManager)
    webSocketClient.onMessage = async msg => {
        switch (msg.type) {
            case "version":
                viewStateManager.setClientVersion(msg.data)
                break;
            case "log":
                const dataUnescaped = decodeHTML(msg.data) // it is saved escaped in log, i.e &apos;
                await gameLogParser.onMessage(dataUnescaped)
                await refreshManager.onLogMessageReceived()
                break;
            case "dispatch":
                await viewTabManager.sendDispatch(msg.data)
                break;
            case "used-layouts":
                streamDataBuilder.setUsedLayouts(msg.data)
                break;
        }
    }
    webSocketClient.onStateChanged = async (state) => {
        await viewStateManager.setClientState(state)
        await refreshManager.onWebSocketStateChanged(state.code === WebSocketStateCode.connected)
        await streamDataBuilder.clearClientData(state.code)
    }
    streamDataBuilder.sendClientData = async (data) => {
        await webSocketClient.send('stream', data)
    }
    streamDataBuilder.addBuilder(lastDeltaBuilder)
    streamDataBuilder.addBuilder(inventoryBuilder)
    streamDataBuilder.addBuilder(statusBuilder)
    streamDataBuilder.addBuilder(backgroundBuilder)
    streamDataBuilder.addBuilder(layoutBuilder)
    streamDataBuilder.addBuilder(gameLogBuilder)
    streamDataBuilder.addTemporalBuilder(gameLogBuilder)
    streamDataBuilder.onDataChanged = async (variables, renderData) => {
        await viewStateManager.setStreamVariablesAndData(variables, renderData)
    }
    gameLogParser.onLines = (lines) => gameLogHistory.onLines(lines)
    const gameLog = await gameLogStorage.get()
    if (gameLog)
        await gameLogHistory.setGameLog(gameLog)
    gameLogHistory.subscribeOnChanged(async (gameLog) => {
        await gameLogStorage.set(gameLog)
        await viewStateManager.setGameLog(gameLog)
    })
    actions.clickListen(() => {
        viewTabManager.createOrOpenView()
    })

    // start web socket client
    const webSocketUrl = await viewSettings.getWebSocketUrl()
    webSocketClient.start(webSocketUrl)
    
    // notifications
    if (notifications) {
        notifications.onClick = async (notificationId, buttonIndex) => {
            await viewTabManager.createOrOpenView();
            await viewTabManager.sendNotificationClicked(notificationId, buttonIndex);
        }
    }

    // listen to new content or view
    messages.listen({
        [MSG_NAME_REGISTER_CONTENT]: contentPortManager,
        [MSG_NAME_REGISTER_VIEW]: viewPortManager
    })

    // port handlers
    contentPortManager.handlers = {
        [MSG_NAME_NEW_INVENTORY]: (m) => refreshManager.handleNewInventory(m.inventory),
        [MSG_NAME_REMAINING_SECONDS]: (m) => refreshManager.handleRemainingSeconds(m.remainingSeconds),
        [MSG_NAME_LOADING]: (m) => refreshManager.handleLoading(m.loading),
        [MSG_NAME_OPEN_VIEW]: () => viewTabManager.createOrOpenView(),
        [MSG_NAME_REQUEST_TIMER_ON]: () => refreshManager.setTimerOn(),
        [MSG_NAME_REQUEST_TIMER_OFF]: () => refreshManager.setTimerOff()
    }
    viewPortManager.handlers = {
        [MSG_NAME_REQUEST_NEW]: async (m: { tag: any, forced: boolean }) => {
            await refreshManager.manualRefresh(m.tag, m.forced) // manual request by user
        },
        [MSG_NAME_REQUEST_SET_LAST]: async (m: { tag: any, last: number }) => {
            await viewSettings.setLast(m.last)
            if (m.tag)
                await inventoryStorage.tag(m.last, m.tag)
            viewStateManager.reload()
            if (m.tag?.last)
                gameLogHistory.clearSession()
        },
        [MSG_NAME_REQUEST_TIMER_ON]: () => refreshManager.setTimerOn(),
        [MSG_NAME_REQUEST_TIMER_OFF]: () => refreshManager.setTimerOff(),
        [MSG_NAME_SET_SHOWING_LAYOUT_ID]: async (m: { layoutId: string }) => streamDataBuilder.updateShowingLayoutId(m.layoutId),
        [MSG_NAME_STORAGE_CHANGED]: async (m: { store: string }) => streamDataBuilder.updateState(m.store),
        [MSG_NAME_SET_WEB_SOCKET_URL]: async (m: { url: string}) => webSocketClient.start(m.url)
    }

    streamDataBuilder.loop()
}

export default wiring
