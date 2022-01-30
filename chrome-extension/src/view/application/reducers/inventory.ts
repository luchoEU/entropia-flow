import { initialState, setCurrentInventory, setHiddenExpanded, loadInventoryState, setVisibleExpanded, sortHiddenBy, sortVisibleBy, hideByName, showByName, hideByContainer, showByContainer, hideByValue, showByValue } from "../helpers/inventory"
import { SET_CURRENT_INVENTORY, SET_HIDDEN_EXPANDED, LOAD_INVENTORY_STATE, SET_VISIBLE_EXPANDED, SORT_HIDDEN_BY, SORT_VISIBLE_BY, HIDE_BY_NAME, SHOW_BY_VALUE, HIDE_BY_CONTAINER, SHOW_BY_CONTAINER, SHOW_BY_NAME, HIDE_BY_VALUE } from "../actions/inventory"

export default (state = initialState, action) => {
    switch (action.type) {
        case LOAD_INVENTORY_STATE: return loadInventoryState(state, action.payload.state)
        case SET_CURRENT_INVENTORY: return setCurrentInventory(state, action.payload.inventory)
        case SET_VISIBLE_EXPANDED: return setVisibleExpanded(state, action.payload.expanded)
        case SET_HIDDEN_EXPANDED: return setHiddenExpanded(state, action.payload.expanded)
        case SORT_VISIBLE_BY: return sortVisibleBy(state, action.payload.part)
        case SORT_HIDDEN_BY: return sortHiddenBy(state, action.payload.part)
        case HIDE_BY_NAME: return hideByName(state, action.payload.name)
        case SHOW_BY_NAME: return showByName(state, action.payload.name)
        case HIDE_BY_CONTAINER: return hideByContainer(state, action.payload.container)
        case SHOW_BY_CONTAINER: return showByContainer(state, action.payload.container)
        case HIDE_BY_VALUE: return hideByValue(state, action.payload.value)
        case SHOW_BY_VALUE: return showByValue(state, action.payload.value)
        default: return state
    }
}
