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

const reduceSetState = (state: ConnectionState, inState: ConnectionState) => inState

const reduceSetConnectionClientExpanded = (state: ConnectionState, expanded: boolean) => ({
    ...state,
    client: {
        ...state.client,
        expanded
    }
})

const reduceSetConnectionWebSocket = (state: ConnectionState, webSocket: string) => ({
    ...state,
    client: {
        ...state.client,
        webSocket
    }
})

const reduceSetConnectionStatus = (state: ConnectionState, status: string, message: string) => ({
    ...state,
    client: {
        ...state.client,
        status,
        message
    }
})

const cleanForSave = (state: ConnectionState): ConnectionState => ({
    ...state,
    client: {
        ...state.client,
        status: undefined,
        message: undefined
    }
})

export {
    initialState,
    cleanForSave,
    reduceSetState,
    reduceSetConnectionClientExpanded,
    reduceSetConnectionWebSocket,
    reduceSetConnectionStatus
}
