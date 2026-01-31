import { mergeDeep } from "../../common/merge";
import { Feature, isFeatureEnabled, SettingsState } from "../../view/application/state/settings";
import apiStorage from "../../view/services/api/storage";

const initialState: SettingsState = {
    sheet: {
        budgetDocumentId: undefined,
        ttServiceDocumentId: undefined,
        googleServiceAccountEmail: undefined,
        googlePrivateKey: undefined
    },
    features: [Feature.unfreezeTab]
}

async function _getSettings(): Promise<SettingsState> {
    const state = await apiStorage.loadSettings()
    return state ? mergeDeep(initialState, state) : initialState
}

async function isUnfreezeTabEnabled(): Promise<boolean> {
    return isFeatureEnabled(await _getSettings(), Feature.unfreezeTab)
}

async function isNotificationEnabled(): Promise<boolean> {
    return isFeatureEnabled(await _getSettings(), Feature.notification)
}

export {
    isUnfreezeTabEnabled,
    isNotificationEnabled
}
