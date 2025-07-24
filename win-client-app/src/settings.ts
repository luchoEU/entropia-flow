import { STORE_SETTINGS } from "./const";
import { receiveUpdates, sendMessage } from "./messages";
import { copyTextToClipboard } from "./utils";

const logPathElement = document.getElementById('logPath');
const logPathFileElement = document.getElementById('logPathFile');
const logPathStatusElement = document.getElementById('logPathStatus');
const wsUriElement = document.getElementById('wsUri');
const wsStatusElement = document.getElementById('wsStatus');
const extStatusElement = document.getElementById('extStatus');
const wsPortElement = document.getElementById('wsPort') as HTMLInputElement;
const saveButtonElement = document.getElementById('save-btn') as HTMLButtonElement;

async function loadSettings(payload: any) {
    try {
        if (payload?.log && logPathFileElement && logPathStatusElement) {
            logPathFileElement.textContent = payload.log.path;
            logPathStatusElement.textContent = payload.log.status;
        }
        if (payload?.ws && wsUriElement && wsStatusElement && extStatusElement && wsPortElement) {
            if (wsPortElement.value === '') {
                wsPortElement.value = payload.ws.port;
            }
            wsUriElement.textContent = payload.ws.uri;
            wsStatusElement.textContent = payload.ws.clientStatus;
            extStatusElement.textContent = payload.ws.extensionStatus;
        }
    } catch (err) {
        console.warn('Could not load settings', err);
    }
}

async function selectLogFile() {
    const defaultPath = logPathFileElement?.textContent;
    if (!defaultPath) return;

    const entries = await Neutralino.os.showOpenDialog('Select the Log File', {
        defaultPath,
        filters: [
            {name: 'Log file', extensions: ['log']},
            {name: 'All files', extensions: ['*']}
        ]
    });
    if (entries.length > 0 && logPathElement) {
        logPathElement.textContent = entries[0].replace(/\//g, '\\');
    }
}

let saveDisable = true;
async function saveSettings() {
    if (saveDisable) return;
    const logPath = logPathElement?.textContent?.trim();
    const wsPort = wsPortElement?.value?.trim();
    sendMessage('set-settings', { logPath, wsPort }, 'entropia-flow-client');
    if (saveButtonElement) saveButtonElement.textContent = 'Saving...';
    saveDisable = true;
}

Neutralino.init();
Neutralino.events.on('ready', () => {
    receiveUpdates(STORE_SETTINGS, 500, (payload: any) => {
        if (payload?.kill) {
            Neutralino.app.exit();
        } else {
            loadSettings(payload);
            if (saveButtonElement) saveButtonElement.textContent = 'Save Settings';
            saveDisable = false;
        }
    });
});

document.getElementById('copyLogPathButton')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    copyTextToClipboard(logPathFileElement?.textContent, 'copyLogPathPopup');
});
document.getElementById('copyWsUriButton')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    copyTextToClipboard(wsUriElement?.textContent, 'copyWsUriPopup');
});
document.getElementById('save-btn')?.addEventListener('click', saveSettings);
document.getElementById('selectLogPathButton')?.addEventListener('click', selectLogFile);
