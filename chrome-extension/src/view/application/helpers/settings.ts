import { Feature, SettingsState } from "../state/settings";

const initialState: SettingsState = {
    sheet: {
        budgetDocumentId: undefined,
        ttServiceDocumentId: undefined,
        googleServiceAccountEmail: undefined,
        googlePrivateKey: undefined
    },
    features: []
}

const reduceSetSettingsState = (state: SettingsState, inState: SettingsState) => inState

const reduceSetSheetBudgetDocumentId = (state: SettingsState, documentId: string) => ({
    ...state,
    sheet: {
        ...state.sheet,
        budgetDocumentId: documentId
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

const reduceEnableFeature = (state: SettingsState, featureId: Feature, enabled: boolean) => ({
    ...state,
    features: enabled ? [...state.features, featureId] : state.features.filter(f => f !== featureId)
})

export {
    initialState,
    reduceSetSettingsState,
    reduceSetSheetBudgetDocumentId,
    reduceSetSheetTTServiceDocumentId,
    reduceSetSheetGoogleServiceAccountEmail,
    reduceSetSheetGooglePrivateKey,
    reduceEnableFeature,
}
