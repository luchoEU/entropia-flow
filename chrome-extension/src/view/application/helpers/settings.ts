import { SettingsState } from "../state/settings";

const initialState: SettingsState = {
    sheet: {
        documentId: undefined,
        ttServiceDocumentId: undefined,
        googleServiceAccountEmail: undefined,
        googlePrivateKey: undefined
    },
    features: []
}

const reduceSetSettingsState = (state: SettingsState, inState: SettingsState) => inState

const reduceSetSheetDocumentId = (state: SettingsState, documentId: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        documentId
    }
})

const reduceSetSheetTTServiceDocumentId = (state: SettingsState, documentId: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        ttServiceDocumentId: documentId
    }
})

const reduceSetSheetGoogleServiceAccountEmail = (state: SettingsState, googleServiceAccountEmail: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        googleServiceAccountEmail
    }
})

const reduceSetSheetGooglePrivateKey = (state: SettingsState, googlePrivateKey: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        googlePrivateKey: googlePrivateKey.replace(/\\n/g, '\n')
    }
})

const reduceEnableFeature = (state: SettingsState, featureId: string, enabled: boolean) => ({
    ...state,
    features: enabled ? [...state.features, featureId] : state.features.filter(f => f !== featureId)
})

export {
    initialState,
    reduceSetSettingsState,
    reduceSetSheetDocumentId,
    reduceSetSheetTTServiceDocumentId,
    reduceSetSheetGoogleServiceAccountEmail,
    reduceSetSheetGooglePrivateKey,
    reduceEnableFeature,
}
