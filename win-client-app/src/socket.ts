import { applyDelta } from "clientStream";
import { clientId, clientVersion, RELAY_NAME, RELAY_PATH } from './const';
import { ScreenData, SettingsData, StreamData } from './data';
import { openGameWindow } from './windows';
import { getLocalIpAddress } from "./utils";

// A global variable to hold our WebSocket connection
let ws: WebSocket;

async function sendDataToWindow(name: string, version: number, data: any) {
    await Neutralino.storage.setData(name, JSON.stringify(data));
    await Neutralino.storage.setData(`${name}Ver`, version.toString());
}

sendDataToWindow('screens', 0, {});
sendDataToWindow('stream', 0, {});

let wsData: { port: number, uri: string };
async function initializeWebSocketData() {
    let port = 6522;
    try {
        port = parseInt(await Neutralino.storage.getData('wsPort'));
    } catch { } // may not exist
    const ip = await getLocalIpAddress()
    wsData = { port, uri: `ws://${ip ?? 'localhost'}:${port}` };
}

function parseAndLogMessage(json: string, from = 'server') {
    // The data from the server is in 'event.data' and is a JSON string.
    console.log(`Raw message received from ${from}:`, json);

    // We MUST parse the JSON string to get a usable JavaScript object.
    const message = JSON.parse(json);

    // Now we can inspect the message object and act on it.
    console.log('Parsed message payload:', message.data);
    return message;
}

let _screensVer = 0;
let _screensData: ScreenData = {};
let _settingsVer = 0;
let _settingsData: SettingsData = {};
let _streamVer = 0;
let _streamData: StreamData = {};

// Function to establish and manage the WebSocket connection
let closeWebSocket: () => void;
async function connectWebSocket() {
    await initializeWebSocketData();

    ws = new WebSocket(wsData.uri);
    closeWebSocket = () => ws.close(); 

    _settingsVer++;
    _settingsData.ws = { ...wsData, clientStatus: 'Connecting', extensionStatus: 'Unknown' };
    sendDataToWindow('settings', _settingsVer, _settingsData);
    
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

        _settingsVer++;
        _settingsData.ws = { ...wsData, clientStatus: 'Connected', extensionStatus: 'Unknown' };
        sendDataToWindow('settings', _settingsVer, _settingsData);

        sendMessage("version", clientVersion); // this will request all data for layouts
        sendMessage("get_screens", null, "screens");
        sendMessage("start", null, "logwatcher");
    };

    /**
     * 2. ON MESSAGE: This is the core of your question.
     * The 'onmessage' event fires EVERY time the server sends a message to this client.
     */
    ws.onmessage = (event) => {
        const message = parseAndLogMessage(event.data);
        switch (message.type) {
            case "version":
                sendMessage("version", clientVersion); // reply with client version
                break;
            case "screens_response":
                _screensVer++;
                _screensData = message.data;
                sendDataToWindow('screens', _screensVer, _screensData);
                break;
            case "logwatcher_status":
                _settingsVer++;
                _settingsData.log = {
                    path: message.data.filePath,
                    status: message.data.status === 'Error' ? `Error - ${message.data.error}` : message.data.status
                };
                sendDataToWindow('settings', _settingsVer, _settingsData);
                break;
            case "stream":
                _streamVer++;
                _streamData = applyDelta(_streamData, message.data);
                sendDataToWindow('stream', _streamVer, _streamData);
                break;
            case "server-status":
                if (_settingsData.ws) {
                    _settingsVer++;
                    _settingsData.ws.extensionStatus = message.data.connectedClients.includes('chrome-extension') ? 'Connected' : 'Disconnected';
                    sendDataToWindow('settings', _settingsVer, _settingsData);
                }
                break;
            case "disconnect":
                _streamVer++;
                _streamData = {};
                sendDataToWindow('stream', _streamVer, _streamData);
                break;
            default:
                console.error(`Unknown message type ${message.type}`);
                break;
        }
    };

    /**
     * 3. ON CLOSE: This event fires if the connection is lost.
     * We'll implement a simple auto-reconnect logic.
     */
    ws.onclose = (event) => {
        console.log(`Disconnected from WebSocket server (code: ${event.code}). Reconnecting in 3 seconds...`, event);
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);

        if (event.wasClean) {
            _settingsData.ws = { ...wsData, clientStatus: 'Disconnected', extensionStatus: 'Unknown' };
        } else if (event.code === 1006) {
            _settingsData.ws = { ...wsData, clientStatus: 'Error - Connection refused or server not responding', extensionStatus: 'Unknown' };
        } else {
            _settingsData.ws = { ...wsData, clientStatus: `Error - Code ${event.code}`, extensionStatus: 'Unknown' };
        }
        _settingsVer++;
        sendDataToWindow('settings', _settingsVer, _settingsData);
    };

    /**
     * 4. ON ERROR: Handle any connection errors.
     */
    ws.onerror = () => {
        // Closing the socket will trigger the 'onclose' event, which handles reconnection.
        ws.close();
    };
}

