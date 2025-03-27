import { REFINED_MARKUP_CHANGED, REFINED_MATERIAL_CHANGED, REFINED_VALUE_CHANGED, SET_REFINED_STATE } from "../actions/refined"
import { initialState, refinedMarkupChanged, refinedMaterialChanged, refinedValueChanged, setState } from "../helpers/refined"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_REFINED_STATE: return setState(state, action.payload.state)
        case REFINED_VALUE_CHANGED: return refinedValueChanged(state, action.payload.material, action.payload.value, action.payload.m)
        case REFINED_MARKUP_CHANGED: return refinedMarkupChanged(state, action.payload.material, action.payload.value, action.payload.m)
        case REFINED_MATERIAL_CHANGED: return refinedMaterialChanged(state, action.payload.m)
        default: return state
    }
}
