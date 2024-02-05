//// WEB SOCKET ////

class WebSocketClient {
    private socket: WebSocket

    public start() {
        this.socket = new WebSocket('ws://192.168.1.34:6521');
        this.socket.addEventListener('open', (event) => {
            console.log('WebSocket connection opened:', event);
            this.socket.send('Hello, server!');
        });
        this.socket.addEventListener('message', (event) => {
            console.log('WebSocket message received:', event.data);
        });
        this.socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);
        });
        this.socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed:', event);
        });
    }

    public send(msg: any) {
        this.socket.send(msg);
    }

    public close() {
        this.socket.close();
    }
}

export default WebSocketClient