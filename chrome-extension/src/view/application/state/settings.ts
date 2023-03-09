interface SettingsState {
    sheet: SheetAccessInfo
}

interface SheetAccessInfo {
    expanded: boolean
    documentId: string
    googleServiceAccountEmail: string
    googlePrivateKey: string
}

export {
    SheetAccessInfo,
    SettingsState
}