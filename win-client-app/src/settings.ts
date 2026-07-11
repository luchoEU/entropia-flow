import { STORE_SETTINGS } from "./const";
import { receiveUpdates, sendMessageToMain } from "./messages";
import { createDesktopShortcut } from "./shortcut";
import { copyTextToClipboard } from "./utils";
import { readClientSettings, saveClientSettings } from "./clientSettings";

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

// Auto-update checkbox and dev manifest URL
const autoUpdateCheckbox = document.getElementById('autoUpdateCheckbox') as HTMLInputElement;
const devToolsCheckbox = document.getElementById('devToolsCheckbox') as HTMLInputElement;
const devManifestUrlInput = document.getElementById('devManifestUrl') as HTMLInputElement;
const devManifestUrlDisplay = document.getElementById('devManifestUrlDisplay') as HTMLElement;
const devManifestUrlText = document.getElementById('devManifestUrlText') as HTMLElement;

function updateUrlDisplay(url: string) {
    devManifestUrlText.textContent = url || 'not set';
}

async function loadClientSettings() {
    try {
        const settings = await readClientSettings();
        if (autoUpdateCheckbox) {
            autoUpdateCheckbox.checked = settings.autoUpdateEnabled !== false;
        }
        if (devToolsCheckbox) {
            devToolsCheckbox.checked = settings.devToolsEnabled === true;
        }
        const url = settings.devManifestUrl || '';
        devManifestUrlInput.value = url;
        updateUrlDisplay(url);
    } catch {
        // No settings yet — default to enabled
        if (autoUpdateCheckbox) autoUpdateCheckbox.checked = true;
    }
}
loadClientSettings();

devManifestUrlDisplay?.addEventListener('click', () => {
    devManifestUrlDisplay.style.display = 'none';
    devManifestUrlInput.style.display = '';
    devManifestUrlInput.focus();
});

async function saveDevManifestUrl() {
    const url = devManifestUrlInput.value.trim().replace(/\/+$/, '');
    devManifestUrlInput.style.display = 'none';
    devManifestUrlDisplay.style.display = '';
    updateUrlDisplay(url);
    try {
        const settings = await readClientSettings();
        settings.devManifestUrl = url || undefined;
        await saveClientSettings(settings);
    } catch (err) {
        console.warn('Failed to save dev manifest URL', err);
    }
    sendMessageToMain('set-dev-manifest-url', { url });
}

devManifestUrlInput?.addEventListener('change', saveDevManifestUrl);
devManifestUrlInput?.addEventListener('blur', saveDevManifestUrl);
devManifestUrlInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') devManifestUrlInput.blur();
});

autoUpdateCheckbox?.addEventListener('change', async () => {
    const enabled = autoUpdateCheckbox.checked;
    try {
        const settings = await readClientSettings();
        settings.autoUpdateEnabled = enabled;
        await saveClientSettings(settings);
    } catch (err) {
        console.warn('Failed to save auto-update setting', err);
    }
    sendMessageToMain('set-auto-update', { enabled });
});

devToolsCheckbox?.addEventListener('change', async () => {
    const enabled = devToolsCheckbox.checked;
    try {
        const settings = await readClientSettings();
        settings.devToolsEnabled = enabled;
        await saveClientSettings(settings);
    } catch (err) {
        console.warn('Failed to save DevTools setting', err);
    }
});
