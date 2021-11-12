import MockActionManager from "../chrome/actionMock"
import MockAlarmManager from "../chrome/alarmMock"
import MockMessagesHub from "../chrome/messagesMock"
import MockPortManager, { MockPort } from "../chrome/portMock"
import MockStorageArea from "../chrome/storageAreaMock"
import MockTabManager from "../chrome/tabsMock"
import {
    MSG_NAME_REFRESH_CONTENT,
    MSG_NAME_REFRESH_ITEMS,
    MSG_NAME_REFRESH_VIEW,
    MSG_NAME_REGISTER_CONTENT,
    MSG_NAME_REGISTER_VIEW,
    MSG_NAME_REQUEST_NEW,
    MSG_NAME_REQUEST_TIMER_OFF,
    MSG_NAME_REQUEST_TIMER_ON,
    PORT_NAME_BACK_CONTENT,
    PORT_NAME_BACK_VIEW,
    STORAGE_ALARM,
    STRING_ALARM_OFF
} from "../common/const"
import { setMockDate } from "../common/state"
import { traceOff } from "../common/trace"
import ContentTabManager from "./content/contentTab"
import MockBackendServerManager from "./server/backendMock"
import AlarmSettings from "./settings/alarmSettings"
import {
    DATE_CONST,
    STATE_1_MIN,
    STATE_AUTO_REQUEST_OFF,
    STATE_LOADING,
    STATE_NO_DATA_1_MIN,
    STATE_NO_DATA_AUTO_REQUEST_OFF,
    STATE_NO_DATA_PLEASE_LOG_IN,
    STATE_PLEASE_LOG_IN,
    TIME_1_MIN
} from "./stateConst"
import ViewStateManager from "./view/viewState"
import wiring from "./wiring"

traceOff()

