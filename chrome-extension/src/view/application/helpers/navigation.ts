import { STRING_PLEASE_LOG_IN } from "../../../common/const"
import { TabId, tabOrder } from "../state/navigation"
import { SettingsState, isFeatureEnabled, Feature } from "../state/settings"
import { Location } from "react-router-dom"

const tabTitle = {
    [TabId.MONITOR]: 'Monitor',
    [TabId.INVENTORY]: 'Inventory',
    [TabId.TRADE]: 'Trading',
    [TabId.CRAFT]: 'Crafting',
    [TabId.CLIENT]: 'Client',
    [TabId.STREAM]: 'Stream',
    [TabId.REFINED]: 'Refined',
    [TabId.BUDGET]: 'Budget',
    [TabId.ACTIVITY]: 'Activity',
    [TabId.SETTING]: 'Settings',
    [TabId.RAW_STORAGE]: 'Raw Storage',
    [TabId.ATOM_DEBUG]: 'Atom Debug',
    [TabId.ABOUT]: 'About'
}

const tabSubtitle = {
    [TabId.MONITOR]: 'Monitor your Items from Entropia Universe site',
    [TabId.INVENTORY]: 'Search and organize your Inventory',
    [TabId.TRADE]: 'Trading hub to use for Auction and with other Players',
    [TabId.CRAFT]: 'Crafting information center, all you need to know about your blueprints',
    [TabId.CLIENT]: 'Connect with Entropia Flow Client and see your Game Log',
    [TabId.STREAM]: 'Create and configure windows to your game information',
    [TabId.REFINED]: 'Calculators for refined materials',
    [TabId.BUDGET]: 'Budget your different activities',
    [TabId.ACTIVITY]: 'Timeline of activities inferred from your activity',
    [TabId.SETTING]: 'Settings for Entropia Flow',
    [TabId.RAW_STORAGE]: 'View and edit Chrome storage data',
    [TabId.ATOM_DEBUG]: 'Debug view for all Jotai atom values',
    [TabId.ABOUT]: 'Information about Entropia Flow'
}

const tabShow = (id: TabId, anyInventory: boolean, settings: SettingsState): boolean => {
    switch (id) {
        case TabId.INVENTORY:
        case TabId.TRADE:
        case TabId.CRAFT:
        case TabId.STREAM:
        case TabId.SETTING: return anyInventory
        case TabId.CLIENT: return isFeatureEnabled(settings, Feature.client)
        case TabId.REFINED: return isFeatureEnabled(settings, Feature.refined)
        case TabId.BUDGET: return isFeatureEnabled(settings, Feature.budget)
        case TabId.ACTIVITY: return isFeatureEnabled(settings, Feature.activity)
        case TabId.ATOM_DEBUG: return isFeatureEnabled(settings, Feature.atomDebug)
        default: return true
    }
}

const tabActionRequired = (id: TabId, message: string, status: string): string | undefined => {
    switch (id) {
        case TabId.MONITOR: return message === STRING_PLEASE_LOG_IN ? 'Disconnected' : undefined
        case TabId.CLIENT: return !status.startsWith('connected') && !status.startsWith('init') ? 'Disconnected' : undefined
        default: return undefined
    }
}

const getTabIdFromLocation = (location: Location): TabId => {
    const path = location.pathname as TabId
    return tabOrder.find(id => path.startsWith(id)) ?? TabId.MONITOR
}

const getLocationFromTabId = (id: TabId): string => {
    return tabOrder.includes(id) ? id : TabId.MONITOR;
}

const formatToUrl = (bpName: string | undefined) => bpName?.replace(/ /g, '_')
const formatFromUrl = (bpName: string | undefined) => bpName?.replace(/_/g, ' ')

export {
    tabTitle,
    tabSubtitle,
    tabShow,
    tabActionRequired,
    getTabIdFromLocation,
    getLocationFromTabId,
    formatToUrl,
    formatFromUrl,
}
