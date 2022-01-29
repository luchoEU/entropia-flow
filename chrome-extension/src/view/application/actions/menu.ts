const SELECT_MENU = "[menu] select"
const MONITOR_PAGE = 0
const INVENTORY_PAGE = 1
const STREAM_PAGE = 2
const AUCTION_PAGE = 3
const ABOUT_PAGE = 4

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
    selectMenu
}