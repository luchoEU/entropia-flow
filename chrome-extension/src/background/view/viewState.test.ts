import MockAlarmManager from "../../chrome/alarmMock"
import MockStorageArea from "../../chrome/storageAreaMock"
import { CLASS_INFO, STRING_LOADING } from "../../common/const"
import { STATE_1_MIN, STATE_LOADING, TIME_1_MIN } from "../stateConst"
import AlarmSettings from "../settings/alarmSettings"
import ViewStateManager from "./viewState"

describe('view state', () => {
    test('when setStatus expect onChange', async () => {
        const onChange = jest.fn()
        const alarmStorage = new MockStorageArea()
        const alarmSettings = new AlarmSettings(alarmStorage)
        const viewState = new ViewStateManager(undefined, alarmSettings, undefined, undefined)
        viewState.onChange = onChange

        await viewState.setStatus(CLASS_INFO, STRING_LOADING)

        expect(onChange.mock.calls.length).toBe(1)
        expect(onChange.mock.calls[0].length).toBe(1)
        expect(onChange.mock.calls[0][0]).toEqual(STATE_LOADING)
    })

    test('when setStatus undefined expect onChange with time', async () => {
        const onChange = jest.fn()
        const alarms = new MockAlarmManager()
        const alarmStorage = new MockStorageArea()
        const alarmSettings = new AlarmSettings(alarmStorage)
        const viewState = new ViewStateManager(alarms, alarmSettings, undefined, undefined)
        viewState.onChange = onChange
        alarms.getTimeLeftMock.mockReturnValue(TIME_1_MIN)

        await viewState.setStatus(undefined, undefined)

        expect(onChange.mock.calls.length).toBe(1)
        expect(onChange.mock.calls[0].length).toBe(1)
        expect(onChange.mock.calls[0][0]).toEqual(STATE_1_MIN)
    })
})