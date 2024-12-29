interface ConnectionClient {
    expanded: boolean
    webSocket: string
    status: string
}

interface ConnectionState {
    client: ConnectionClient
}

export {
    ConnectionState
}
