import { initialState, setCurrentInventory, setHiddenExpanded, loadInventoryState, setVisibleExpanded, sortHiddenBy, sortVisibleBy, hideByName, showByName, hideByContainer, showByContainer, hideByValue, showByValue, showAll, setAuctionExpanded, sortAuctionBy, setAvailableExpanded, addAvailable, removeAvailable, sortAvailableBy, setBlueprintsExpanded, setTTServiceExpanded, setByStoreExpanded, setByStoreItemExpanded, setByStoreInventoryFilter, setHiddenFilter, setVisibleFilter, setByStoreItemName, startByStoreItemNameEditing, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing } from "../helpers/inventory"
import { SET_CURRENT_INVENTORY, SET_HIDDEN_EXPANDED, LOAD_INVENTORY_STATE, SET_VISIBLE_EXPANDED, SORT_HIDDEN_BY, SORT_VISIBLE_BY, HIDE_BY_NAME, SHOW_BY_VALUE, HIDE_BY_CONTAINER, SHOW_BY_CONTAINER, SHOW_BY_NAME, HIDE_BY_VALUE, SHOW_ALL, SET_AUCTION_EXPANDED, SORT_AUCTION_BY, SET_AVAILABLE_EXPANDED, ADD_AVAILABLE, REMOVE_AVAILABLE, SORT_AVAILABLE_BY, SET_BLUEPRINTS_EXPANDED, SET_TT_SERVICE_EXPANDED, SET_BY_STORE_EXPANDED, SET_BY_STORE_ITEM_EXPANDED, SET_BY_STORE_FILTER, SET_HIDDEN_FILTER, SET_VISIBLE_FILTER, SET_BY_STORE_ITEM_NAME, START_BY_STORE_ITEM_NAME_EDITING, CONFIRM_BY_STORE_ITEM_NAME_EDITING, CANCEL_BY_STORE_ITEM_NAME_EDITING } from "../actions/inventory"

export default (state = initialState, action) => {
    switch (action.type) {
        case LOAD_INVENTORY_STATE: return loadInventoryState(state, action.payload.state)
        case SET_CURRENT_INVENTORY: return setCurrentInventory(state, action.payload.inventory)
        case SET_AUCTION_EXPANDED: return setAuctionExpanded(state, action.payload.expanded)
        case SET_AVAILABLE_EXPANDED: return setAvailableExpanded(state, action.payload.expanded)
        case SET_TT_SERVICE_EXPANDED: return setTTServiceExpanded(state, action.payload.expanded)
        case SET_VISIBLE_EXPANDED: return setVisibleExpanded(state, action.payload.expanded)
        case SET_VISIBLE_FILTER: return setVisibleFilter(state, action.payload.filter)
        case SET_HIDDEN_EXPANDED: return setHiddenExpanded(state, action.payload.expanded)
        case SET_HIDDEN_FILTER: return setHiddenFilter(state, action.payload.filter)
        case SET_BLUEPRINTS_EXPANDED: return setBlueprintsExpanded(state, action.payload.expanded)
        case SET_BY_STORE_EXPANDED: return setByStoreExpanded(state, action.payload.expanded)
        case SET_BY_STORE_ITEM_EXPANDED: return setByStoreItemExpanded(state, action.payload.id, action.payload.expanded)
        case SET_BY_STORE_FILTER: return setByStoreInventoryFilter(state, action.payload.filter)
        case START_BY_STORE_ITEM_NAME_EDITING: return startByStoreItemNameEditing(state, action.payload.id)
        case CONFIRM_BY_STORE_ITEM_NAME_EDITING: return confirmByStoreItemNameEditing(state, action.payload.id)
        case CANCEL_BY_STORE_ITEM_NAME_EDITING: return cancelByStoreItemNameEditing(state, action.payload.id)
        case SET_BY_STORE_ITEM_NAME: return setByStoreItemName(state, action.payload.id, action.payload.name)
        case SORT_AUCTION_BY: return sortAuctionBy(state, action.payload.part)
        case SORT_VISIBLE_BY: return sortVisibleBy(state, action.payload.part)
        case SORT_HIDDEN_BY: return sortHiddenBy(state, action.payload.part)
        case SORT_AVAILABLE_BY: return sortAvailableBy(state, action.payload.part)
        case HIDE_BY_NAME: return hideByName(state, action.payload.name)
        case SHOW_BY_NAME: return showByName(state, action.payload.name)
        case HIDE_BY_CONTAINER: return hideByContainer(state, action.payload.container)
        case SHOW_BY_CONTAINER: return showByContainer(state, action.payload.container)
        case HIDE_BY_VALUE: return hideByValue(state, action.payload.value)
        case SHOW_BY_VALUE: return showByValue(state, action.payload.value)
        case SHOW_ALL: return showAll(state)
        case ADD_AVAILABLE: return addAvailable(state, action.payload.name)
        case REMOVE_AVAILABLE: return removeAvailable(state, action.payload.name)
        default: return state
    }
}
