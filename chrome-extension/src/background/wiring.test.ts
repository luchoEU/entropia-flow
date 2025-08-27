import MemoryStorageArea from "../chrome/memoryStorageArea"
import MockActionManager from "../chrome/mockActionManager"
import MockAlarmManager from "../chrome/mockAlarmManager"
import MockMessagesHub from "../chrome/mockMessages"
import MockPortManager, { MockPort } from "../chrome/mockPort"
import MockStorageArea from "../chrome/mockStorageArea"
import MockTabManager from "../chrome/mockTab"
import {
    MSG_NAME_ACTION_VIEW,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_REFRESH_CONTENT,
    MSG_NAME_REFRESH_ITEMS_AJAX,
    MSG_NAME_REFRESH_VIEW,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REQUEST_NEW,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON,
    PORT_NAME_BACK_CONTENT,
    PORT_NAME_BACK_VIEW,
    STORAGE_ALARM
} from "../common/const"
import { Inventory, setMockDate } from "../common/state"
import { traceOff } from "../common/trace"
import { emptyGameLogData } from "./client/gameLogData"
import { WebSocketStateCode } from "./client/webSocketInterface"
import MockWebSocketClient from "./client/webSocketMock"
import ContentTabManager from "./content/contentTab"
import RefreshManager from "./content/refreshManager"
import {
    DATE_CONST,
    STATE_LOADING_ITEMS,
    STATE_LOADING_PAGE_MONITORING_OFF,
    STATE_NO_DATA_MONITORING_OFF,
    STATE_NO_DATA_MONITORING_ON,
    STATE_PLEASE_LOG_IN_MONITORING_OFF,
    STATE_PLEASE_LOG_IN_MONITORING_ON,
    STATE_UPDATES_1_MIN,
    STATE_UPDATES_NOW,
    TIME_1_MIN,
} from "./stateConst"
import ViewStateManager from "./view/viewState"
import wiring from "./wiring"

traceOff()

