import { Feature, SettingsState, SheetAccessInfo, isFeatureEnabled } from "../state/settings";

export const getSettings = (state: any): SettingsState => state.settings
export const getSheetSettings = (state: any): SheetAccessInfo => getSettings(state).sheet
export const selectIsFeatureEnabled = (feature: Feature) => (state: any): boolean => isFeatureEnabled(getSettings(state), feature);
