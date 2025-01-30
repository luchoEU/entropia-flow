//// WEB SOCKET ////
// Communication with Entropia Flow Client in Windows

import { traceData, traceError } from "../../common/trace"
import { VERSION } from "../../view/components/about/AboutPage"
import IWebSocketClient, { WebSocketState, WebSocketStateCode } from "./webSocketInterface"

const DEFAULT_WEB_SOCKET_URL = 'ws://localhost:6521'

class WebSocketClient implements IWebSocketClient {
    private socket: WebSocket
    private pendingJson: Array<string>
    private url: string
    private state: WebSocketState
    public onMessage: (msg: any) => Promise<void>
    public onStateChanged: (state: WebSocketState) => Promise<void>

    constructor() {
        this.pendingJson = []
        this.state = { code: WebSocketStateCode.disconnected, message: 'not connected' }
    }

    public async start(url: string): Promise<void> {
        if (this.url === url && this.socket?.readyState == WebSocket.OPEN)
            return // don't reconnect to the same place since it will fail because the client needs a few seconds to be available again

        if (this.socket)
            this.socket.close()

        if (!url || !url.startsWith('ws:')) {
            await this._setState(WebSocketStateCode.error, `invalid url ${url}`)
            return // invalid url
        }

        this.url = url
        await this._setState(WebSocketStateCode.connecting, `connecting to ${url} ...`)
        try {
            this.socket = new WebSocket(url)
        } catch (e) {
            traceError('WebSocketClient', 'connection failed:', e);
            await this._setState(WebSocketStateCode.error, 'connection failed')
            return
        }
        this.socket.onopen = async event => {
            traceData('WebSocketClient', 'connection opened:', event)

            this.socket.onmessage = async event => {
                traceData('WebSocketClient', 'message received:', event.data)
                await this.onMessage(JSON.parse(event.data))
            };
            this.socket.onclose = async event => {
                traceData('WebSocketClient', 'connection closed:', event)
                await this._setState(WebSocketStateCode.disconnected, 'disconnected')
            };

            await this._setState(WebSocketStateCode.connected, `connected to ${url}`)
            this.send('version', VERSION)
            for (const json in this.pendingJson)
                this.socket.send(json)
            this.pendingJson = []
        };
        this.socket.onerror = async event => {
            traceError('WebSocketClient', 'error:', event)
            await this._setState(WebSocketStateCode.error, 'error')
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

    private _setState(code: WebSocketStateCode, message: string): void {
        this.state = { code, message }
        this.onStateChanged?.(this.state)
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