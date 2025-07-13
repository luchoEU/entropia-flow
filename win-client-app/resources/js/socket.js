// A global variable to hold our WebSocket connection
let ws;
const clientId = 'entropia-flow-client';
const clientVersion = '0.0.0';

// Function to establish and manage the WebSocket connection
function connectWebSocket() {
    // Replace with your Rust server's address (use localhost for local testing)
    // The endpoint is /relay as defined in our Rust server
    ws = new WebSocket('ws://localhost:6522');

    /**
     * 1. ON CONNECTION: The 'onopen' event fires once the connection is successful.
     * We must immediately identify our app to the relay server.
     */
    ws.onopen = () => {
        console.log('Neutralino: Connected to WebSocket relay server!');
        // Identify this client so the server knows who we are
        ws.send(JSON.stringify({
            type: 'identify',
            from: clientId, // Our unique identifier
            to: null, // 'to' is not needed for identification
            payload: { status: 'online', client: 'Neutralino' }
        }));
    };

    /**
     * 2. ON MESSAGE: This is the core of your question.
     * The 'onmessage' event fires EVERY time the server sends a message to this client.
     */
    ws.onmessage = (event) => {
        // The data from the server is in 'event.data' and is a JSON string.
        console.log('Raw message received from server:', event.data);

        // We MUST parse the JSON string to get a usable JavaScript object.
        const message = JSON.parse(event.data);

        // Now we can inspect the message object and act on it.
        console.log('Parsed message payload:', message.data);

        switch (message.type) {
            case "version":
                sendToExtension("version", clientVersion); // reply with client version
                break;
            case "stream":
                messageReceived(message.data);
                break;
        }
    };

    /**
     * 3. ON CLOSE: This event fires if the connection is lost.
     * We'll implement a simple auto-reconnect logic.
     */
    ws.onclose = () => {
        console.log('Neutralino: Disconnected from WebSocket server. Reconnecting in 3 seconds...');
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
    };

    /**
     * 4. ON ERROR: Handle any connection errors.
     */
    ws.onerror = (error) => {
        console.error('Neutralino: WebSocket Error:', error);
        // Closing the socket will trigger the 'onclose' event, which handles reconnection.
        ws.close();
    };
}


// A helper function to send data TO the extension
// This is the "sender" part of the loop
function sendToExtension(type, payload) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'message',
            from: clientId, // We are the sender
            to: 'chrome-extension', // The ID of our target
            data: payload
        }));
        console.log('Neutralino: Sent message to extension:', payload);
    } else {
        console.error('Neutralino: Cannot send message, WebSocket is not open.');
    }
}

connectWebSocket();

setTimeout(() => {
    sendToExtension({ greeting: 'Hello from Neutralino on Windows!' });
}, 5000);
