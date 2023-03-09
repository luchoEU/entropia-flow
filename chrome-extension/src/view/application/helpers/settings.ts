import { SettingsState } from "../state/settings";

const initialState: SettingsState = {
    sheet: {
        expanded: true,
        documentId: undefined,
        googleServiceAccountEmail: undefined,
        googlePrivateKey: undefined
    }
}

const setState = (state: SettingsState, inState: SettingsState) => inState

const setSheetExpanded = (state: SettingsState, expanded: boolean) => ({
    ...state,
    sheet: {
        ...state.sheet,
        expanded
    }
})

const setSheetDocumentId = (state: SettingsState, documentId: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        documentId
    }
})

const setSheetGoogleServiceAccountEmail = (state: SettingsState, googleServiceAccountEmail: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        googleServiceAccountEmail
    }
})

const setSheetGooglePrivateKey = (state: SettingsState, googlePrivateKey: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        googlePrivateKey: googlePrivateKey.replace(/\\n/g, '\n')
    }
})

export {
    initialState,
    setState,
    setSheetExpanded,
    setSheetDocumentId,
    setSheetGoogleServiceAccountEmail,
    setSheetGooglePrivateKey,
}
