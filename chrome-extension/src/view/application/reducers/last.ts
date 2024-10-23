import { addPeds, permanentExclude, exclude, excludeWarnings, include, initialState, reduceOnLast, removePeds, setPermanentBlacklist, setBlacklist, setExpanded, setPeds, sortByPart, addActions } from "../helpers/last"
import { EXCLUDE, INCLUDE, ON_LAST, SORT_BY, SET_EXPANDED, SET_BLACKLIST, EXCLUDE_WARNINGS, SET_PEDS, ADD_PEDS, REMOVE_PEDS, PERMANENT_EXCLUDE, SET_PERMANENT_BLACKLIST, ADD_ACTIONS } from "../actions/last"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_BLACKLIST: return setBlacklist(state, action.payload.list)
        case SET_PERMANENT_BLACKLIST: return setPermanentBlacklist(state, action.payload.list)
        case ON_LAST: return reduceOnLast(state, action.payload.list, action.payload.last)
        case SORT_BY: return sortByPart(state, action.payload.part)
        case SET_EXPANDED: return setExpanded(state, action.payload.expanded)
        case INCLUDE: return include(state, action.payload.key)
        case EXCLUDE: return exclude(state, action.payload.key)
        case EXCLUDE_WARNINGS: return excludeWarnings(state)
        case PERMANENT_EXCLUDE: return permanentExclude(state, action.payload.key, action.payload.value)
        case SET_PEDS: return setPeds(state, action.payload.peds)
        case ADD_PEDS: return addPeds(state, action.payload.value)
        case REMOVE_PEDS: return removePeds(state, action.payload.key)
        case ADD_ACTIONS: return addActions(state, action.payload.availableCriteria)
        default: return state
    }
}