import { Feature } from "../../view/application/state/settings";
import { createStorageHelpers } from "../../view/application/atoms/chromeStoragePersistence";

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

export {
    isUnfreezeTabEnabled,
    isNotificationEnabled
}
