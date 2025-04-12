import { MATERIAL_BUY_AMOUNT_CHANGED, MATERIAL_BUY_MARKUP_CHANGED, MATERIAL_NOTES_VALUE_CHANGED, MATERIAL_ORDER_MARKUP_CHANGED, MATERIAL_ORDER_VALUE_CHANGED, MATERIAL_REFINE_AMOUNT_CHANGED, MATERIAL_RESERVE_VALUE_CHANGED, MATERIAL_USE_AMOUNT_CHANGED, SET_MATERIAL_CALCULATOR_QUANTITY, SET_MATERIAL_CALCULATOR_TOTAL, SET_MATERIAL_CALCULATOR_TOTAL_MU, SET_MATERIAL_MARKUP_UNIT, SET_MATERIAL_PARTIAL_WEB_DATA, SET_MATERIALS_STATE } from "../actions/materials"
import { initialState, reduceMaterialBuyAmountChanged, reduceMaterialBuyMarkupChanged, reduceMaterialNotesValueChanged, reduceMaterialOrderMarkupChanged, reduceMaterialOrderValueChanged, reduceMaterialRefineAmountChanged, reduceMaterialReserveValueChanged, reduceMaterialUseAmountChanged, reduceSetMaterialCalculatorQuantity, reduceSetMaterialCalculatorTotal, reduceSetMaterialCalculatorTotalMU, reduceSetMaterialMarkupUnit, reduceSetMaterialPartialWebData, reduceSetState } from "../helpers/materials"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MATERIALS_STATE: return reduceSetState(state, action.payload.state)
        case MATERIAL_BUY_MARKUP_CHANGED: return reduceMaterialBuyMarkupChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_ORDER_MARKUP_CHANGED: return reduceMaterialOrderMarkupChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_USE_AMOUNT_CHANGED: return reduceMaterialUseAmountChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_REFINE_AMOUNT_CHANGED: return reduceMaterialRefineAmountChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_BUY_AMOUNT_CHANGED: return reduceMaterialBuyAmountChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_RESERVE_VALUE_CHANGED: return reduceMaterialReserveValueChanged(state, action.payload.material, action.payload.reserveAmount)
        case SET_MATERIAL_MARKUP_UNIT: return reduceSetMaterialMarkupUnit(state, action.payload.material, action.payload.unit)
        case MATERIAL_ORDER_VALUE_CHANGED: return reduceMaterialOrderValueChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_NOTES_VALUE_CHANGED: return reduceMaterialNotesValueChanged(state, action.payload.material, action.payload.value)
        case SET_MATERIAL_PARTIAL_WEB_DATA: return reduceSetMaterialPartialWebData(state, action.payload.material, action.payload.change)
        case SET_MATERIAL_CALCULATOR_QUANTITY: return reduceSetMaterialCalculatorQuantity(state, action.payload.material, action.payload.quantity)
        case SET_MATERIAL_CALCULATOR_TOTAL: return reduceSetMaterialCalculatorTotal(state, action.payload.material, action.payload.total)
        case SET_MATERIAL_CALCULATOR_TOTAL_MU: return reduceSetMaterialCalculatorTotalMU(state, action.payload.material, action.payload.totalMU)
        default: return state
    }
}
