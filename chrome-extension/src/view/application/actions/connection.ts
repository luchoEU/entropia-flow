import { ConnectionState } from "../state/connection"

const SET_CONNECTION_STATE = "[connection] set state"
const SET_CONNECTION_CLIENT_EXPANDED = "[connection] set client expanded"
const WEB_SOCKET_CHANGED = "[connection] web socket changed"
const SET_CONNECTION_STATUS = "[connection] set status"

const setConnectionState = (state: ConnectionState) => ({
    type: SET_CONNECTION_STATE,
    payload: {
        state
    }
})

const setConnectionClientExpanded = (expanded: boolean) => ({
    type: SET_CONNECTION_CLIENT_EXPANDED,
    payload: {
        expanded
    }
})

const webSocketConnectionChanged = (webSocket: string) => ({
    type: WEB_SOCKET_CHANGED,
    payload: {
        webSocket
    }
})

const setConnectionStatus = (status: string, message: string) => ({
    type: SET_CONNECTION_STATUS,
    payload: {
        status,
        message
    }
})

export {
    SET_CONNECTION_STATE,
    SET_CONNECTION_CLIENT_EXPANDED,
    WEB_SOCKET_CHANGED,
    SET_CONNECTION_STATUS,
    setConnectionState,
    setConnectionClientExpanded,
    webSocketConnectionChanged,
    setConnectionStatus
}
