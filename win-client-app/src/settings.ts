import { STORE_SETTINGS, STORE_CLIENT_SETTINGS } from "./const";
import { receiveUpdates, sendMessageToMain } from "./messages";
import { createDesktopShortcut } from "./shortcut";
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
    sendMessageToMain('set-settings', { logPath, wsPort });
    if (saveButtonElement) saveButtonElement.textContent = 'Saving...';
    saveDisable = true;
}

Neutralino.init();
let _settingsIntervalId: ReturnType<typeof setInterval>;
Neutralino.events.on('ready', () => {
    _settingsIntervalId = receiveUpdates(STORE_SETTINGS, 500, (payload: any) => {
        if (payload?.kill) {
            Neutralino.app.exit();
        } else {
            loadSettings(payload);
            if (saveButtonElement) saveButtonElement.textContent = 'Save Settings';
            saveDisable = false;
        }
    });
});

window.addEventListener('beforeunload', () => {
    if (_settingsIntervalId) clearInterval(_settingsIntervalId);
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
document.getElementById('createShortcutBtn')?.addEventListener('click', () => createDesktopShortcut());

// Auto-update checkbox
const autoUpdateCheckbox = document.getElementById('autoUpdateCheckbox') as HTMLInputElement;
async function loadAutoUpdateSetting() {
    try {
        const data = await Neutralino.storage.getData(STORE_CLIENT_SETTINGS);
        const settings = JSON.parse(data);
        if (autoUpdateCheckbox) {
            autoUpdateCheckbox.checked = settings.autoUpdateEnabled !== false;
        }
    } catch {
        // No settings yet — default to enabled
        if (autoUpdateCheckbox) autoUpdateCheckbox.checked = true;
    }
}
loadAutoUpdateSetting();

autoUpdateCheckbox?.addEventListener('change', async () => {
    const enabled = autoUpdateCheckbox.checked;
    try {
        let settings: any = {};
        try {
            settings = JSON.parse(await Neutralino.storage.getData(STORE_CLIENT_SETTINGS));
        } catch {}
        settings.autoUpdateEnabled = enabled;
        await Neutralino.storage.setData(STORE_CLIENT_SETTINGS, JSON.stringify(settings));
    } catch (err) {
        console.warn('Failed to save auto-update setting', err);
    }
    sendMessageToMain('set-auto-update', { enabled });
});