describe('full', () => {
    let messages: MockMessagesHub
    let ajaxAlarm: MockAlarmManager
    let frozenAlarm: MockAlarmManager
    let sleepAlarm: MockAlarmManager
    let deadAlarm: MockAlarmManager
    let tickAlarm: MockAlarmManager
    let tabs: MockTabManager
    let actions: MockActionManager
    let portManagerFactory: jest.Mock<any, any>
    let contentPortManager: MockPortManager
    let webSocketClient: MockWebSocketClient
    let viewPortManager: MockPortManager
    let contentPort: MockPort
    let viewPort: MockPort
    let inventoryStorage: MockStorageArea
    let gameLogStorage: MemoryStorageArea
    let tabStorage: MockStorageArea
    let settingsStorage: MockStorageArea

    async function doWiring() {
        actions = new MockActionManager()
        contentPortManager = new MockPortManager()
        viewPortManager = new MockPortManager()
        webSocketClient = new MockWebSocketClient()
        portManagerFactory = jest.fn()
            .mockImplementationOnce(() => contentPortManager)
            .mockImplementationOnce(() => viewPortManager)

        contentPort = new MockPort()
        contentPortManager.allMock.mockReturnValue([contentPort])
        contentPortManager.firstMock.mockReturnValue(contentPort)
        contentPortManager.isEmptyMock.mockReturnValue(false)

        viewPort = new MockPort()
        viewPortManager.allMock.mockReturnValue([viewPort])
        viewPortManager.firstMock.mockReturnValue(viewPort)
        viewPortManager.isEmptyMock.mockReturnValue(false)
        await wiring(messages, undefined!, ajaxAlarm, frozenAlarm, sleepAlarm, deadAlarm, tickAlarm, tabs,
            actions, webSocketClient, portManagerFactory, inventoryStorage, gameLogStorage,
            tabStorage, settingsStorage, () => Promise.resolve(false), false);

        expect(viewPort.sendMock.mock.calls.length).toBe(1)
        viewPort.sendMock = jest.fn() // clear RefreshManager.SetContentTab in wiring
    }

    beforeEach(async () => {
        setMockDate(DATE_CONST)
        messages = new MockMessagesHub()
        ajaxAlarm = new MockAlarmManager()
        frozenAlarm = new MockAlarmManager()
        sleepAlarm = new MockAlarmManager()
        deadAlarm = new MockAlarmManager()
        tickAlarm = new MockAlarmManager()
        tabs = new MockTabManager()
        inventoryStorage = new MockStorageArea()
        gameLogStorage = new MemoryStorageArea()
        tabStorage = new MockStorageArea()
        settingsStorage = new MockStorageArea()
    })

    test('init', async () => {
        await doWiring()

        // alarm listen
        expect(ajaxAlarm.listenMock.mock.calls.length).toBe(1)
        expect(ajaxAlarm.listenMock.mock.calls[0].length).toBe(1)

        // listen to new connections
        expect(messages.listenMock.mock.calls.length).toBe(1)
        expect(messages.listenMock.mock.calls[0].length).toBe(1)
        expect(Object.keys(messages.listenMock.mock.calls[0][0])).toEqual([MSG_NAME_REGISTER_CONTENT, MSG_NAME_REGISTER_VIEW])

        // port manager factory calls
        expect(portManagerFactory.mock.calls.length).toBe(2)
        expect(portManagerFactory.mock.calls[0].length).toBe(4)
        expect(portManagerFactory.mock.calls[0][3]).toBe(PORT_NAME_BACK_CONTENT)
        expect(portManagerFactory.mock.calls[1].length).toBe(4)
        expect(portManagerFactory.mock.calls[1][3]).toBe(PORT_NAME_BACK_VIEW)
    })

    describe('when view started', () => {
        test('without monitoring expect monitor off message', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false, last: null })
            await doWiring()

            await viewPortManager.onConnect(viewPort)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_NO_DATA_MONITORING_OFF)
        })

        test('with monitoring no time expect please log in', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: true, last: null })
            await doWiring()

            await viewPortManager.onConnect(viewPort)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_NO_DATA_MONITORING_ON)
        })
    })

    describe('request items', () => {
        test('when time and no content expect please log in', async () => {
            await doWiring()
            contentPortManager.firstMock.mockReturnValue(undefined)

            await viewPortManager.handlers[MSG_NAME_REQUEST_NEW]({ tag: undefined })

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_PLEASE_LOG_IN_MONITORING_ON)
        })

        test('when content connects expect loading message', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            await doWiring()

            await contentPortManager.onConnect(contentPort)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_LOADING_PAGE_MONITORING_OFF)
        })
    })

    describe('refresh items', () => {
        test('on new inventory, send it to view', async() => {
            await doWiring()
            const inv: Inventory = {
                meta: { date: 111 }
            }
            await contentPortManager.handlers[MSG_NAME_NEW_INVENTORY]({ inventory: inv })

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual({ last: null, list: [inv], ...STATE_UPDATES_NOW })
        })
    })

    describe('alarm', () => {
        // TODO: fix test case
        test.skip('when tick, send view request', async () => {
            await doWiring()
            const alarmTick: () => Promise<void> = ajaxAlarm.listenMock.mock.calls[0][0]
            await alarmTick()
            expect(viewPort.sendMock.mock.calls.length).toBe(1)
        })
    })

    describe('montoring', () => {
        test("when turned off, don't stop alarm", async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: true })

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_OFF](undefined)

            expect(ajaxAlarm.endMock.mock.calls.length).toBe(0)
        })

        test("when turned off, change view state", async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: true })
            await doWiring()

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_OFF](undefined)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_PLEASE_LOG_IN_MONITORING_OFF)
        })

        test('when turned off, change alarm state', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: true })
            await doWiring()

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_OFF](undefined)

            expect(settingsStorage.setMock.mock.calls.length).toBe(1)
            expect(settingsStorage.setMock.mock.calls[0].length).toBe(2)
            expect(settingsStorage.setMock.mock.calls[0][0]).toBe(STORAGE_ALARM)
            expect(settingsStorage.setMock.mock.calls[0][1]).toEqual({ isMonitoring: false })
        })

        test('when turned on and still time, change view state', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            ajaxAlarm.isActiveMock.mockReturnValue(true)
            ajaxAlarm.getTimeLeftMock.mockReturnValue(TIME_1_MIN)
            await doWiring()

            await contentPortManager.handlers[MSG_NAME_NEW_INVENTORY]({ inventory: [] }) // remove sticky from RefreshManager
            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined) // test

            expect(viewPort.sendMock.mock.calls.length).toBe(2)
            expect(viewPort.sendMock.mock.calls[1].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[1][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[1][1]).toEqual(STATE_UPDATES_1_MIN)
        })

        // TODO: fix test case
        test.skip('when turned on, alarm is off and content is up, change view state', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            ajaxAlarm.isActiveMock.mockReturnValue(false)
            await doWiring()

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_LOADING_ITEMS)
        })

        test('when turned on, change alarm state', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            await doWiring()

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(settingsStorage.setMock.mock.calls.length).toBe(1)
            expect(settingsStorage.setMock.mock.calls[0].length).toBe(2)
            expect(settingsStorage.setMock.mock.calls[0][0]).toBe(STORAGE_ALARM)
            expect(settingsStorage.setMock.mock.calls[0][1]).toEqual({ isMonitoring: true })
        })

        // TODO: fix test case
        test.skip('when is off on alarm tick, dont send request for items', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            await doWiring()

            const alarmTick: () => Promise<void> = ajaxAlarm.listenMock.mock.calls[0][0]
            await alarmTick()

            expect(contentPort.sendMock.mock.calls.length).toBe(0)
        })

        test('when turned on and still time, dont request items', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            ajaxAlarm.isActiveMock.mockReturnValue(true)
            ajaxAlarm.getTimeLeftMock.mockReturnValue(TIME_1_MIN)
            await doWiring()

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(contentPort.sendMock.mock.calls.length).toBe(1)
            expect(contentPort.sendMock.mock.calls[0].length).toBe(2)
            expect(contentPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_CONTENT)
            expect(contentPort.sendMock.mock.calls[0][1]).toEqual({ isMonitoring: true })
        })

        // TODO: fix test case
        test.skip('when turned on and alarm is off, send request item', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            ajaxAlarm.isActiveMock.mockReturnValue(false)
            await doWiring()

            await contentPortManager.onConnect(contentPort)
            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(contentPort.sendMock.mock.calls.length).toBe(3)
            expect(contentPort.sendMock.mock.calls[1].length).toBe(2)
            expect(contentPort.sendMock.mock.calls[1][0]).toBe(MSG_NAME_REFRESH_ITEMS_AJAX)
            expect(contentPort.sendMock.mock.calls[1][1]).toEqual({ tag: undefined })
            expect(contentPort.sendMock.mock.calls[2].length).toBe(2)
            expect(contentPort.sendMock.mock.calls[2][0]).toBe(MSG_NAME_REFRESH_CONTENT)
            expect(contentPort.sendMock.mock.calls[2][1]).toEqual({ isMonitoring: true })
        })

        test('when websocket state changes, send it to content', async () => {
            await doWiring()

            const state = { code: WebSocketStateCode.connected, message: 'test' }
            await webSocketClient.onStateChanged(state)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual({ clientState: state })
        })
    })

    describe('storage', () => {
        // TODO: fix test case
        test.skip('when log is read expect the value on next run', async () => {
            await doWiring()
            await webSocketClient.onMessage({ type: 'log', data: '2024-12-23 17:08:58 [System] [] test' })
            await doWiring()
            await viewPortManager.onConnect(viewPort)

            const objData = { serial: 1, time: '2024-12-23 17:08:58', channel: 'System', player: '', message: 'test', data: {} }
            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual({ ...STATE_NO_DATA_MONITORING_ON, gameLog: { ...emptyGameLogData(), raw: [ objData ] } })
        })
    })

    describe('client', () => {
        test('when dispatch is received it is dispatched', async () => {
            await doWiring()
            await webSocketClient.onMessage({ type: 'dispatch', data: 'test' })

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_ACTION_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual({ action: 'test' })
        })
    })
})

describe('partial', () => {
    test('when request items expect on change', async () => {
        const onChange = jest.fn()
        const viewState = new ViewStateManager(undefined!, undefined!, undefined!, undefined!, undefined!, undefined!)
        viewState.onChange = onChange

        const contentTabManager = new ContentTabManager(new MockPortManager(), () => Promise.resolve(false))
        const refreshManager = new RefreshManager(undefined!, undefined!, undefined!, undefined!, undefined!, undefined!)
        await refreshManager.setContentTab(contentTabManager)
        refreshManager.subscribeOnChanged((status) => viewState.setStatus(status))
        await refreshManager.manualRefresh()

        expect(onChange.mock.calls.length).toBe(1)
    })
})
