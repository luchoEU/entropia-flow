//// WEB SOCKET ////
// Communication with Entropia Flow Client in Windows

class WebSocketClient {
    private socket: WebSocket
    private pendingJson: string
    public onMessage: (msg: any) => Promise<void>

    public start() {
        this.socket = new WebSocket('ws://192.168.1.34:6521')
        this.socket.onopen = event => {
            console.log('WebSocket connection opened:', event)
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
        this.socket.onerror = event => {
            console.error('WebSocket error:', event)
        };
        this.socket.onclose = event => {
            console.log('WebSocket connection closed:', event)
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