// A helper function to send data TO the extension
// This is the "sender" part of the loop
function sendMessage(type: string, payload: any, to = "chrome-extension") {
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

setInterval(async () => {
    try {
        const messageJson = await Neutralino.storage.getData('message');
        await Neutralino.storage.setData('message', null!);
        const message = parseAndLogMessage(messageJson, 'window');
        if (message.to === clientId) {
            switch (message.type) {
                case "menu":
                    openGameWindow();
                    break;
                case "set-settings":
                    const logPath = message.payload.logPath;
                    if (logPath !== '' && _settingsData.log && _settingsData.log.path !== logPath) {
                        sendMessage("set-path", { filePath: logPath }, 'logwatcher');
                    }
                    const wsPort = parseInt(message.payload.wsPort);
                    if (!isNaN(wsPort) && _settingsData.ws && _settingsData.ws.port !== wsPort) {
                        sendMessage("set-port", { port: wsPort }, 'server-node');
                        await Neutralino.storage.setData('wsPort', wsPort.toString());

                        // restart relay
                        closeWebSocket();
                        await killRelay();
                        await startRelayIfNotRunning();
                        await connectWebSocket();
                    }
                    break;
                default:
                    console.error(`Unknown message type ${message.type}`);
                    break;
            }
        } else {
            sendMessage(message.type, message.payload, message.to);
        }
    } catch { } // it is normal that message is not there
}, 100);

async function startRelayIfNotRunning() {
    await initializeWebSocketData();
    try {
        // Check if it's running
        let check = await Neutralino.os.execCommand(
            `tasklist | findstr /i "${RELAY_NAME}"`
        );

        if (check.stdOut.trim() === "") {
            console.log("Relay is not running. Starting it...");
        
            const command = `powershell -WindowStyle Hidden -Command "Start-Process '${RELAY_PATH}' -ArgumentList '--port', '${wsData.port}' -WindowStyle Hidden"`;
            console.log(command);

            const result = await Neutralino.os.execCommand(command);
            if (result.exitCode === 0) {
                console.log("Relay launched correctly.");
            } else {
                console.error("Relay launch failed:", result.exitCode, result.stdErr);
            }
        } else {
            console.log("Relay is already running.");
        }
    } catch (err: any) {
        if (err.message && err.message.includes("Command failed")) {
            console.log("Relay is not running. Starting it...");
            await Neutralino.os.execCommand(`start "" /B "${RELAY_PATH}"`);
        } else {
            console.error("Error checking or starting relay:", err);
        }
    }
}

async function killRelay() {
    try {
        console.log("Terminating relay process...");        
        await Neutralino.os.execCommand(`taskkill /IM ${RELAY_NAME}.exe /F`);
    } catch (err) {
        console.warn("Relay termination failed or was already closed.");
    }
}

const Socket = {
    init: async () => {
        // clear kill signal
        Neutralino.storage.setData('stream', null!);
        Neutralino.storage.setData('settings', null!);
        await startRelayIfNotRunning();
        await connectWebSocket();
    },
    exit: async () => {
        // send kill signal
        await sendDataToWindow('stream', Infinity, { kill: true });
        await sendDataToWindow('settings', Infinity, { kill: true });
        closeWebSocket();
        await killRelay();
    }
}

export {
    Socket
}
