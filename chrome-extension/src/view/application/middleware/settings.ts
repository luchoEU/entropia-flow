import { DOCUMENT_ID_CHANGED, GOOGLE_PRIVATE_KEY_CHANGED, GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED, setSettingsState, SET_SHEET_EXPANDED } from "../actions/settings"
import { PAGE_LOADED } from "../actions/ui"
import { getSettings } from "../selectors/settings"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadSettings()
            if (state)
                dispatch(setSettingsState(state))
            break
        }
        case SET_SHEET_EXPANDED:
        case DOCUMENT_ID_CHANGED:
        case GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED:
        case GOOGLE_PRIVATE_KEY_CHANGED: {
            const state = getSettings(getState())
            await api.storage.saveSettings(state)
            break
        }
    }
}

export default [
    requests
]
