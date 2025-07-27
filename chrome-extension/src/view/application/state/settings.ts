import { SHOW_FEATURES_IN_DEVELOPMENT } from "../../../config";

enum Feature {
    client,
    streamBackgroundInDevelopment,
    refined,
    budget,
    ttService,
    actionLink,
    unfreezeTab,
    commaDecimalSeparator,
}

const featureList: FeatureInfo[] = [
    {
        id: Feature.client,
        title: 'Client',
        description: 'Integration with Entropia Flow Client',
        development: true,
        // related flag ADD_CLIENT_INITIAL_LAYOUTS
    },
    {
        id: Feature.streamBackgroundInDevelopment,
        title: 'Stream Background (in development)',
        description: 'Show stream background in development',
        development: true,
    },
    {
        id: Feature.refined,
        title: 'Refined',
        description: 'Show refined tab',
        development: true,
    },
    {
        id: Feature.budget,
        title: 'Budget',
        description: 'Integration with Google Document for Budget',
        development: true,
    },
    {
        id: Feature.ttService,
        title: 'TT Service',
        description: 'Integration with <a href="bit.ly/dmTTservice">Dark Matter TT Service</a>',
        development: true,
    },
    {
        id: Feature.actionLink,
        title: 'Action Link',
        description: 'Show action link',
        development: true,
    },
    {
        id: Feature.unfreezeTab,
        title: 'Unfreeze Tab',
        description: 'Briefly activate entropia universe items tab to unfreeze it when needed',
        explanation: `Since Chrome 132 (released in January 2025), tabs can become frozen after being inactive for some time.
This feature allows the extension to temporarily activate the tab to unfreeze it when needed.
You may notice a brief flicker when this happens.
Alternatively, you can choose to handle this manually by opening the tab yourself.`
    },
    {
        id: Feature.commaDecimalSeparator,
        title: 'Comma Decimal Separator',
        description: 'Use comma as separator instead of dot when copy to clipboard',
    },
]

const isFeatureEnabled = (state: SettingsState, feature: Feature): boolean => {
    const f = featureList.find(f => f.id === feature)
    if (!f || f.development && !SHOW_FEATURES_IN_DEVELOPMENT)
        return false;

    return state.features.includes(feature);
}

interface FeatureInfo {
    id: Feature
    title: string
    description: string
    explanation?: string
    development?: boolean
}

interface SettingsState {
    sheet: SheetAccessInfo
    features: Feature[] // ID of enabled features
}

interface SheetAccessInfo {
    budgetDocumentId: string
    ttServiceDocumentId: string
    googleServiceAccountEmail: string
    googlePrivateKey: string
}

export {
    featureList,
    isFeatureEnabled,
    Feature,
    SheetAccessInfo,
    SettingsState
}
