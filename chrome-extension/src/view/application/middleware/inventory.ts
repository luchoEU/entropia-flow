import { mergeDeep } from "../../../common/utils"
import { REMOVE_ACTIVE } from "../actions/actives"
import { ADD_AVAILABLE, HIDE_BY_CONTAINER, HIDE_BY_NAME, HIDE_BY_VALUE, loadInventoryState, SET_AUCTION_EXPANDED, SET_AVAILABLE_EXPANDED, SET_BLUEPRINTS_EXPANDED, SET_BY_STORE_EXPANDED, SET_BY_STORE_FILTER, SET_BY_STORE_ITEM_EXPANDED, SET_HIDDEN_EXPANDED, SET_HIDDEN_FILTER, SET_TT_SERVICE_EXPANDED, SET_VISIBLE_EXPANDED, SET_VISIBLE_FILTER, SHOW_ALL, SHOW_BY_CONTAINER, SHOW_BY_NAME, SHOW_BY_VALUE, SORT_AUCTION_BY, SORT_AVAILABLE_BY, SORT_HIDDEN_BY, SORT_VISIBLE_BY } from "../actions/inventory"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/inventory"
import { getInventory } from "../selectors/inventory"
import { InventoryState } from "../state/inventory"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: InventoryState = await api.storage.loadInventoryState()
            if (state)
                dispatch(loadInventoryState(mergeDeep(initialState, state)))
            break
        }
        case SET_AUCTION_EXPANDED:
        case SET_AVAILABLE_EXPANDED:
        case SET_TT_SERVICE_EXPANDED:
        case SET_VISIBLE_EXPANDED:
        case SET_VISIBLE_FILTER:
        case SET_HIDDEN_EXPANDED:
        case SET_HIDDEN_FILTER:
        case SET_BLUEPRINTS_EXPANDED:
        case SET_BY_STORE_EXPANDED:
        case SET_BY_STORE_ITEM_EXPANDED:
        case SET_BY_STORE_FILTER:
        case SORT_AUCTION_BY:
        case SORT_VISIBLE_BY:
        case SORT_HIDDEN_BY:
        case SORT_AVAILABLE_BY:
        case HIDE_BY_NAME:
        case SHOW_BY_NAME:
        case HIDE_BY_CONTAINER:
        case SHOW_BY_CONTAINER:
        case HIDE_BY_VALUE:
        case SHOW_BY_VALUE:
        case SHOW_ALL:
        case ADD_AVAILABLE:
        case REMOVE_ACTIVE: {
            const state: InventoryState = getInventory(getState())
            await api.storage.saveInventoryState(cleanForSave(state))
            break
        }
    }
}

export default [
    requests
]