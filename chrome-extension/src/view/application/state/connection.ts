interface ConnectionClient {
    expanded: boolean
    webSocket: string
}

interface ConnectionState {
    client: ConnectionClient
}

export {
    ConnectionState
}