describe('full', () => {
    let messages: MockMessagesHub
    let alarms: MockAlarmManager
    let tabs: MockTabManager
    let actions: MockActionManager
    let server: MockBackendServerManager
    let portManagerFactory: jest.Mock<any, any>
    let contentPortManager: MockPortManager
    let viewPortManager: MockPortManager
    let contentPort: MockPort
    let viewPort: MockPort
    let inventoryStorage: MockStorageArea
    let listStorage: MockStorageArea
    let settingsStorage: MockStorageArea

    beforeEach(async () => {
        messages = new MockMessagesHub()
        alarms = new MockAlarmManager()
        tabs = new MockTabManager()
        actions = new MockActionManager()
        server = new MockBackendServerManager()
        contentPortManager = new MockPortManager()
        viewPortManager = new MockPortManager()
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

        inventoryStorage = new MockStorageArea()
        listStorage = new MockStorageArea()
        settingsStorage = new MockStorageArea()
        await wiring(messages, alarms, tabs, actions, server, portManagerFactory, inventoryStorage, listStorage, settingsStorage)
    })

    test('init', () => {
        // alarm listen
        expect(alarms.listenMock.mock.calls.length).toBe(1)
        expect(alarms.listenMock.mock.calls[0].length).toBe(1)

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

    describe("when view started", () => {
        test('without monitoring expect monitor off message', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })
            setMockDate(DATE_CONST)

            await viewPortManager.onConnect(viewPort)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_NO_DATA_AUTO_REQUEST_OFF)
        })

        test('with monitoring and same time expect please log in', async () => {
            settingsStorage.getMock.mockReturnValueOnce({ lastRefresh: 1 })
            settingsStorage.getMock.mockReturnValueOnce({ autoRequest: true })
            alarms.getTimeLeftMock.mockReturnValue(TIME_1_MIN)
            setMockDate(DATE_CONST)

            await viewPortManager.onConnect(viewPort)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_NO_DATA_1_MIN)
        })

        test('with monitoring no time expect please log in', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: true })
            setMockDate(DATE_CONST)

            await viewPortManager.onConnect(viewPort)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_NO_DATA_PLEASE_LOG_IN)
        })
    })

    describe('request items', () => {
        test('when time and no content expect please log in', async () => {
            contentPortManager.firstMock.mockReturnValue(undefined)

            await viewPortManager.handlers[MSG_NAME_REQUEST_NEW]({ tag: undefined })

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_PLEASE_LOG_IN)
        })
    })

    describe('alarm', () => {
        test('when tick, send view request', async () => {
            const alarmTick: () => Promise<void> = alarms.listenMock.mock.calls[0][0]
            await alarmTick()
            expect(viewPort.sendMock.mock.calls.length).toBe(1)
        })

        test('when content connect, start it', async () => {
            contentPortManager.onConnect(contentPort)
            expect(alarms.startMock.mock.calls.length).toBe(1)
        })
    })

    describe('auto request', () => {
        test("when turned off, don't stop alarm", async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: true })

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_OFF](undefined)

            expect(alarms.endMock.mock.calls.length).toBe(0)
        })

        test("when turned off, change view state", async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: true })

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_OFF](undefined)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_AUTO_REQUEST_OFF)
        })

        test('when turned off, change alarm state', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: true })

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_OFF](undefined)

            expect(settingsStorage.setMock.mock.calls.length).toBe(1)
            expect(settingsStorage.setMock.mock.calls[0].length).toBe(2)
            expect(settingsStorage.setMock.mock.calls[0][0]).toBe(STORAGE_ALARM)
            expect(settingsStorage.setMock.mock.calls[0][1]).toEqual({ autoRequest: false })
        })

        test('when turned on and still time, change view state', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })
            alarms.getTimeLeftMock.mockReturnValue(TIME_1_MIN)

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_1_MIN)
        })

        test('when turned on, alarm is off and content is up, change view state', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })
            alarms.getStatusMock.mockReturnValue(STRING_ALARM_OFF)

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_LOADING)
        })

        test('when turned on, alarm is off and content is down, change view state', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(viewPort.sendMock.mock.calls.length).toBe(1)
            expect(viewPort.sendMock.mock.calls[0].length).toBe(2)
            expect(viewPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
            expect(viewPort.sendMock.mock.calls[0][1]).toEqual(STATE_PLEASE_LOG_IN)
        })

        test('when turned on, change alarm state', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(settingsStorage.setMock.mock.calls.length).toBe(1)
            expect(settingsStorage.setMock.mock.calls[0].length).toBe(2)
            expect(settingsStorage.setMock.mock.calls[0][0]).toBe(STORAGE_ALARM)
            expect(settingsStorage.setMock.mock.calls[0][1]).toEqual({ autoRequest: true })
        })

        test('when is off on alarm tick, dont send request for items', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })

            const alarmTick: () => Promise<void> = alarms.listenMock.mock.calls[0][0]
            await alarmTick()

            expect(contentPort.sendMock.mock.calls.length).toBe(0)
        })

        test('when turned on and still time, dont request items', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })
            alarms.getTimeLeftMock.mockReturnValue(TIME_1_MIN)

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(contentPort.sendMock.mock.calls.length).toBe(1)
            expect(contentPort.sendMock.mock.calls[0].length).toBe(2)
            expect(contentPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_CONTENT)
            expect(contentPort.sendMock.mock.calls[0][1]).toEqual({ isMonitoring: true })
        })

        test('when turned on and alarm is off, send request item', async () => {
            settingsStorage.getMock.mockReturnValue({ autoRequest: false })
            alarms.getStatusMock.mockReturnValue(STRING_ALARM_OFF)

            await viewPortManager.handlers[MSG_NAME_REQUEST_TIMER_ON](undefined)

            expect(contentPort.sendMock.mock.calls.length).toBe(2)
            expect(contentPort.sendMock.mock.calls[0].length).toBe(2)
            expect(contentPort.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_ITEMS)
            expect(contentPort.sendMock.mock.calls[0][1]).toEqual({ tag: undefined })
            expect(contentPort.sendMock.mock.calls[1].length).toBe(2)
            expect(contentPort.sendMock.mock.calls[1][0]).toBe(MSG_NAME_REFRESH_CONTENT)
            expect(contentPort.sendMock.mock.calls[1][1]).toEqual({ isMonitoring: true })
        })
    })
})

describe('partial', () => {
    test('when request items expect on change', async () => {
        const onChange = jest.fn()
        const alarmStorage = new MockStorageArea()
        const viewState = new ViewStateManager(undefined, new AlarmSettings(alarmStorage), undefined, undefined)
        viewState.onChange = onChange

        const contentTabManager = new ContentTabManager(new MockPortManager())
        contentTabManager.onMessage = (c, m) => viewState.setStatus(c, m)
        await contentTabManager.requestItems()

        expect(onChange.mock.calls.length).toBe(1)
    })
})
