import { SHOW_BUDGET_IN_CRAFT, SHOW_FEATURES_IN_DEVELOPMENT } from "../../../config";

const featureList: FeatureInfo[] = [
    {
        id: 'ttService',
        title: 'TT Service',
        description: 'Integration with <a href="bit.ly/dmTTservice">Dark Matter TT Service</a>',
        development: true,
        components: ['sheet', 'tradeColumn', 'reload']
    }
]

const FEATURE_TT_SERVICE_SHEET_SETTING: FeatureComponentId = { id: 'ttService', component: 'sheet' }
const FEATURE_TT_SERVICE_TRADE_COLUMN: FeatureComponentId = { id: 'ttService', component: 'tradeColumn' }
const FEATURE_TT_SERVICE_RELOAD: FeatureComponentId = { id: 'ttService', component: 'reload' }
const FEATURE_SHOW_SHEET_SETTINGS: FeatureComponentId = SHOW_BUDGET_IN_CRAFT ? { id: 'const', component: 'true' } : FEATURE_TT_SERVICE_TRADE_COLUMN

const isFeatureEnabled = (feature: FeatureComponentId, state: SettingsState): boolean => {
    if (feature.id === 'const')
        return feature.component === 'true';

    const f = featureList.find(f => f.id === feature.id)
    if (!f || f.development && !SHOW_FEATURES_IN_DEVELOPMENT)
        return false;

    return state.features.includes(feature.id) && f.components.some(c => c === feature.component);
}

interface FeatureComponentId {
    id: string // ID of feature
    component: string // ID of component
}

interface FeatureInfo {
    id: string
    title: string
    description: string
    development: boolean
    components: string[] // ID of components
}

interface SettingsState {
    sheet: SheetAccessInfo
    features: string[] // ID of enabled features
}

interface SheetAccessInfo {
    documentId: string
    ttServiceDocumentId: string
    googleServiceAccountEmail: string
    googlePrivateKey: string
}   

export {
    featureList,
    FEATURE_TT_SERVICE_SHEET_SETTING,
    FEATURE_TT_SERVICE_TRADE_COLUMN,
    FEATURE_TT_SERVICE_RELOAD,
    FEATURE_SHOW_SHEET_SETTINGS,
    isFeatureEnabled,
    FeatureComponentId,
    SheetAccessInfo,
    SettingsState
}