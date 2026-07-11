import { STORE_CLIENT_SETTINGS } from "./const";

interface UpdateDismissed {
    version: string;
    count: number;
    nextCheckAfter: number;
}

interface ClientSettings {
    autoUpdateEnabled: boolean;
    updateDismissed?: UpdateDismissed;
    devManifestUrl?: string;
    devToolsEnabled?: boolean;
}

const DEFAULT_CLIENT_SETTINGS: ClientSettings = {
    autoUpdateEnabled: true,
    devToolsEnabled: false,
};

function normalizeClientSettings(settings?: Partial<ClientSettings> | null): ClientSettings {
    return {
        ...DEFAULT_CLIENT_SETTINGS,
        ...(settings ?? {}),
        devToolsEnabled: settings?.devToolsEnabled === true,
    };
}

async function readClientSettings(): Promise<ClientSettings> {
    try {
        const data = await Neutralino.storage.getData(STORE_CLIENT_SETTINGS);
        return normalizeClientSettings(JSON.parse(data));
    } catch {
        return { ...DEFAULT_CLIENT_SETTINGS };
    }
}

async function saveClientSettings(settings: ClientSettings): Promise<void> {
    await Neutralino.storage.setData(STORE_CLIENT_SETTINGS, JSON.stringify(normalizeClientSettings(settings)));
}

function withInspectorEnabled(options: Neutralino.window.WindowOptions, settings: ClientSettings): Neutralino.window.WindowOptions {
    return {
        ...options,
        enableInspector: settings.devToolsEnabled === true,
    };
}

export type { ClientSettings };
export {
    DEFAULT_CLIENT_SETTINGS,
    normalizeClientSettings,
    readClientSettings,
    saveClientSettings,
    withInspectorEnabled,
};
