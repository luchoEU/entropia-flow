import { initialState, moveToHidden, moveToVisible, setCurrentInventory, setHiddenExpanded, loadInventoryState, setVisibleExpanded, sortHiddenBy, sortVisibleBy } from "../helpers/inventory"
import { MOVE_TO_HIDDEN, MOVE_TO_VISIBLE, SET_CURRENT_INVENTORY, SET_HIDDEN_EXPANDED, LOAD_INVENTORY_STATE, SET_VISIBLE_EXPANDED, SORT_HIDDEN_BY, SORT_VISIBLE_BY } from "../actions/inventory"

export default (state = initialState, action) => {
    switch (action.type) {
        case LOAD_INVENTORY_STATE: return loadInventoryState(state, action.payload.state)
        case SET_CURRENT_INVENTORY: return setCurrentInventory(state, action.payload.inventory)
        case SET_VISIBLE_EXPANDED: return setVisibleExpanded(state, action.payload.expanded)
        case SET_HIDDEN_EXPANDED: return setHiddenExpanded(state, action.payload.expanded)
        case SORT_VISIBLE_BY: return sortVisibleBy(state, action.payload.part)
        case SORT_HIDDEN_BY: return sortHiddenBy(state, action.payload.part)
        case MOVE_TO_HIDDEN: return moveToHidden(state, action.payload.name)
        case MOVE_TO_VISIBLE: return moveToVisible(state, action.payload.name)
        default: return state
    }
}
