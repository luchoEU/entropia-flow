const clientId = 'entropia-flow-client';
const clientVersion = '0.0.1';

const CLIENT_EXE = 'EntropiaFlowClient.exe'
const RELAY_NAME = 'EntropiaFlowClient-relay';
const RELAY_PATH = `relay\\${RELAY_NAME}.exe`;

const STORE_INIT = `init-$1`;         // get initialization data from main process
const STORE_MESSAGE = `message-$1`;   // send message to relay
const STORE_VER = `$1Ver`;            // signal that the value has changed
const STORE_WS_PORT = `wsPort`;       // store websocket port from next run
const STORE_STREAM = `stream`;        // get stream data from main process
const STORE_SETTINGS = `settings`;    // get settings data from main process
const STORE_SCREENS = `screens`;      // get screens data from main process
const STORE_WINDOW = `window-$1`;     // store window data from main process and next run

export {
    clientId,
    clientVersion,
    CLIENT_EXE,
    RELAY_NAME,
    RELAY_PATH,
    STORE_INIT,
    STORE_MESSAGE,
    STORE_VER,
    STORE_WS_PORT,
    STORE_STREAM,
    STORE_SETTINGS,
    STORE_SCREENS,
    STORE_WINDOW
}
