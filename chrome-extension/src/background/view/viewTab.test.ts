import MockPortManager, { MockPort } from "../../chrome/portMock"
import MockStorageArea from "../../chrome/storageAreaMock"
import { CLASS_INFO, MSG_NAME_REFRESH_VIEW, STRING_LOADING } from "../../common/const"
import { traceOff } from "../../common/trace"
import AlarmSettings from "../settings/alarmSettings"
import { STATE_LOADING } from "../stateConst"
import ViewStateManager from "./viewState"
import ViewTabManager from "./viewTab"

traceOff()

describe('view tab', () => {
    test('on change', async () => {
        const port = new MockPort()
        const portManager = new MockPortManager()
        portManager.allMock.mockReturnValue([port])
        portManager.firstMock.mockReturnValue(port)
        portManager.isEmptyMock.mockReturnValue(false)

        const alarmStorage = new MockStorageArea()
        const alarmSettings = new AlarmSettings(alarmStorage)
        const viewState = new ViewStateManager(undefined, alarmSettings, undefined, undefined)
        const viewTab = new ViewTabManager(portManager, viewState, undefined)
        await viewState.setStatus(CLASS_INFO, STRING_LOADING)

        expect(portManager.allMock.mock.calls.length).toBe(1)
        expect(port.sendMock.mock.calls.length).toBe(1)
        expect(port.sendMock.mock.calls[0].length).toBe(2)
        expect(port.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_VIEW)
        expect(port.sendMock.mock.calls[0][1]).toEqual(STATE_LOADING)
    })
})