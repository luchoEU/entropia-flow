import { MATERIAL_BUY_AMOUNT_CHANGED, MATERIAL_BUY_MARKUP_CHANGED, MATERIAL_ORDER_MARKUP_CHANGED, MATERIAL_ORDER_VALUE_CHANGED, SET_MATERIALS_STATE } from "../actions/materials"
import { initialState, materialBuyAmountChanged, materialBuyMarkupChanged, materialOrderMarkupChanged, materialOrderValueChanged, setState } from "../helpers/materials"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MATERIALS_STATE: return setState(state, action.payload.state)
        case MATERIAL_BUY_MARKUP_CHANGED: return materialBuyMarkupChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_ORDER_MARKUP_CHANGED: return materialOrderMarkupChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_BUY_AMOUNT_CHANGED: return materialBuyAmountChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_ORDER_VALUE_CHANGED: return materialOrderValueChanged(state, action.payload.material, action.payload.value)
        default: return state
    }
}
