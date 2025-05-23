import { SET_TABULAR_DATA, SET_TABULAR_FILTER, SET_TABULAR_STATE, SORT_TABULAR_BY } from "../actions/tabular"
import { initialState, reduceSetTabularData, reduceSetTabularFilter, reduceSetTabularState, reduceSortTabularBy } from "../helpers/tabular"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_TABULAR_STATE: return reduceSetTabularState(state, action.payload.state)
        case SET_TABULAR_FILTER: return reduceSetTabularFilter(state, action.payload.selector, action.payload.filter)
        case SET_TABULAR_DATA: return reduceSetTabularData(state, action.payload.data)
        case SORT_TABULAR_BY: return reduceSortTabularBy(state, action.payload.selector, action.payload.column)
        default: return state
    }
}
