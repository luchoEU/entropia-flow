const SELECT_MENU = "[menu] select"
const SELECT_FOR_ACTION = "[menu] select for action"

const MONITOR_PAGE = 0
const INVENTORY_PAGE = 1
const STREAM_PAGE = 2
const ABOUT_PAGE = 3
const TRADE_PAGE = 4
const CRAFT_PAGE = 5
const SETTING_PAGE = 6
const REFINED_PAGE = 7
const GAME_LOG_PAGE = 8
const CONNECTION_PAGE = 9
const GAME_SPLIT_PAGE = 10

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
    MONITOR_PAGE,
    INVENTORY_PAGE,
    STREAM_PAGE,
    ABOUT_PAGE,
    CRAFT_PAGE,
    TRADE_PAGE,
    SETTING_PAGE,
    REFINED_PAGE,
    GAME_LOG_PAGE,
    CONNECTION_PAGE,
    GAME_SPLIT_PAGE,
    selectMenu,
    selectForAction,
}
