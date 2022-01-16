const SELECT_MENU = "[menu] select"
const INVENTORY_PAGE = 0
const STREAM_PAGE = 1
const AUCTION_PAGE = 2
const ABOUT_PAGE = 3

const selectMenu = (menu: number) => ({
    type: SELECT_MENU,
    payload: {
        menu
    }
})

export {
    SELECT_MENU,
    INVENTORY_PAGE,
    STREAM_PAGE,
    AUCTION_PAGE,
    ABOUT_PAGE,
    selectMenu
}