import { SET_EXPANDABLE_STATE, SET_EXPANDED } from "../actions/expandable"
import { initialExpandableState, reduceSetExpandableState, reduceSetExpanded } from "../helpers/expandable"


export default (state = initialExpandableState, action) => {
    switch (action.type) {
        case SET_EXPANDABLE_STATE: return reduceSetExpandableState(state, action.payload.state)
        case SET_EXPANDED: return reduceSetExpanded(state, action.payload.id, action.payload.expanded)
        default: return state
    }
}
