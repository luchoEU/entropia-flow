interface SettingsState {
    sheet: SheetAccessInfo
}

interface SheetAccessInfo {
    documentId: string
    ttServiceDocumentId: string
    googleServiceAccountEmail: string
    googlePrivateKey: string
}

export {
    SheetAccessInfo,
    SettingsState
}