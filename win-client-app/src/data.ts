interface ScreenData { }

interface SettingsData {
    ws?: { port: number, uri: string, clientStatus: string, extensionStatus: string },
    log?: { path: string, status: string }
}

interface StreamData { }

export {
    ScreenData,
    SettingsData,
    StreamData
}
