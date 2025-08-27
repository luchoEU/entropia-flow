import { ChromeMessagesClient } from "../../../chrome/chromeMessages"
import { LOCAL_STORAGE, SYNC_STORAGE } from "../../../chrome/chromeStorageArea"
import { PortHandler } from "../../../chrome/IPort"
import { MSG_NAME_REFRESH_VIEW, MSG_NAME_REGISTER_VIEW, MSG_NAME_REQUEST_NEW, MSG_NAME_REQUEST_SET_LAST, MSG_NAME_REQUEST_TIMER_OFF, MSG_NAME_REQUEST_TIMER_ON, PORT_NAME_BACK_VIEW, MSG_NAME_SET_WEB_SOCKET_URL, MSG_NAME_RETRY_WEB_SOCKET, MSG_NAME_ACTION_VIEW, MSG_NAME_NOTIFICATION_VIEW, MSG_NAME_BLUEPRINT_LIST, MSG_NAME_STORAGE_CHANGED, MSG_NAME_SET_SHOWING_LAYOUT_ID } from "../../../common/const"
import { traceId } from "../../../common/trace"

let messagesClient: ChromeMessagesClient

function initMessageClient(refreshViewHandler: PortHandler, dispatchHandler: PortHandler, notificationHandler: PortHandler, blueprintListHandler: PortHandler) {
    messagesClient = new ChromeMessagesClient(
        MSG_NAME_REGISTER_VIEW,
        PORT_NAME_BACK_VIEW, {
            [MSG_NAME_REFRESH_VIEW]: refreshViewHandler,
            [MSG_NAME_ACTION_VIEW]: dispatchHandler,
            [MSG_NAME_NOTIFICATION_VIEW]: notificationHandler,
            [MSG_NAME_BLUEPRINT_LIST]: blueprintListHandler
        }
    )
    LOCAL_STORAGE.onStorageChanged = (name: string) => {
        messagesClient.send(MSG_NAME_STORAGE_CHANGED, { store: name })
    }
    SYNC_STORAGE.onStorageChanged = (name: string) => {
        messagesClient.send(MSG_NAME_STORAGE_CHANGED, { store: name })
    }
}

function requestRefresh(forced: boolean): boolean {
    return messagesClient.send(MSG_NAME_REQUEST_NEW, { tag: { requested: true }, forced })
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

function setShowingLayoutId(layoutId: string): boolean {
    return messagesClient.send(MSG_NAME_SET_SHOWING_LAYOUT_ID, { layoutId })
}

function setWebSocketUrl(url: string): boolean {
    return messagesClient.send(MSG_NAME_SET_WEB_SOCKET_URL, { url })
}

function retryWebSocket() {
    return messagesClient.send(MSG_NAME_RETRY_WEB_SOCKET)
}

traceId('V')

export default {
    initMessageClient,
    requestRefresh,
    requestSetLast,
    requestTimerOn,
    requestTimerOff,
    setShowingLayoutId,
    setWebSocketUrl,
    retryWebSocket
}
