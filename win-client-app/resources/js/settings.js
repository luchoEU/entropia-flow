async function loadSettings(payload) {
    try {
        if (payload?.log) {
            document.getElementById('logPathFile').textContent = payload.log.path;
            document.getElementById('logPathStatus').textContent = payload.log.status;
        }
        if (payload?.ws) {
            if (document.getElementById('wsPort').value === '') {
                document.getElementById('wsPort').value = payload.ws.port;
            }
            document.getElementById('wsUri').textContent = payload.ws.uri;
            document.getElementById('wsStatus').textContent = payload.ws.clientStatus;
            document.getElementById('extStatus').textContent = payload.ws.extensionStatus;
        }
    } catch (err) {
        console.warn('Could not load settings', err);
    }
}

async function selectLogFile() {
    const defaultPath = document.getElementById('logPathFile').textContent;
    const entries = await Neutralino.os.showOpenDialog('Select the Log File', {
        defaultPath,
        filters: [
            {name: 'Log file', extensions: ['log']},
            {name: 'All files', extensions: ['*']}
        ]
    });
    if (entries.length > 0) {
        document.getElementById('logPath').textContent = entries[0].replace(/\//g, '\\');
    }
}

let saveDisable = true;
async function saveSettings() {
    if (saveDisable) return;
    const logPath = document.getElementById('logPath').textContent.trim();
    const wsPort = document.getElementById('wsPort').value.trim();
    sendMessage('set-settings', { logPath, wsPort }, 'entropia-flow-client');
    document.getElementById('save-btn').textContent = 'Saving...';
    saveDisable = true;
}

Neutralino.init();
Neutralino.events.on('ready', () => {
    receiveUpdates('settings', 500, (payload) => {
        if (payload?.kill) {
            Neutralino.app.exit();
        } else {
            loadSettings(payload);
            document.getElementById('save-btn').textContent = 'Save Settings';
            saveDisable = false;
        }
    });
});

document.getElementById('copyLogPathButton').addEventListener('click', async (e) => {
    e.stopPropagation();
    copyTextToClipboard(document.getElementById('logPathFile').textContent, 'copyLogPathPopup');
});
document.getElementById('copyWsUriButton').addEventListener('click', async (e) => {
    e.stopPropagation();
    copyTextToClipboard(document.getElementById('wsUri').textContent, 'copyWsUriPopup');
});
