import { SHOW_BUDGET_IN_CRAFT } from "../../../config";

const featureList: FeatureInfo[] = [
    {
        id: 'ttService',
        title: 'TT Service',
        description: 'Integration with <a href="bit.ly/dmTTservice">Dark Matter TT Service</a>',
        components: ['sheet', 'tradeColumn', 'reload']
    }
]

const FEATURE_TT_SERVICE_SHEET_SETTING: FeatureComponentId = { id: 'ttService', component: 'sheet' }
const FEATURE_TT_SERVICE_TRADE_COLUMN: FeatureComponentId = { id: 'ttService', component: 'tradeColumn' }
const FEATURE_TT_SERVICE_RELOAD: FeatureComponentId = { id: 'ttService', component: 'reload' }
const FEATURE_SHOW_SHEET_SETTINGS: FeatureComponentId = SHOW_BUDGET_IN_CRAFT ? { id: 'const', component: 'true' } : FEATURE_TT_SERVICE_TRADE_COLUMN

const isFeatureEnabled = (feature: FeatureComponentId, state: SettingsState): boolean =>
    feature.id === 'const' ? feature.component === 'true' :
        state.features.includes(feature.id) &&
        featureList.find(f => f.id === feature.id).components.some(c => c === feature.component);

interface FeatureComponentId {
    id: string // ID of feature
    component: string // ID of component
}

interface FeatureInfo {
    id: string
    title: string
    description: string
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