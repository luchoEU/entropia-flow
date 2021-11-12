import { initialState, processList, sortBy, setItemExpanded, setListExpanded } from "../helpers/history"
import { SET_INVENTORY_LIST, SET_ITEM_EXPANDED, SET_LIST_EXPANDED, SORT_BY } from "../actions/history"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_INVENTORY_LIST: return processList(state, action.payload.list, action.payload.last)
        case SET_LIST_EXPANDED: return setListExpanded(state, action.payload.expanded)
        case SET_ITEM_EXPANDED: return setItemExpanded(state, action.payload.key, action.payload.expanded)
        case SORT_BY: return sortBy(state, action.payload.key, action.payload.part)
        default: return state
    }
}