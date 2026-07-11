import { clientVersion, clientBinaryVersion, UPDATE_MANIFEST_URL, UPDATE_MANIFEST_DEV_URL, UPDATE_CHECK_INTERVAL, UPDATE_CHECK_INTERVAL_DEV, STORE_WINDOW, STORE_STREAM, STORE_SETTINGS, STORE_VER, STORE_UPDATE_PROGRESS } from './const';
import { ClientSettings, readClientSettings, saveClientSettings, withInspectorEnabled } from './clientSettings';
import { Socket } from './socket';
import { interpolate } from './utils';
import { releaseUpdateDialogLock, tryAcquireUpdateDialogLock } from './updateDialogLock';

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

let _devManifestUrlOverride: string | undefined;

async function getManifestUrl(): Promise<string> {
    if (isDevMode) {
        try {
            const settings = await readClientSettings();
            const override = settings.devManifestUrl || _devManifestUrlOverride;
            if (override) return `${override}/update-manifest.json`;
        } catch {}
        return UPDATE_MANIFEST_DEV_URL;
    }
    return UPDATE_MANIFEST_URL;
}

function getCheckInterval(): number {
    return isDevMode ? UPDATE_CHECK_INTERVAL_DEV : UPDATE_CHECK_INTERVAL;
}

async function checkForUpdates(): Promise<UpdateStatus> {
    const url = await getManifestUrl();
    try {
        const raw = await Neutralino.updater.checkForUpdates(url);
        const manifest = raw as unknown as UpdateManifest;

        if (manifest.binaryVersion !== clientBinaryVersion) {
            return { type: 'binary', manifest };
        }

        if (manifest.version !== clientVersion) {
            return { type: 'resources', manifest };
        }

        return { type: 'none' };
    } catch (err: any) {
        const base = err?.message || err?.code || String(err);
        const message = `${base}\nURL: ${url}`;
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

async function writeProgress(pct: number, status: string): Promise<void> {
    await Neutralino.storage.setData(STORE_UPDATE_PROGRESS, JSON.stringify({ pct, status }));
}

async function downloadAndInstallBinaryUpdate(manifest: UpdateManifest): Promise<void> {
    const tmp = (await Neutralino.os.execCommand('cmd /c echo %TEMP%')).stdOut.trim();
    const zipPath = `${tmp}\\EntropiaFlowUpdate.zip`;
    const extractDir = `${tmp}\\EntropiaFlowUpdate`;
    const appDir = NL_PATH.replace(/\//g, '\\').replace(/\\$/, '');
    const psPath = `${tmp}\\entropia_updater.ps1`;
    const downloadScriptPath = `${tmp}\\entropia_download.ps1`;
    const progressFile = `${tmp}\\entropia_download_progress.txt`;

    const clientSettings = await readClientSettings();
    await Neutralino.window.create('/update.html', withInspectorEnabled({
        title: 'Entropia Flow Update',
        icon: '/resources/img/appIcon.png',
        width: 400,
        height: 160,
        minWidth: 400,
        minHeight: 160,
        center: true,
        alwaysOnTop: true,
        hidden: false,
        exitProcessOnClose: false,
    } as any, clientSettings));

    await writeProgress(0, 'Downloading...');

    const downloadScript = [
        `$url = '${manifest.binaryURL}'`,
        `$outfile = '${zipPath}'`,
        `$progressFile = '${progressFile}'`,
        `try {`,
        `    $req = [System.Net.HttpWebRequest]::Create($url)`,
        `    $resp = $req.GetResponse()`,
        `    $total = $resp.ContentLength`,
        `    $inStream = $resp.GetResponseStream()`,
        `    $outStream = [System.IO.File]::OpenWrite($outfile)`,
        `    $buf = New-Object byte[] 65536`,
        `    $downloaded = 0`,
        `    do {`,
        `        $read = $inStream.Read($buf, 0, $buf.Length)`,
        `        if ($read -le 0) { break }`,
        `        $outStream.Write($buf, 0, $read)`,
        `        $downloaded += $read`,
        `        if ($total -gt 0) { [System.IO.File]::WriteAllText($progressFile, [int]($downloaded * 100 / $total)) }`,
        `    } while ($true)`,
        `    $outStream.Close(); $inStream.Close()`,
        `    [System.IO.File]::WriteAllText($progressFile, 'DONE')`,
        `} catch {`,
        `    [System.IO.File]::WriteAllText($progressFile, "ERROR:$($_.Exception.Message)")`,
        `}`,
    ].join('\n');

    await Neutralino.filesystem.writeFile(downloadScriptPath, downloadScript);
    await Neutralino.os.execCommand(`cmd /c del /f /q "${progressFile}" 2>nul`);
    // Use Start-Process inside PS to truly detach — cmd /c start /B can silently fail with no console
    await Neutralino.os.execCommand(
        `powershell -WindowStyle Hidden -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-WindowStyle Hidden -ExecutionPolicy Bypass -File \\"${downloadScriptPath}\\"' -WindowStyle Hidden"`
    );

    await new Promise<void>((resolve, reject) => {
        let noFileCount = 0;
        const interval = setInterval(async () => {
            try {
                const result = await Neutralino.os.execCommand(`cmd /c type "${progressFile}" 2>nul`);
                const text = result.stdOut.trim();
                if (!text) {
                    noFileCount++;
                    if (noFileCount > 30) { // 15 seconds with no file written
                        clearInterval(interval);
                        reject(new Error('Download failed to start — check that the update server is reachable at:\n' + manifest.binaryURL));
                    }
                    return;
                }
                noFileCount = 0;
                if (text === 'DONE') {
                    clearInterval(interval);
                    resolve();
                } else if (text.startsWith('ERROR:')) {
                    clearInterval(interval);
                    reject(new Error(text.slice(6)));
                } else {
                    const pct = parseInt(text) || 0;
                    await writeProgress(pct, `Downloading... ${pct}%`);
                }
            } catch {}
        }, 500);
    }).catch(async (err: any) => {
        await writeProgress(0, `Failed: ${err.message || String(err)}`).catch(() => {});
        throw err;
    });

    await writeProgress(100, 'Extracting...');
    await Neutralino.os.execCommand(
        `powershell -Command "if (Test-Path '${extractDir}') { Remove-Item '${extractDir}' -Recurse -Force }; Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`
    );

    await writeProgress(100, 'Installing...');
    const ps1 = [
        `Start-Sleep -Seconds 2`,
        `while (Get-Process -Name 'EntropiaFlowClient' -ErrorAction SilentlyContinue) { Start-Sleep -Seconds 1 }`,
        `Copy-Item -Path '${extractDir}\\*' -Destination '${appDir}' -Recurse -Force`,
        `Remove-Item '${extractDir}' -Recurse -Force`,
        `Remove-Item '${zipPath}' -ErrorAction SilentlyContinue`,
        `Start-Process '${appDir}\\EntropiaFlowClient.exe'`,
        `Remove-Item $MyInvocation.MyCommand.Path -ErrorAction SilentlyContinue`,
    ].join('\n');

    await Neutralino.filesystem.writeFile(psPath, ps1);

    const settings = await readClientSettings();
    delete settings.updateDismissed;
    await saveClientSettings(settings);

    await Socket.exit();
    await new Promise(r => setTimeout(r, 300));

    await Neutralino.os.execCommand(
        `cmd /c start "" /B powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "${psPath}"`
    );
    await Neutralino.app.exit();
}

async function installResourcesUpdate(): Promise<void> {
    // Clear dismissed state so next version starts fresh
    const settings = await readClientSettings();
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

    // Reset stream/settings to clean state so restarted app doesn't see the kill signal.
    // Windows have already received the kill signal and are exiting; we clear it here so
    // the fresh process doesn't accidentally kill the newly opened windows on startup.
    await Neutralino.storage.setData(STORE_STREAM, JSON.stringify({}));
    await Neutralino.storage.setData(interpolate(STORE_VER, STORE_STREAM), '0');
    await Neutralino.storage.setData(STORE_SETTINGS, JSON.stringify({}));
    await Neutralino.storage.setData(interpolate(STORE_VER, STORE_SETTINGS), '0');

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
    await Neutralino.app.exit();
}

let _dialogOpen = false;
let _updateInProgress = false;

async function checkAndNotify(): Promise<void> {
    if (_dialogOpen || _updateInProgress) return;
    const status = await checkForUpdates();

    switch (status.type) {
        case 'resources': {
            const settings = await readClientSettings();
            if (isDismissedAndInCooldown(settings, status.manifest.version)) return;

            const lockOwner = await tryAcquireUpdateDialogLock();
            if (!lockOwner) return;

            _dialogOpen = true;
            try {
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
                if (result === 'YES') {
                    await releaseUpdateDialogLock(lockOwner);
                    _updateInProgress = true;
                    stopPeriodicChecks();
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
            } finally {
                _dialogOpen = false;
                await releaseUpdateDialogLock(lockOwner);
            }
            break;
        }
        case 'binary': {
            const settings = await readClientSettings();
            if (isDismissedAndInCooldown(settings, status.manifest.version)) return;

            const lockOwner = await tryAcquireUpdateDialogLock();
            if (!lockOwner) return;

            _dialogOpen = true;
            try {
                const dismissCount = (settings.updateDismissed?.version === status.manifest.version)
                    ? settings.updateDismissed!.count : 0;
                let message = `A new version (${status.manifest.version}) requires a full update (new executable/relay).\nYou are running ${clientVersion}.\n\nWould you like to download and install it now?`;
                if (dismissCount >= 3) {
                    message += '\n\n(You can disable auto-update checks in Settings.)';
                }
                const result = await Neutralino.os.showMessageBox(
                    'Update Available',
                    message,
                    'YES_NO' as Neutralino.os.MessageBoxChoice,
                    'QUESTION' as Neutralino.os.Icon
                );
                if (result === 'YES') {
                    await releaseUpdateDialogLock(lockOwner);
                    _updateInProgress = true;
                    stopPeriodicChecks();
                    await downloadAndInstallBinaryUpdate(status.manifest);
                } else {
                    const newCount = dismissCount + 1;
                    settings.updateDismissed = {
                        version: status.manifest.version,
                        count: newCount,
                        nextCheckAfter: Date.now() + getCooldownMs(newCount)
                    };
                    await saveClientSettings(settings);
                }
            } finally {
                _dialogOpen = false;
                await releaseUpdateDialogLock(lockOwner);
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
        const settings = await readClientSettings();
        if (!settings.autoUpdateEnabled) return;
        setTimeout(async () => {
            await checkAndNotify();
            startPeriodicChecks();
        }, 5000);
    },
    setDevManifestUrl: (url: string) => {
        _devManifestUrlOverride = url || undefined;
    },
    checkForUpdates,
    installResourcesUpdate,
    downloadAndInstallBinaryUpdate,
    startPeriodicChecks,
    stopPeriodicChecks,
    getClientSettings: readClientSettings,
};

export { Updater };
