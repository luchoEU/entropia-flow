import { STRING_PLEASE_LOG_IN } from "../../../common/const"
import { SHOW_REFINED_PAGE, SHOW_BUDGET_PAGE, SHOW_SETTINGS_PAGE } from "../../../config"
import { MONITOR_PAGE, INVENTORY_PAGE, TRADE_PAGE, CRAFT_PAGE, CLIENT_PAGE, STREAM_PAGE, REFINED_PAGE, BUDGET_PAGE, SETTING_PAGE, ABOUT_PAGE } from "../actions/menu"
import { SettingsState, isFeatureEnabled, FEATURE_CLIENT_TAB } from "../state/settings"

const tabTitle = {
    [MONITOR_PAGE]: 'Monitor',
    [INVENTORY_PAGE]: 'Inventory',
    [TRADE_PAGE]: 'Trading',
    [CRAFT_PAGE]: 'Crafting',
    [CLIENT_PAGE]: 'Client',
    [STREAM_PAGE]: 'Stream',
    [REFINED_PAGE]: 'Refined',
    [BUDGET_PAGE]: 'Budget',
    [SETTING_PAGE]: 'Settings',
    [ABOUT_PAGE]: 'About'
}

const tabSubtitle = {
    [MONITOR_PAGE]: 'Monitor your Items from Entropia Universe site',
    [INVENTORY_PAGE]: 'Search and organize your Inventory',
    [TRADE_PAGE]: 'Trading hub to use for Auction and with other Players',
    [CRAFT_PAGE]: 'Crafting information center, all you need to know about your blueprints',
    [CLIENT_PAGE]: 'Connect with Entropia Flow Client and see your Game Log',
    [STREAM_PAGE]: 'Create and configure windows to your game information',
    [REFINED_PAGE]: 'Calculators for refined materials',
    [BUDGET_PAGE]: 'Budget your different activities',
    [SETTING_PAGE]: 'Settings for Entropia Flow',
    [ABOUT_PAGE]: 'Information about Entropia Flow'
}

const tabShow = (id: number, show: boolean, settings: SettingsState): boolean => {
    switch (id) {
        case INVENTORY_PAGE: return show
        case CLIENT_PAGE: return isFeatureEnabled(FEATURE_CLIENT_TAB, settings)
        case REFINED_PAGE: return SHOW_REFINED_PAGE
        case BUDGET_PAGE: return SHOW_BUDGET_PAGE
        case SETTING_PAGE: return SHOW_SETTINGS_PAGE
        default: return true
    }
}

const tabActionRequired = (id: number, message: string, status: string): string | undefined => {
    switch (id) {
        case MONITOR_PAGE: return message === STRING_PLEASE_LOG_IN ? 'Disconnected' : undefined
        case CLIENT_PAGE: return !status.startsWith('connected') && !status.startsWith('init') ? 'Disconnected' : undefined
        default: return undefined
    }
}

export {
    tabTitle,
    tabSubtitle,
    tabShow,
    tabActionRequired
}
