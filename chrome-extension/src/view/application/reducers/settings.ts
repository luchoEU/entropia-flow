import { DOCUMENT_ID_CHANGED, ENABLE_FEATURE, GOOGLE_PRIVATE_KEY_CHANGED, GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED, SET_SETTING_STATE, TT_SERVICE_DOCUMENT_ID_CHANGED } from "../actions/settings"
import { initialState, reduceEnableFeature, reduceSetSettingsState, reduceSetSheetDocumentId, reduceSetSheetGooglePrivateKey, reduceSetSheetGoogleServiceAccountEmail, reduceSetSheetTTServiceDocumentId } from "../helpers/settings"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_SETTING_STATE: return reduceSetSettingsState(state, action.payload.state)
        case DOCUMENT_ID_CHANGED: return reduceSetSheetDocumentId(state, action.payload.documentId)
        case TT_SERVICE_DOCUMENT_ID_CHANGED: return reduceSetSheetTTServiceDocumentId(state, action.payload.documentId)
        case GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED: return reduceSetSheetGoogleServiceAccountEmail(state, action.payload.googleServiceAccountEmail)
        case GOOGLE_PRIVATE_KEY_CHANGED: return reduceSetSheetGooglePrivateKey(state, action.payload.googlePrivateKey)
        case ENABLE_FEATURE: return reduceEnableFeature(state, action.payload.featureId, action.payload.enabled)
        default: return state
    }
}
