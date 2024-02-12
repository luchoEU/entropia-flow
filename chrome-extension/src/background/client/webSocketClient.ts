//// WEB SOCKET ////
// Communication with Entropia Flow Client in Windows

class WebSocketClient {
    private socket: WebSocket
    public onMessage: (msg: any) => Promise<void>

    public start() {
        this.socket = new WebSocket('ws://192.168.1.34:6521')
        this.socket.onopen = event => {
            console.log('WebSocket connection opened:', event)
            this.send('version', '0.2.0')
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
        if (this.socket.readyState == WebSocket.OPEN) {
            const json = JSON.stringify({ type, data })
            this.socket.send(json);
        } else if (this.socket.readyState == WebSocket.CLOSED) {
            this.start() // reconnect for the next message
        }
    }

    public close() {
        this.socket.close();
    }
}

export default WebSocketClient