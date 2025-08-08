import { mergeDeep } from "../../common/merge";
import { initialState } from "../../view/application/helpers/settings";
import { Feature, isFeatureEnabled, SettingsState } from "../../view/application/state/settings";
import apiStorage from "../../view/services/api/storage";

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
