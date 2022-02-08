import { HIDE_BY_CONTAINER, HIDE_BY_NAME, HIDE_BY_VALUE, loadInventoryState, SET_HIDDEN_EXPANDED, SET_VISIBLE_EXPANDED, SHOW_ALL, SHOW_BY_CONTAINER, SHOW_BY_NAME, SHOW_BY_VALUE, SORT_HIDDEN_BY, SORT_VISIBLE_BY } from "../actions/inventory"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave } from "../helpers/inventory"
import { getInventory } from "../selectors/inventory"
import { InventoryState } from "../state/inventory"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadInventoryState()
            if (state)
                dispatch(loadInventoryState(state))
            break
        }
        case SET_VISIBLE_EXPANDED:
        case SET_HIDDEN_EXPANDED:
        case SORT_VISIBLE_BY:
        case SORT_HIDDEN_BY:
        case HIDE_BY_NAME:
        case SHOW_BY_NAME:
        case HIDE_BY_CONTAINER:
        case SHOW_BY_CONTAINER:
        case HIDE_BY_VALUE:
        case SHOW_BY_VALUE:
        case SHOW_ALL: {
            const state: InventoryState = getInventory(getState())
            await api.storage.saveInventoryState(cleanForSave(state))
            break
        }
    }
}

export default [
    requests
]