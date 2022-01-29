import { MOVE_TO_HIDDEN, MOVE_TO_VISIBLE, loadInventoryState, SET_HIDDEN_EXPANDED, SET_VISIBLE_EXPANDED, SORT_HIDDEN_BY, SORT_VISIBLE_BY } from "../actions/inventory"
import { PAGE_LOADED } from "../actions/ui"
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
        case MOVE_TO_HIDDEN:
        case MOVE_TO_VISIBLE: {
            const state: InventoryState = getInventory(getState())
            const stateNoItems: InventoryState = { // items can be reconstructed
                ...state,
                visible: {
                    ...state.visible,
                    items: []
                },
                hidden: {
                    ...state.hidden,
                    items: []
                }
            }
            await api.storage.saveInventoryState(stateNoItems)
            break
        }
    }
}

export default [
    requests
]