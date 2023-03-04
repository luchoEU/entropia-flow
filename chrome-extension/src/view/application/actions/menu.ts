const SELECT_MENU = "[menu] select"
const MONITOR_PAGE = 0
const INVENTORY_PAGE = 1
const STREAM_PAGE = 2
const AUCTION_PAGE = 3
const ABOUT_PAGE = 4
const TRADE_PAGE = 5
const CRAFT_PAGE = 6

const selectMenu = (menu: number) => ({
    type: SELECT_MENU,
    payload: {
        menu
    }
})

export {
    SELECT_MENU,
    MONITOR_PAGE,
    INVENTORY_PAGE,
    STREAM_PAGE,
    AUCTION_PAGE,
    ABOUT_PAGE,
    CRAFT_PAGE,
    TRADE_PAGE,
    selectMenu
}