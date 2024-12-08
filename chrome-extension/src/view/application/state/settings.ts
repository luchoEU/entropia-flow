interface SettingsState {
    sheet: SheetAccessInfo
}

interface SheetAccessInfo {
    expanded: boolean
    documentId: string
    ttServiceDocumentId: string
    googleServiceAccountEmail: string
    googlePrivateKey: string
}

export {
    SheetAccessInfo,
    SettingsState
}