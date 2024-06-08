interface ConnectionClient {
    expanded: boolean
    webSocket: string
    status: string
    message: string
}

interface ConnectionState {
    client: ConnectionClient
}

export {
    ConnectionState
}
