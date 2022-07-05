import { initialState, setHistoryList, sortBy, setItemExpanded, setHistoryExpanded, setHistoryIntervalId } from "../helpers/history"
import { SET_HISTORY_LIST, SET_ITEM_EXPANDED, SET_HISTORY_EXPANDED, SORT_BY, SET_HISTORY_INTERVAL_ID } from "../actions/history"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_HISTORY_LIST: return setHistoryList(state, action.payload.list, action.payload.last)
        case SET_HISTORY_EXPANDED: return setHistoryExpanded(state, action.payload.expanded)
        case SET_ITEM_EXPANDED: return setItemExpanded(state, action.payload.key, action.payload.expanded)
        case SET_HISTORY_INTERVAL_ID: return setHistoryIntervalId(state, action.payload.intervalId)
        case SORT_BY: return sortBy(state, action.payload.key, action.payload.part)
        default: return state
    }
}