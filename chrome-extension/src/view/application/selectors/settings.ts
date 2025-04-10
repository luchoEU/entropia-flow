import { FeatureComponentId, SettingsState, SheetAccessInfo, isFeatureEnabled as stateIsFeatureEnabled } from "../state/settings";

export const getSettings = (state: any): SettingsState => state.settings
export const getSheetSettings = (state: any): SheetAccessInfo => getSettings(state).sheet
export const isFeatureEnabled = (feature: FeatureComponentId) => (state: any): boolean => stateIsFeatureEnabled(feature, getSettings(state));
