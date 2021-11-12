import { addPeds, exclude, excludeWarnings, include, initialState, onLast, removePeds, setBlacklist, setExpanded, setPeds } from "../helpers/last"
import { sortBy } from "../helpers/sort"
import { EXCLUDE, INCLUDE, ON_LAST, SORT_BY, SET_EXPANDED, SET_BLACKLIST, EXCLUDE_WARNINGS, SET_PEDS, ADD_PEDS, REMOVE_PEDS } from "../actions/last"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_BLACKLIST: return setBlacklist(state, action.payload.list)
        case ON_LAST: return onLast(state, action.payload.list, action.payload.last)
        case SORT_BY: return sortBy(state, action.payload.part)
        case SET_EXPANDED: return setExpanded(state, action.payload.expanded)
        case INCLUDE: return include(state, action.payload.key)
        case EXCLUDE: return exclude(state, action.payload.key)
        case EXCLUDE_WARNINGS: return excludeWarnings(state)
        case SET_PEDS: return setPeds(state, action.payload.peds)
        case ADD_PEDS: return addPeds(state, action.payload.value)
        case REMOVE_PEDS: return removePeds(state, action.payload.key)
        default: return state
    }
}