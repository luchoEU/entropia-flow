interface IWebSocketClient {
    start(url: string): Promise<void>
    send(type: string, data: any): Promise<void>
    close(): Promise<void>
    onMessage: (msg: any) => Promise<void>
    getState(): WebSocketState
    onStateChanged: (state: string, message: string) => Promise<void>
}

interface WebSocketState {
    state: string
    message: string
}

export default IWebSocketClient
export {
    WebSocketState
}
