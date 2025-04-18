import { mergeDeep } from "../../../common/merge"
import { DOCUMENT_ID_CHANGED, ENABLE_FEATURE, GOOGLE_PRIVATE_KEY_CHANGED, GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED, setSettingsState, TT_SERVICE_DOCUMENT_ID_CHANGED } from "../actions/settings"
import { AppAction } from "../slice/app"
import { initialState } from "../helpers/settings"
import { getSettings } from "../selectors/settings"
import { SettingsState } from "../state/settings"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: SettingsState = await api.storage.loadSettings()
            if (state)
                dispatch(setSettingsState(mergeDeep(initialState, state)))
            break
        }
        case DOCUMENT_ID_CHANGED:
        case TT_SERVICE_DOCUMENT_ID_CHANGED:
        case GOOGLE_SERVICE_ACCOUNT_EMAIL_CHANGED:
        case GOOGLE_PRIVATE_KEY_CHANGED:
        case ENABLE_FEATURE: {
            const state: SettingsState = getSettings(getState())
            await api.storage.saveSettings(state)
            break
        }
    }
}

export default [
    requests
]
