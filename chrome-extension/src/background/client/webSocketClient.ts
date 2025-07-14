//// WEB SOCKET ////
// Communication with Entropia Flow Client in Windows

import { Component, trace, traceError } from "../../common/trace"
import { VERSION } from "../../view/components/about/AboutPage"
import IWebSocketClient, { WebSocketState, WebSocketStateCode } from "./webSocketInterface"

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
            traceError(Component.WebSocketClient, 'connection failed:', e);
            await this._setState(WebSocketStateCode.error, 'connection failed')
            return
        }
        this.socket.onopen = async event => {
            trace(Component.WebSocketClient, 'connection opened:', event)

            this.socket.onmessage = async event => {
                trace(Component.WebSocketClient, 'message received:', event.data)
                this.onMessage(JSON.parse(event.data))
            };
            this.socket.onclose = async event => {
                trace(Component.WebSocketClient, 'connection closed:', event)
                this._setState(WebSocketStateCode.disconnected, 'disconnected')
            };

            this._setState(WebSocketStateCode.connected, `connected to ${url}`)
            this.send('identify', null)
            this.send('version', VERSION)
            for (const json in this.pendingJson)
                this.socket.send(json)
            this.pendingJson = []
        };
        this.socket.onerror = async event => {
            traceError(Component.WebSocketClient, 'error:', event)
            this._setState(WebSocketStateCode.error, 'error')
        };
    }

    public async send(type: string, data: any): Promise<void> {
        const json = JSON.stringify({ type, data, from: 'chrome-extension', to: 'entropia-flow-client' })
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
