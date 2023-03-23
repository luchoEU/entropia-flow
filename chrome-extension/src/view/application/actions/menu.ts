const SELECT_MENU = "[menu] select"
const SELECT_FOR_ACTION = "[menu] select for action"

const MONITOR_PAGE = 0
const INVENTORY_PAGE = 1
const STREAM_PAGE = 2
const AUCTION_PAGE = 3
const ABOUT_PAGE = 4
const TRADE_PAGE = 5
const CRAFT_PAGE = 6
const SETTING_PAGE = 7
const REFINED_PAGE = 8

const selectMenu = (menu: number) => ({
    type: SELECT_MENU,
    payload: {
        menu
    }
})

const selectForAction = (action: number, name: string) => ({
    type: SELECT_FOR_ACTION,
    payload: {
        action,
        name
    }
})

export {
    SELECT_MENU,
    SELECT_FOR_ACTION,
    MONITOR_PAGE,
    INVENTORY_PAGE,
    STREAM_PAGE,
    AUCTION_PAGE,
    ABOUT_PAGE,
    CRAFT_PAGE,
    TRADE_PAGE,
    SETTING_PAGE,
    REFINED_PAGE,
    selectMenu,
    selectForAction,
}
