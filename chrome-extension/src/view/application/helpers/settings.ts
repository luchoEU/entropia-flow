import { SettingsState } from "../state/settings";

const initialState: SettingsState = {
    sheet: {
        documentId: undefined,
        ttServiceDocumentId: undefined,
        googleServiceAccountEmail: undefined,
        googlePrivateKey: undefined
    }
}

const setState = (state: SettingsState, inState: SettingsState) => inState

const setSheetDocumentId = (state: SettingsState, documentId: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        documentId
    }
})

const setSheetTTServiceDocumentId = (state: SettingsState, documentId: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        ttServiceDocumentId: documentId
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
    setSheetDocumentId,
    setSheetTTServiceDocumentId,
    setSheetGoogleServiceAccountEmail,
    setSheetGooglePrivateKey,
}
