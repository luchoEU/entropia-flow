import { REFINED_MARKUP_CHANGED, REFINED_SELL, REFINED_VALUE_CHANGED, SET_REFINED_EXPANDED, SET_REFINED_STATE } from "../actions/refined"
import { initialState, refinedMarkupChanged, refinedSell, refinedValueChanged, setRefinedExpanded, setState } from "../helpers/refined"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_REFINED_STATE: return setState(state, action.payload.state)
        case SET_REFINED_EXPANDED: return setRefinedExpanded(state, action.payload.material, action.payload.expanded)
        case REFINED_VALUE_CHANGED: return refinedValueChanged(state, action.payload.material, action.payload.value)
        case REFINED_MARKUP_CHANGED: return refinedMarkupChanged(state, action.payload.material, action.payload.value)
        case REFINED_SELL: return refinedSell(state, action.payload.material)
        default: return state
    }
}
