import { clientVersion, clientBinaryVersion, UPDATE_MANIFEST_URL, UPDATE_MANIFEST_DEV_URL, UPDATE_CHECK_INTERVAL, UPDATE_CHECK_INTERVAL_DEV, STORE_CLIENT_SETTINGS, STORE_WINDOW } from './const';
import { Socket } from './socket';
import { interpolate } from './utils';

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

interface UpdateDismissed {
    version: string;
    count: number;
    nextCheckAfter: number;
}

interface ClientSettings {
    autoUpdateEnabled: boolean;
    updateDismissed?: UpdateDismissed;
}

const DEFAULT_CLIENT_SETTINGS: ClientSettings = { autoUpdateEnabled: true };

// Dev mode: when running via `neu run` (NL_PORT is set), use local server
const isDevMode = typeof NL_PORT !== 'undefined' && NL_PORT !== 0;

function getManifestUrl(): string {
    return isDevMode ? UPDATE_MANIFEST_DEV_URL : UPDATE_MANIFEST_URL;
}

function getCheckInterval(): number {
    return isDevMode ? UPDATE_CHECK_INTERVAL_DEV : UPDATE_CHECK_INTERVAL;
}

async function getClientSettings(): Promise<ClientSettings> {
    try {
        const data = await Neutralino.storage.getData(STORE_CLIENT_SETTINGS);
        return { ...DEFAULT_CLIENT_SETTINGS, ...JSON.parse(data) };
    } catch {
        return { ...DEFAULT_CLIENT_SETTINGS };
    }
}

async function saveClientSettings(settings: ClientSettings): Promise<void> {
    await Neutralino.storage.setData(STORE_CLIENT_SETTINGS, JSON.stringify(settings));
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

function getCooldownMs(dismissCount: number): number {
    if (dismissCount <= 1) return 24 * 60 * 60 * 1000;      // 1 day
    if (dismissCount === 2) return 3 * 24 * 60 * 60 * 1000;  // 3 days
    return 7 * 24 * 60 * 60 * 1000;                           // 1 week
}

function isDismissedAndInCooldown(settings: ClientSettings, version: string): boolean {
    const d = settings.updateDismissed;
    if (!d || d.version !== version) return false;
    return Date.now() < d.nextCheckAfter;
}

async function installResourcesUpdate(): Promise<void> {
    // Clear dismissed state so next version starts fresh
    const settings = await getClientSettings();
    delete settings.updateDismissed;
    await saveClientSettings(settings);

    // Snapshot window states, clear stale keys, then restart
    const storeWindowKeyStart = interpolate(STORE_WINDOW, '');
    const allKeys = await Neutralino.storage.getKeys();
    const windowKeys = allKeys.filter(key => key.startsWith(storeWindowKeyStart));

    // Snapshot current window data
    const windowSnapshots: { key: string; data: string }[] = [];
    for (const key of windowKeys) {
        try {
            const data = await Neutralino.storage.getData(key);
            windowSnapshots.push({ key, data });
        } catch {}
    }

    // Clear all window keys to prevent stale data
    for (const key of windowKeys) {
        await Neutralino.storage.setData(key, null!);
    }

    await Socket.exit();

    // Brief delay to let child processes finish
    await new Promise(resolve => setTimeout(resolve, 300));

    // Re-write window states with fresh timestamps
    for (const { key, data } of windowSnapshots) {
        try {
            const parsed = JSON.parse(data);
            parsed.time = Date.now();
            await Neutralino.storage.setData(key, JSON.stringify(parsed));
        } catch {}
    }

    await Neutralino.updater.install();
    await Neutralino.app.restartProcess();
}

let _dialogOpen = false;

async function checkAndNotify(): Promise<void> {
    if (_dialogOpen) return;
    const status = await checkForUpdates();

    switch (status.type) {
        case 'resources': {
            const settings = await getClientSettings();
            if (isDismissedAndInCooldown(settings, status.manifest.version)) return;

            _dialogOpen = true;
            const dismissCount = (settings.updateDismissed?.version === status.manifest.version)
                ? settings.updateDismissed!.count : 0;
            let message = `A new version (${status.manifest.version}) is available. You are running ${clientVersion}.\n\nWould you like to update and restart now?`;
            if (dismissCount >= 3) {
                message += '\n\n(You can disable auto-update checks in Settings.)';
            }
            const result = await Neutralino.os.showMessageBox(
                'Update Available',
                message,
                'YES_NO' as Neutralino.os.MessageBoxChoice,
                'QUESTION' as Neutralino.os.Icon
            );
            _dialogOpen = false;
            if (result === 'YES') {
                await installResourcesUpdate();
            } else {
                const newCount = dismissCount + 1;
                settings.updateDismissed = {
                    version: status.manifest.version,
                    count: newCount,
                    nextCheckAfter: Date.now() + getCooldownMs(newCount)
                };
                await saveClientSettings(settings);
            }
            break;
        }
        case 'binary': {
            const settings = await getClientSettings();
            if (isDismissedAndInCooldown(settings, status.manifest.version)) return;

            _dialogOpen = true;
            const dismissCount = (settings.updateDismissed?.version === status.manifest.version)
                ? settings.updateDismissed!.count : 0;
            let message = `A new version (${status.manifest.version}) requires a full update (new executable/relay).\nYou are running ${clientVersion}.\n\nWould you like to open the download page?`;
            if (dismissCount >= 3) {
                message += '\n\n(You can disable auto-update checks in Settings.)';
            }
            const result = await Neutralino.os.showMessageBox(
                'Update Available',
                message,
                'YES_NO' as Neutralino.os.MessageBoxChoice,
                'QUESTION' as Neutralino.os.Icon
            );
            _dialogOpen = false;
            if (result === 'YES') {
                // Clear dismissed state on acceptance
                delete settings.updateDismissed;
                await saveClientSettings(settings);
                await Neutralino.os.open(status.manifest.binaryURL);
            } else {
                const newCount = dismissCount + 1;
                settings.updateDismissed = {
                    version: status.manifest.version,
                    count: newCount,
                    nextCheckAfter: Date.now() + getCooldownMs(newCount)
                };
                await saveClientSettings(settings);
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
    init: async () => {
        const settings = await getClientSettings();
        if (!settings.autoUpdateEnabled) return;
        setTimeout(checkAndNotify, 5000);
        startPeriodicChecks();
    },
    checkForUpdates,
    installResourcesUpdate,
    startPeriodicChecks,
    stopPeriodicChecks,
    getClientSettings,
};

export { Updater };
