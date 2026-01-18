import { initialState, reduceSetHistoryList, reduceSetItemExpanded, reduceSetHistoryIntervalId, reduceHistorySortBy, reduceToggleActionsView } from "../helpers/history"
import { SET_HISTORY_LIST, SET_ITEM_EXPANDED, SORT_BY, SET_HISTORY_INTERVAL_ID, TOGGLE_ACTIONS_VIEW } from "../actions/history"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_HISTORY_LIST: return reduceSetHistoryList(state, action.payload.list, action.payload.last)
        case SET_ITEM_EXPANDED: return reduceSetItemExpanded(state, action.payload.key, action.payload.expanded)
        case SET_HISTORY_INTERVAL_ID: return reduceSetHistoryIntervalId(state, action.payload.intervalId)
        case SORT_BY: return reduceHistorySortBy(state, action.payload.key, action.payload.part)
        case TOGGLE_ACTIONS_VIEW: return reduceToggleActionsView(state, action.payload.key)
        default: return state
    }
}
