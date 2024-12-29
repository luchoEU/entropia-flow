interface IWebSocketClient {
    start(url: string): Promise<void>
    send(type: string, data: any): Promise<void>
    close(): Promise<void>
    onMessage: (msg: any) => Promise<void>
    getState(): WebSocketState
    onStateChanged: (state: WebSocketState) => Promise<void>
}

enum WebSocketStateCode {
    connecting,
    connected,
    disconnected,
    error
}

interface WebSocketState {
    code: WebSocketStateCode
    message: string
}

export default IWebSocketClient
export {
    WebSocketStateCode,
    WebSocketState
}
