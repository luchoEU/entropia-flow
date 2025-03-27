interface ConnectionClient {
    webSocket: string
    status: string
}

interface ConnectionState {
    client: ConnectionClient
}

export {
    ConnectionState
}
