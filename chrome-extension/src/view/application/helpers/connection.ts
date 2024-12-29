import { DEFAULT_WEB_SOCKET_URL } from "../../../background/client/webSocketClient"
import { ConnectionState } from "../state/connection"

const initialState: ConnectionState = {
    client: {
        expanded: true,
        webSocket: DEFAULT_WEB_SOCKET_URL,
        status: 'initializing'
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

const reduceSetConnectionStatus = (state: ConnectionState, status: string) => ({
    ...state,
    client: {
        ...state.client,
        status
    }
})

const cleanForSave = (state: ConnectionState): ConnectionState => ({
    ...state,
    client: {
        ...state.client,
        status: undefined
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
