const clientId = 'entropia-flow-client';
const clientVersion = '0.2.0-dev.64';
const clientBinaryVersion = '0.2.6'; // bump only when exe or relay changes

const UPDATE_MANIFEST_URL = 'https://raw.githubusercontent.com/luchoEU/entropia-flow/main/win-client-app/update-manifest.json';
const UPDATE_MANIFEST_DEV_URL = 'http://192.168.0.21:9147/update-manifest.json';
const UPDATE_CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
const UPDATE_CHECK_INTERVAL_DEV = 30 * 1000; // 30 seconds

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
const STORE_CLIENT_SETTINGS = `clientSettings`; // store client settings (auto-update, etc.)
const STORE_OCR = `ocr`;                         // ocr_response from relay
const STORE_UPDATE_PROGRESS = `updateProgress`;  // progress for binary update window
const STORE_UPDATE_DIALOG_LOCK = `updateDialogLock`; // lock to prevent duplicate update prompts across windows

export {
    clientId,
    clientVersion,
    clientBinaryVersion,
    UPDATE_MANIFEST_URL,
    UPDATE_MANIFEST_DEV_URL,
    UPDATE_CHECK_INTERVAL,
    UPDATE_CHECK_INTERVAL_DEV,
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
    STORE_WINDOW,
    STORE_CLIENT_SETTINGS,
    STORE_OCR,
    STORE_UPDATE_PROGRESS,
    STORE_UPDATE_DIALOG_LOCK
}
