import { ChromeMessagesClient } from "../../../chrome/chromeMessages"
import { PortHandler } from "../../../chrome/IPort"
import { MSG_NAME_REFRESH_VIEW, MSG_NAME_REGISTER_VIEW, MSG_NAME_REQUEST_NEW, MSG_NAME_REQUEST_SET_LAST, MSG_NAME_REQUEST_TIMER_OFF, MSG_NAME_REQUEST_TIMER_ON, PORT_NAME_BACK_VIEW, MSG_NAME_SEND_WEB_SOCKET_MESSAGE, MSG_NAME_SET_WEB_SOCKET_URL } from "../../../common/const"
import { traceId } from "../../../common/trace"

let messagesClient: ChromeMessagesClient

function initMessageClient(refreshViewHandler: PortHandler) {
    messagesClient = new ChromeMessagesClient(
        MSG_NAME_REGISTER_VIEW,
        PORT_NAME_BACK_VIEW, {
        [MSG_NAME_REFRESH_VIEW]: refreshViewHandler
    })
}

function requestRefresh(): boolean {
    return messagesClient.send(MSG_NAME_REQUEST_NEW, { tag: { requested: true } })
}

function requestSetLast(addTag: boolean, last: number): boolean {
    return messagesClient.send(MSG_NAME_REQUEST_SET_LAST, { tag: addTag ? { last: true } : undefined, last })
}

function requestTimerOn(): boolean {
    return messagesClient.send(MSG_NAME_REQUEST_TIMER_ON)
}

function requestTimerOff(): boolean {
    return messagesClient.send(MSG_NAME_REQUEST_TIMER_OFF)
}

function sendWebSocketMessage(type: string, data: any) {
    if (messagesClient) {
        return messagesClient.send(MSG_NAME_SEND_WEB_SOCKET_MESSAGE, { type, data })
    }
    return false
}

function setWebSocketUrl(url: string): boolean {
    return messagesClient.send(MSG_NAME_SET_WEB_SOCKET_URL, { url })
}

traceId('V')

export default {
    initMessageClient,
    requestRefresh,
    requestSetLast,
    requestTimerOn,
    requestTimerOff,
    sendWebSocketMessage,
    setWebSocketUrl
}