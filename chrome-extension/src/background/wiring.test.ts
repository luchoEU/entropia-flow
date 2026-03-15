import { describe, expect, beforeEach, test } from "@jest/globals"
import MemoryStorageArea from "../chrome/memoryStorageArea"
import MockActionManager from "../chrome/mockActionManager"
import MockAlarmManager from "../chrome/mockAlarmManager"
import MockApiStorage from "../chrome/mockApiStorage"
import MockMessagesHub from "../chrome/mockMessages"
import MockPortManager, { MockPort } from "../chrome/mockPort"
import MockStorageArea from "../chrome/mockStorageArea"
import MockTabManager from "../chrome/mockTab"
import {
    MSG_NAME_ACTION_VIEW,
    MSG_NAME_NEW_INVENTORY,
    MSG_NAME_REFRESH_VIEW,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REQUEST_NEW,
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
    STATE_LOADING_PAGE_MONITORING_OFF,
    STATE_NO_DATA_MONITORING_OFF,
    STATE_NO_DATA_MONITORING_ON,
    STATE_PLEASE_LOG_IN_MONITORING_ON,
    STATE_UPDATES_NOW,
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
    let apiStorage: MockApiStorage

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
            tabStorage, settingsStorage, apiStorage, () => Promise.resolve(false), (d: boolean) => `logo ${d ? "white" : "black"}`, false);

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
        apiStorage = new MockApiStorage()
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
        // TODO: fix test case
        test.skip('when is off on alarm tick, dont send request for items', async () => {
            settingsStorage.getMock.mockReturnValue({ isMonitoring: false })
            await doWiring()

            const alarmTick: () => Promise<void> = ajaxAlarm.listenMock.mock.calls[0][0]
            await alarmTick()

            expect(contentPort.sendMock.mock.calls.length).toBe(0)
        })

        test('when websocket state changes, send it to content', async () => {
            await doWiring()

            const state = { code: WebSocketStateCode.connected, message: 'test' }
            await webSocketClient.onStateChanged(state)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual({ clientState: state, webSocketUrl: '' })
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
