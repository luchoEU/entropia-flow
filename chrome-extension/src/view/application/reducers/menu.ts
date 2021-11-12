import { INVENTORY_PAGE, SELECT_MENU } from "../actions/menu"

export default (state = INVENTORY_PAGE, action) => {
    switch (action.type) {
        case SELECT_MENU: return action.payload.menu
        default: return state
    }
}