import { SET_EXPANDABLE_STATE, SET_EXPANDED, SET_VISIBLE } from "../actions/expandable"
import { initialExpandableState, reduceSetExpandableState, reduceSetExpanded, reduceSetVisible } from "../helpers/expandable"


export default (state = initialExpandableState, action) => {
    switch (action.type) {
        case SET_EXPANDABLE_STATE: return reduceSetExpandableState(state, action.payload.state)
        case SET_EXPANDED: return reduceSetExpanded(state, action.payload.selector, action.payload.expanded)
        case SET_VISIBLE: return reduceSetVisible(state, action.payload.selector, action.payload.visible)
        default: return state
    }
}
