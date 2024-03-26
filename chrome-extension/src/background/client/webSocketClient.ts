//// WEB SOCKET ////
// Communication with Entropia Flow Client in Windows

import IWebSocketClient from "./webSocketInterface"

class WebSocketClient implements IWebSocketClient {
    private socket: WebSocket
    private pendingJson: string
    public onMessage: (msg: any) => Promise<void>
    public onStateChanged: (state: string, message: string) => Promise<void>

    public start() {
        this.socket = new WebSocket('ws://192.168.1.34:6521')
        this.socket.onopen = async event => {
            console.log('WebSocket connection opened:', event)
            await this.onStateChanged('connected', '')
            this.send('version', '0.2.0')
            if (this.pendingJson) {
                this.socket.send(this.pendingJson)
                this.pendingJson = null
            }
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
            await this.onStateChanged('closed', '')
        };
    }

    public send(type: string, data: any) {
        const json = JSON.stringify({ type, data })
        if (this.socket.readyState == WebSocket.OPEN) {
            this.socket.send(json);
        } else if (this.socket.readyState == WebSocket.CLOSED) {
            this.pendingJson = json;
            this.start() // reconnect for the next message
        }
    }

    public close() {
        this.socket.close();
    }
}

export default WebSocketClient