import { Feature } from "../../view/application/state/settings";
import { createStorageHelpers } from "../../view/application/atoms/chromeStoragePersistence";
import { SettingsState } from "../../view/application/state/settings";

const featuresStorage = createStorageHelpers<Feature[]>('settings-features')

async function _getFeatures(): Promise<Feature[]> {
    const features = await featuresStorage.load()
    return features ?? [Feature.unfreezeTab]
}

async function isUnfreezeTabEnabled(): Promise<boolean> {
    const features = await _getFeatures()
    return features.includes(Feature.unfreezeTab)
}

async function isNotificationEnabled(): Promise<boolean> {
    const features = await _getFeatures()
    return features.includes(Feature.notification)
}

async function getBackgroundSettings(): Promise<SettingsState> {
    return {
        sheet: {},
        features: await _getFeatures(),
    }
}

export {
    isUnfreezeTabEnabled,
    isNotificationEnabled,
    getBackgroundSettings,
}
