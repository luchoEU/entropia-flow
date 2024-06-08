interface IWebSocketClient {
    start(url: string): Promise<void>
    send(type: string, data: any): Promise<void>
    close(): Promise<void>
    onMessage: (msg: any) => Promise<void>
    onStateChanged: (state: string, message: string) => Promise<void>
}

export default IWebSocketClient
