//// WEB SOCKET ////
// Communication with Entropia Flow Client in Windows

import IWebSocketClient from "./webSocketInterface"

const DEFAULT_WEB_SOCKET_URL = 'ws://localhost:6521'

class WebSocketClient implements IWebSocketClient {
    private socket: WebSocket
    private pendingJson: Array<string>
    private url: string
    public onMessage: (msg: any) => Promise<void>
    public onStateChanged: (state: string, message: string) => Promise<void>

    constructor() {
        this.pendingJson = []
    }

    public async start(url: string): Promise<void> {
        if (this.socket)
            this.socket.close()

        if (!url || !url.startsWith('ws:')) {
            await this.onStateChanged('error', `invalid url ${url}`)
            return // invalid url
        }

        this.url = url
        await this.onStateChanged(`connecting to ${url} ...`, '')
        try {
            this.socket = new WebSocket(url)
        } catch (error) {
            console.error('WebSocket connection failed:', error)
            await this.onStateChanged('error', 'connection failed')
            return
        }
        this.socket.onopen = async event => {
            console.log('WebSocket connection opened:', event)
            await this.onStateChanged(`connected to ${url}`, '')
            this.send('version', '0.2.0')
            for (const json in this.pendingJson)
                this.socket.send(json)
            this.pendingJson = []
        };
        this.socket.onmessage = async event => {
            console.log('WebSocket message received:', event.data)
            await this.onMessage(event.data)
        };
        this.socket.onerror = async event => {
            console.error('WebSocket error:', event)
            await this.onStateChanged('error', '')
        };
        this.socket.onclose = async event => {
            console.log('WebSocket connection closed:', event)
            await this.onStateChanged('disconnected', '')
        };
    }

    public async send(type: string, data: any): Promise<void> {
        const json = JSON.stringify({ type, data })
        if (!this.socket) {
            this.pendingJson.push(json);
        } else if (this.socket.readyState == WebSocket.OPEN) {
            this.socket.send(json);
        } else if (this.socket.readyState == WebSocket.CLOSED) {
            //this.pendingJson.push(json);
            //await this.start(this.url) // reconnect for the next message
        }
    }

    public async close(): Promise<void> {
        if (this.socket)
            this.socket.close();
    }
}

export default WebSocketClient
export {
    DEFAULT_WEB_SOCKET_URL
}