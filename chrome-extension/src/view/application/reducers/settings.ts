import { DOCUMENT_ID_CHANGED, GOOGLE_PRIVATE_KEY_CHANGED, GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED, SET_SETTING_STATE, TT_SERVICE_DOCUMENT_ID_CHANGED } from "../actions/settings"
import { initialState, setSheetDocumentId, setSheetGooglePrivateKey, setSheetGoogleServiceAccountEmail, setSheetTTServiceDocumentId, setState } from "../helpers/settings"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_SETTING_STATE: return setState(state, action.payload.state)
        case DOCUMENT_ID_CHANGED: return setSheetDocumentId(state, action.payload.documentId)
        case TT_SERVICE_DOCUMENT_ID_CHANGED: return setSheetTTServiceDocumentId(state, action.payload.documentId)
        case GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED: return setSheetGoogleServiceAccountEmail(state, action.payload.googleServiceAccountEmail)
        case GOOGLE_PRIVATE_KEY_CHANGED: return setSheetGooglePrivateKey(state, action.payload.googlePrivateKey)
        default: return state
    }
}
