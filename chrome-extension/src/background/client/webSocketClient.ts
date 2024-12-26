//// WEB SOCKET ////
// Communication with Entropia Flow Client in Windows

import IWebSocketClient, { WebSocketState } from "./webSocketInterface"

const DEFAULT_WEB_SOCKET_URL = 'ws://localhost:6521'

class WebSocketClient implements IWebSocketClient {
    private socket: WebSocket
    private pendingJson: Array<string>
    private url: string
    private state: WebSocketState
    public onMessage: (msg: any) => Promise<void>
    public onStateChanged: (state: string, message: string) => Promise<void>

    constructor() {
        this.pendingJson = []
    }

    public async start(url: string): Promise<void> {
        if (this.url === url && this.socket.readyState == WebSocket.OPEN)
            return // don't reconnect to the same place since it will fail because the client needs a few seconds to be available again

        if (this.socket)
            this.socket.close()

        if (!url || !url.startsWith('ws:')) {
            await this._setState('error', `invalid url ${url}`)
            return // invalid url
        }

        this.url = url
        await this._setState(`connecting to ${url} ...`, '')
        try {
            this.socket = new WebSocket(url)
        } catch (error) {
            console.error('WebSocket connection failed:', error)
            await this._setState('error', 'connection failed')
            return
        }
        this.socket.onopen = async event => {
            console.log('WebSocket connection opened:', event)

            this.socket.onmessage = async event => {
                console.log('WebSocket message received:', event.data)
                await this.onMessage(JSON.parse(event.data))
            };
            this.socket.onclose = async event => {
                console.log('WebSocket connection closed:', event)
                await this._setState('disconnected', '')
            };

            await this._setState(`connected to ${url}`, '')
            this.send('version', '0.2.0')
            for (const json in this.pendingJson)
                this.socket.send(json)
            this.pendingJson = []
        };
        this.socket.onerror = async event => {
            console.error('WebSocket error:', event)
            await this._setState('error', '')
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

    private _setState(state: string, message: string): void {
        this.state = { state, message }
        this.onStateChanged?.(state, message)
    }

    public getState(): WebSocketState { return this.state }

    public async close(): Promise<void> {
        if (this.socket)
            this.socket.close();
    }
}

export default WebSocketClient
export {
    DEFAULT_WEB_SOCKET_URL
}