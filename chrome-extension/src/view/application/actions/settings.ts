import { SettingsState } from "../state/settings"

const SET_SETTING_STATE = "[setting] set state"
const DOCUMENT_ID_CHANGED = "[setting] document id changed"
const TT_SERVICE_DOCUMENT_ID_CHANGED = "[setting] tt service document id changed"
const GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED = "[setting] google service account email changed" 
const GOOGLE_PRIVATE_KEY_CHANGED = "[setting] google private key changed"
const ENABLE_FEATURE = "[setting] enable feature"

const setSettingsState = (state: SettingsState) => ({
    type: SET_SETTING_STATE,
    payload: {
        state
    }
})

const documentIdSettingChanged = (documentId: string) => ({
    type: DOCUMENT_ID_CHANGED,
    payload: {
        documentId
    }
})

const ttServiceDocumentIdSettingChanged = (documentId: string) => ({
    type: TT_SERVICE_DOCUMENT_ID_CHANGED,
    payload: {
        documentId
    }
})

const googleServiceAccountEmailChanged = (googleServiceAccountEmail: string) => ({
    type: GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED,
    payload: {
        googleServiceAccountEmail
    }
})

const googlePrivateKeyChanged = (googlePrivateKey: string) => ({
    type: GOOGLE_PRIVATE_KEY_CHANGED,
    payload: {
        googlePrivateKey
    }
})

const enableFeature = (featureId: string, enabled: boolean) => ({
    type: ENABLE_FEATURE,
    payload: {
        featureId,
        enabled
    }
})

export {
    SET_SETTING_STATE,
    DOCUMENT_ID_CHANGED,
    TT_SERVICE_DOCUMENT_ID_CHANGED,
    GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED,
    GOOGLE_PRIVATE_KEY_CHANGED,
    ENABLE_FEATURE,
    setSettingsState,
    documentIdSettingChanged,
    ttServiceDocumentIdSettingChanged,
    googleServiceAccountEmailChanged,
    googlePrivateKeyChanged,
    enableFeature,
}