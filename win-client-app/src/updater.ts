import { clientVersion, clientBinaryVersion, UPDATE_MANIFEST_URL, UPDATE_MANIFEST_DEV_URL, UPDATE_CHECK_INTERVAL, UPDATE_CHECK_INTERVAL_DEV } from './const';

interface UpdateManifest {
    applicationId: string;
    version: string;
    resourcesURL: string;
    binaryVersion: string;
    binaryURL: string;
}

type UpdateStatus =
    | { type: 'none' }
    | { type: 'resources'; manifest: UpdateManifest }
    | { type: 'binary'; manifest: UpdateManifest }
    | { type: 'error'; message: string };

// Dev mode: when running via `neu run` (NL_PORT is set), use local server
const isDevMode = typeof NL_PORT !== 'undefined' && NL_PORT !== 0;

function getManifestUrl(): string {
    return isDevMode ? UPDATE_MANIFEST_DEV_URL : UPDATE_MANIFEST_URL;
}

function getCheckInterval(): number {
    return isDevMode ? UPDATE_CHECK_INTERVAL_DEV : UPDATE_CHECK_INTERVAL;
}

async function checkForUpdates(): Promise<UpdateStatus> {
    try {
        const raw = await Neutralino.updater.checkForUpdates(getManifestUrl());
        const manifest = raw as unknown as UpdateManifest;

        if (manifest.binaryVersion !== clientBinaryVersion) {
            return { type: 'binary', manifest };
        }

        if (manifest.version !== clientVersion) {
            return { type: 'resources', manifest };
        }

        return { type: 'none' };
    } catch (err: any) {
        const message = err?.message || err?.code || String(err);
        console.error('Update check failed:', message);
        return { type: 'error', message };
    }
}

async function installResourcesUpdate(): Promise<void> {
    await Neutralino.updater.install();
    await Neutralino.app.restartProcess();
}

async function checkAndNotify(): Promise<void> {
    const status = await checkForUpdates();

    switch (status.type) {
        case 'resources': {
            const result = await Neutralino.os.showMessageBox(
                'Update Available',
                `A new version (${status.manifest.version}) is available. You are running ${clientVersion}.\n\nWould you like to update and restart now?`,
                Neutralino.os.MessageBoxChoice.YES_NO,
                Neutralino.os.Icon.QUESTION
            );
            if (result === 'YES') {
                await installResourcesUpdate();
            }
            break;
        }
        case 'binary': {
            const result = await Neutralino.os.showMessageBox(
                'Update Available',
                `A new version (${status.manifest.version}) requires a full update (new executable/relay).\nYou are running ${clientVersion}.\n\nWould you like to open the download page?`,
                Neutralino.os.MessageBoxChoice.YES_NO,
                Neutralino.os.Icon.QUESTION
            );
            if (result === 'YES') {
                await Neutralino.os.open(status.manifest.binaryURL);
            }
            break;
        }
        case 'error':
            // Silent on startup — don't bother user with network errors
            console.warn('Startup update check failed:', status.message);
            break;
        case 'none':
            break;
    }
}

let _checkIntervalId: ReturnType<typeof setInterval> | null = null;

function startPeriodicChecks(): void {
    if (_checkIntervalId !== null) return;
    _checkIntervalId = setInterval(checkAndNotify, getCheckInterval());
}

function stopPeriodicChecks(): void {
    if (_checkIntervalId !== null) {
        clearInterval(_checkIntervalId);
        _checkIntervalId = null;
    }
}

const Updater = {
    init: () => {
        setTimeout(checkAndNotify, 5000);
        startPeriodicChecks();
    },
    checkForUpdates,
    installResourcesUpdate,
    stopPeriodicChecks,
};

export { Updater };
