interface IWebSocketClient {
    start()
    send(type: string, data: any)
    close()
    onMessage: (msg: any) => Promise<void>
    onStateChanged: (state: string, message: string) => Promise<void>
}

export default IWebSocketClient
