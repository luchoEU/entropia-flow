import { REFINED_BUY_MATERIAL, REFINED_MARKUP_CHANGED, REFINED_MATERIAL_CHANGED, REFINED_SELL, REFINED_VALUE_CHANGED, SET_REFINED_EXPANDED, SET_REFINED_STATE } from "../actions/refined"
import { initialState, refinedBuyMaterial, refinedMarkupChanged, refinedMaterialChanged, refinedSell, refinedValueChanged, setRefinedExpanded, setState } from "../helpers/refined"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_REFINED_STATE: return setState(state, action.payload.state)
        case SET_REFINED_EXPANDED: return setRefinedExpanded(state, action.payload.material, action.payload.expanded)
        case REFINED_VALUE_CHANGED: return refinedValueChanged(state, action.payload.material, action.payload.value, action.payload.m)
        case REFINED_MARKUP_CHANGED: return refinedMarkupChanged(state, action.payload.material, action.payload.value, action.payload.m)
        case REFINED_MATERIAL_CHANGED: return refinedMaterialChanged(state, action.payload.m)
        case REFINED_SELL: return refinedSell(state, action.payload.material)
        case REFINED_BUY_MATERIAL: return refinedBuyMaterial(state, action.payload.material, action.payload.ttValue, action.payload.markup)
        default: return state
    }
}