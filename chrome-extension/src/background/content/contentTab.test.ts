import MockAlarmManager from "../../chrome/alarmMock"
import MockPortManager, { MockPort } from "../../chrome/portMock"
import {
    CLASS_ERROR,
    CLASS_INFO,
    MSG_NAME_REFRESH_ITEMS_AJAX,
    STRING_LOADING,
    STRING_PLEASE_LOG_IN
} from "../../common/const"
import { traceOff } from "../../common/trace"
import ContentTabManager from "./contentTab"

traceOff()

//// Constants ////

const TAG = 1

//// Tests ////

describe('content', () => {
    let ports: MockPortManager
    let onMessage: jest.Mock<any, any>
    let contentTabManager: ContentTabManager

    beforeEach(() => {
        ports = new MockPortManager()
        onMessage = jest.fn()
        contentTabManager = new ContentTabManager(ports)
        contentTabManager.onMessage = onMessage
    })

    test('when request with port expect loading', async () => {
        const port = new MockPort()
        ports.firstMock.mockReturnValue(port)

        await contentTabManager.requestItemsAjax(TAG)

        expect(port.sendMock.mock.calls.length).toBe(1)
        expect(port.sendMock.mock.calls[0].length).toBe(2)
        expect(port.sendMock.mock.calls[0][0]).toBe(MSG_NAME_REFRESH_ITEMS_AJAX)
        expect(port.sendMock.mock.calls[0][1]).toEqual({ tag: TAG })
        expect(onMessage.mock.calls.length).toBe(1)
        expect(onMessage.mock.calls[0].length).toBe(2)
        expect(onMessage.mock.calls[0][0]).toBe(CLASS_INFO)
        expect(onMessage.mock.calls[0][1]).toBe(STRING_LOADING)
    })

    test('when request without port expect login error', async () => {
        ports.firstMock.mockReturnValue(undefined)

        await contentTabManager.requestItemsAjax(TAG)

        expect(onMessage.mock.calls.length).toBe(1)
        expect(onMessage.mock.calls[0].length).toBe(2)
        expect(onMessage.mock.calls[0][0]).toBe(CLASS_ERROR)
        expect(onMessage.mock.calls[0][1]).toBe(STRING_PLEASE_LOG_IN)
    })
})
