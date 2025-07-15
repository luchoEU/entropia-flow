// A global variable to hold our WebSocket connection
let ws;
const clientId = 'entropia-flow-client';
const clientVersion = '0.0.1';

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
        console.log('Connected to WebSocket relay server!');
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
                sendMessage("version", clientVersion); // reply with client version
                break;
            case "stream":
                messageReceived?.(message.data);
                break;
            case "screens_response":
                screensReceived?.(message.data);
                break;
        }
    };

    /**
     * 3. ON CLOSE: This event fires if the connection is lost.
     * We'll implement a simple auto-reconnect logic.
     */
    ws.onclose = () => {
        console.log('Disconnected from WebSocket server. Reconnecting in 3 seconds...');
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
    };

    /**
     * 4. ON ERROR: Handle any connection errors.
     */
    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Closing the socket will trigger the 'onclose' event, which handles reconnection.
        ws.close();
    };
}

// A helper function to send data TO the extension
// This is the "sender" part of the loop
function sendMessage(type, payload, to = "chrome-extension") {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            type: type,
            from: clientId,
            to: to,
            data: payload
        };
        ws.send(JSON.stringify(message));
        console.log(`Sent '${type}' to '${to}':`, payload);
    } else {
        console.error('WebSocket is not open.');
    }
}

const RELAY_EXE = 'EntropiaFlowClient-relay.exe';
const RELAY_LOG = 'relay.log';
let relayPath = null;

async function resolveRelayPath() {
    const exeName = RELAY_EXE;
    const fs = Neutralino.filesystem;

    try {
        // Check in current directory
        await fs.readFile(exeName);
        relayPath = exeName;
        console.log(`Using relay from current directory: ${relayPath}`);
    } catch {
        // Check in fallback directory
        const fallbackPath = `go-websocket-relay/${exeName}`;
        try {
            await fs.readFile(fallbackPath);
            relayPath = fallbackPath;
            console.log(`Using relay from fallback: ${relayPath}`);
        } catch {
            console.error("Relay executable not found in either location.");
        }
    }
}

async function startRelayIfNotRunning() {
    try {
        const baseExeName = RELAY_EXE.replace('.exe', '');
        // Check if it's running
        let check = await Neutralino.os.execCommand(
            `tasklist | findstr /i "${baseExeName}"`
        );

        if (check.stdOut.trim() === "") {
            if (!relayPath) {
                await resolveRelayPath();
                if (!relayPath) return; // Stop if not found
            }

            console.log("Relay is not running. Starting it...");
        
            // Start the process without waiting
            await Neutralino.os.execCommand(`powershell -WindowStyle Hidden -Command "Start-Process '${relayPath}' -WindowStyle Hidden"`);
            console.log("Relay launched.");
        } else {
            console.log("Relay is already running.");
        }
    } catch (err) {
        if (err.message && err.message.includes("Command failed")) {
            console.log("Relay is not running. Starting it...");
            await Neutralino.os.execCommand(`start "" /B "${RELAY_EXE}"`);
        } else {
            console.error("Error checking or starting relay:", err);
        }
    }
}

Neutralino.events.on("windowClose", async () => {
    try {
        console.log("Terminating relay process...");
        await Neutralino.os.execCommand(`taskkill /IM ${RELAY_EXE} /F`);
    } catch (err) {
        console.warn("Relay termination failed or was already closed.");
    }
    Neutralino.app.exit();
});

startRelayIfNotRunning().then(() => {
    connectWebSocket();

    setTimeout(() => {
        sendMessage("version", clientVersion); // this will request all data for layouts
        sendMessage("get_screens", null, "screens");
    }, 5000);    
})
