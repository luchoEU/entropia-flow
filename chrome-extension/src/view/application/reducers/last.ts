import { initialState, reduceAddActions, reduceAddPeds, reduceExclude, reduceExcludeWarnings, reduceInclude, reduceOnLast, reducePermanentExclude, reduceRemovePeds, reduceSetBlacklist, reduceSetExpanded, reduceSetPeds, reduceSetPermanentBlacklist, reduceSortByPart } from "../helpers/last"
import { EXCLUDE, INCLUDE, ON_LAST, SORT_BY, SET_EXPANDED, SET_BLACKLIST, EXCLUDE_WARNINGS, SET_PEDS, ADD_PEDS, REMOVE_PEDS, PERMANENT_EXCLUDE, SET_PERMANENT_BLACKLIST, ADD_ACTIONS } from "../actions/last"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_BLACKLIST: return reduceSetBlacklist(state, action.payload.list)
        case SET_PERMANENT_BLACKLIST: return reduceSetPermanentBlacklist(state, action.payload.list)
        case ON_LAST: return reduceOnLast(state, action.payload.list, action.payload.last)
        case SORT_BY: return reduceSortByPart(state, action.payload.part)
        case SET_EXPANDED: return reduceSetExpanded(state, action.payload.expanded)
        case INCLUDE: return reduceInclude(state, action.payload.key)
        case EXCLUDE: return reduceExclude(state, action.payload.key)
        case EXCLUDE_WARNINGS: return reduceExcludeWarnings(state)
        case PERMANENT_EXCLUDE: return reducePermanentExclude(state, action.payload.key, action.payload.value)
        case SET_PEDS: return reduceSetPeds(state, action.payload.peds)
        case ADD_PEDS: return reduceAddPeds(state, action.payload.value)
        case REMOVE_PEDS: return reduceRemovePeds(state, action.payload.key)
        case ADD_ACTIONS: return reduceAddActions(state, action.payload.availableCriteria)
        default: return state
    }
}