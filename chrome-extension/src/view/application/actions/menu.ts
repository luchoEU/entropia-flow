import { SHOW_BUDGET_PAGE, SHOW_REFINED_PAGE, SHOW_SETTINGS_PAGE } from "../../../config"

const SELECT_MENU = "[menu] select"
const SELECT_FOR_ACTION = "[menu] select for action"

const EMPTY_PAGE = -1
const MONITOR_PAGE = 0
const INVENTORY_PAGE = 1
const STREAM_PAGE = 2
const ABOUT_PAGE = 3
const TRADE_PAGE = 4
const CRAFT_PAGE = 5
const BUDGET_PAGE = 6
const SETTING_PAGE = 7
const REFINED_PAGE = 8
const CLIENT_PAGE = 9

const tabOrder = [
    MONITOR_PAGE,
    INVENTORY_PAGE,
    TRADE_PAGE,
    CRAFT_PAGE,
    CLIENT_PAGE,
    STREAM_PAGE,
    REFINED_PAGE,
    BUDGET_PAGE,
    SETTING_PAGE,
    ABOUT_PAGE
]

const tabShow = (id: number, show: boolean): boolean => {
    switch (id) {
        case INVENTORY_PAGE: return show
        case REFINED_PAGE: return SHOW_REFINED_PAGE
        case BUDGET_PAGE: return SHOW_BUDGET_PAGE
        case SETTING_PAGE: return SHOW_SETTINGS_PAGE
        default: return true
    }
}

const selectMenu = (menu: number) => ({
    type: SELECT_MENU,
    payload: {
        menu
    }
})

const selectForAction = (menu: number, name: string) => ({
    type: SELECT_FOR_ACTION,
    payload: {
        menu,
        name
    }
})

export {
    SELECT_MENU,
    SELECT_FOR_ACTION,
    EMPTY_PAGE,
    MONITOR_PAGE,
    INVENTORY_PAGE,
    STREAM_PAGE,
    ABOUT_PAGE,
    CRAFT_PAGE,
    BUDGET_PAGE,
    TRADE_PAGE,
    SETTING_PAGE,
    REFINED_PAGE,
    CLIENT_PAGE,
    tabOrder,
    tabShow,
    selectMenu,
    selectForAction,
}
