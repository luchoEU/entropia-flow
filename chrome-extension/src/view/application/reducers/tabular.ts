import { SET_TABULAR_DATA, SET_TABULAR_EXPANDED, SET_TABULAR_FILTER, SET_TABULAR_SORT_COLUMN_DEFINITION, SET_TABULAR_STATE, SORT_TABULAR_BY } from "../actions/tabular"
import { initialState, reduceSetTabularData, reduceSetTabularExpanded, reduceSetTabularFilter, reduceSetTabularSortColumnDefinition, reduceSetTabularState, reduceSortTabularBy } from "../helpers/tabular"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_TABULAR_STATE: return reduceSetTabularState(state, action.payload.state)
        case SET_TABULAR_EXPANDED: return reduceSetTabularExpanded(state, action.payload.selector, action.payload.expanded)
        case SET_TABULAR_FILTER: return reduceSetTabularFilter(state, action.payload.selector, action.payload.filter)
        case SET_TABULAR_DATA: return reduceSetTabularData(state, action.payload.selector, action.payload.data)
        case SET_TABULAR_SORT_COLUMN_DEFINITION: return reduceSetTabularSortColumnDefinition(state, action.payload.selector, action.payload.sortColumnDefinition)
        case SORT_TABULAR_BY: return reduceSortTabularBy(state, action.payload.selector, action.payload.column)
        default: return state
    }
}
