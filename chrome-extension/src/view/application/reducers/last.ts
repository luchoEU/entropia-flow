import { initialState, reduceAddActions, reduceAddNotificationsDone, reduceAddPeds, reduceApplyMarkup, reduceExclude, reduceExcludeWarnings, reduceInclude, reduceOnLast, reducePermanentExclude, reduceRemovePeds, reduceSetExpanded, reduceSetLastItemMode, reduceSetLastShowMarkup, reduceSetLastState, reduceSortByPart } from "../helpers/last"
import { EXCLUDE, INCLUDE, ON_LAST, SORT_BY, SET_EXPANDED, EXCLUDE_WARNINGS, ADD_PEDS, REMOVE_PEDS, PERMANENT_EXCLUDE, ADD_ACTIONS, ADD_NOTIFICATIONS_DONE, SET_LAST_ITEM_MODE, SET_LAST_SHOW_MARKUP, SET_LAST_STATE, APPLY_MARKUP_TO_LAST } from "../actions/last"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_LAST_STATE: return reduceSetLastState(state, action.payload.state)
        case ON_LAST: return reduceOnLast(state, action.payload.list, action.payload.last)
        case SORT_BY: return reduceSortByPart(state, action.payload.part)
        case SET_EXPANDED: return reduceSetExpanded(state, action.payload.expanded)
        case INCLUDE: return reduceInclude(state, action.payload.key)
        case EXCLUDE: return reduceExclude(state, action.payload.key)
        case EXCLUDE_WARNINGS: return reduceExcludeWarnings(state)
        case PERMANENT_EXCLUDE: return reducePermanentExclude(state, action.payload.key, action.payload.value)
        case SET_LAST_ITEM_MODE: return reduceSetLastItemMode(state, action.payload.key, action.payload.mode)
        case SET_LAST_SHOW_MARKUP: return reduceSetLastShowMarkup(state, action.payload.showMarkup)
        case ADD_PEDS: return reduceAddPeds(state, action.payload.value)
        case REMOVE_PEDS: return reduceRemovePeds(state, action.payload.key)
        case ADD_ACTIONS: return reduceAddActions(state, action.payload.availableCriteria)
        case ADD_NOTIFICATIONS_DONE: return reduceAddNotificationsDone(state, action.payload.messages)
        case APPLY_MARKUP_TO_LAST: return reduceApplyMarkup(state, action.payload.materials)
        default: return state
    }
}
