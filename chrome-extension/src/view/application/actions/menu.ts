const SELECT_MENU = "[menu] select"
const INVENTORY_PAGE = 0
const AUCTION_PAGE = 1
const ABOUT_PAGE = 2

const selectMenu = (menu: number) => ({
    type: SELECT_MENU,
    payload: {
        menu
    }
})

export {
    SELECT_MENU,
    INVENTORY_PAGE,
    AUCTION_PAGE,
    ABOUT_PAGE,
    selectMenu
}