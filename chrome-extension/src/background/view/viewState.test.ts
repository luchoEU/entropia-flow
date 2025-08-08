import MockAlarmManager from "../../chrome/mockAlarmManager"
import MockStorageArea from "../../chrome/mockStorageArea"
import { STATE_LOADING_ITEMS, STATE_UPDATES_1_MIN, TIME_1_MIN } from "../stateConst"
import AlarmSettings from "../settings/alarmSettings"
import ViewStateManager from "./viewState"
import RefreshManager from "../content/refreshManager"
import MockPortManager from "../../chrome/mockPort"

describe('view state', () => {
    test('when setStatus expect onChange', async () => {
        const onChange = jest.fn()
        const alarmStorage = new MockStorageArea()
        const alarmSettings = new AlarmSettings(alarmStorage)
        const viewState = new ViewStateManager(undefined, undefined, undefined, undefined, undefined)
        viewState.onChange = onChange

        await viewState.setStatus(STATE_LOADING_ITEMS.status)

        expect(onChange.mock.calls.length).toBe(1)
        expect(onChange.mock.calls[0].length).toBe(1)
        expect(onChange.mock.calls[0][0]).toEqual(STATE_LOADING_ITEMS)
    })

    test('when setStatus undefined expect onChange with time', async () => {
        const onChange = jest.fn()
        const alarm = new MockAlarmManager()
        const alarmStorage = new MockStorageArea();
        const alarmSettings = new AlarmSettings(alarmStorage);
        const refreshManager = new RefreshManager(alarm, undefined!, undefined!, undefined!, undefined!, alarmSettings)
        const contentPortManager = new MockPortManager()
        contentPortManager.allMock.mockReturnValue([])
        const viewState = new ViewStateManager(refreshManager, undefined!, undefined!, undefined!, undefined!)
        viewState.onChange = onChange
        refreshManager.setViewStatus = (status) => viewState.setStatus(status)
        alarm.getTimeLeftMock.mockReturnValue(TIME_1_MIN)

        await refreshManager.setTimerOn()

        expect(onChange.mock.calls.length).toBe(1)
        expect(onChange.mock.calls[0].length).toBe(1)
        expect(onChange.mock.calls[0][0]).toEqual(STATE_UPDATES_1_MIN)
    })
})
