import { WebSocketStateCode } from "../../../background/client/webSocketInterface"
import { ConnectionState } from "../state/connection"

const SET_CONNECTION_STATE = "[connection] set state"
const WEB_SOCKET_CHANGED = "[connection] web socket changed"
const WEB_SOCKET_RETRY = "[connection] web socket retry"
const WEB_SOCKET_STATE_CHANGED = "[connection] web socket state changed"
const SET_CONNECTION_STATUS = "[connection] set status"

const setConnectionState = (state: ConnectionState) => ({
    type: SET_CONNECTION_STATE,
    payload: {
        state
    }
})

const webSocketConnectionChanged = (webSocket: string) => ({
    type: WEB_SOCKET_CHANGED,
    payload: {
        webSocket
    }
})

const webSocketRetry = {
    type: WEB_SOCKET_RETRY
}

const webSocketStateChanged = (code: WebSocketStateCode) => ({
    type: WEB_SOCKET_STATE_CHANGED,
    payload: {
        code
    }
})

const setConnectionStatus = (status: string) => ({
    type: SET_CONNECTION_STATUS,
    payload: {
        status
    }
})

export {
    SET_CONNECTION_STATE,
    WEB_SOCKET_CHANGED,
    WEB_SOCKET_RETRY,
    WEB_SOCKET_STATE_CHANGED,
    SET_CONNECTION_STATUS,
    setConnectionState,
    webSocketConnectionChanged,
    webSocketStateChanged,
    setConnectionStatus,
    webSocketRetry
}
