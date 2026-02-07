const DEFAULT_WEB_SOCKET_URL = 'ws://localhost:6522'

interface ConnectionClient {
    webSocket: string
    status: string
}

interface ConnectionState {
    client: ConnectionClient
}

const initialState: ConnectionState = {
    client: {
        webSocket: DEFAULT_WEB_SOCKET_URL,
        status: 'initializing'
    }
}

const cleanForSave = (state: ConnectionState): ConnectionState => ({
    ...state,
    client: {
        ...state.client,
        status: undefined!
    }
})

export {
    ConnectionState,
    initialState,
    cleanForSave
}
