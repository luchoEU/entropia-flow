import { ConnectionState } from "../state/connection"

const DEFAULT_WEB_SOCKET_URL = 'ws://localhost:6521'

const initialState: ConnectionState = {
    client: {
        webSocket: DEFAULT_WEB_SOCKET_URL,
        status: 'initializing'
    }
}

const reduceSetState = (state: ConnectionState, inState: ConnectionState) => inState

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
    reduceSetConnectionWebSocket,
    reduceSetConnectionStatus
}
