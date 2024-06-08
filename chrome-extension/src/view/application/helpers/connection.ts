import { DEFAULT_WEB_SOCKET_URL } from "../../../background/client/webSocketClient"
import { ConnectionState } from "../state/connection"

const initialState: ConnectionState = {
    client: {
        expanded: true,
        webSocket: DEFAULT_WEB_SOCKET_URL,
        status: 'initializing',
        message: ''
    }
}

const setState = (state: ConnectionState, inState: ConnectionState) => inState

const setConnectionClientExpanded = (state: ConnectionState, expanded: boolean) => ({
    ...state,
    client: {
        ...state.client,
        expanded
    }
})

const setConnectionWebSocket = (state: ConnectionState, webSocket: string) => ({
    ...state,
    client: {
        ...state.client,
        webSocket
    }
})

const setConnectionStatus = (state: ConnectionState, status: string, message: string) => ({
    ...state,
    client: {
        ...state.client,
        status,
        message
    }
})

export {
    initialState,
    setState,
    setConnectionClientExpanded,
    setConnectionWebSocket,
    setConnectionStatus
}
