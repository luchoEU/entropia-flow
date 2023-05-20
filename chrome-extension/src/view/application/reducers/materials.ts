import { MATERIAL_BUY_AMOUNT_CHANGED, MATERIAL_BUY_MARKUP_CHANGED, MATERIAL_ORDER_MARKUP_CHANGED, MATERIAL_ORDER_VALUE_CHANGED, MATERIAL_REFINE_AMOUNT_CHANGED, MATERIAL_USE_AMOUNT_CHANGED, SET_MATERIALS_CRAFT_MAP, SET_MATERIALS_STATE, SET_MATERIAL_CRAFT_BUDGET_STAGE, SET_MATERIAL_CRAFT_EXPANDED, SET_MATERIAL_CRAFT_LIST_EXPANDED } from "../actions/materials"
import { initialState, materialBuyAmountChanged, materialBuyMarkupChanged, materialOrderMarkupChanged, materialOrderValueChanged, materialRefineAmountChanged, materialUseAmountChanged, setMaterialCraftBudgetStage, setMaterialCraftExpanded, setMaterialCraftListExpanded, setMaterialsCraftMap, setState } from "../helpers/materials"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MATERIALS_STATE: return setState(state, action.payload.state)
        case SET_MATERIALS_CRAFT_MAP: return setMaterialsCraftMap(state, action.payload.map)
        case MATERIAL_BUY_MARKUP_CHANGED: return materialBuyMarkupChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_ORDER_MARKUP_CHANGED: return materialOrderMarkupChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_USE_AMOUNT_CHANGED: return materialUseAmountChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_REFINE_AMOUNT_CHANGED: return materialRefineAmountChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_BUY_AMOUNT_CHANGED: return materialBuyAmountChanged(state, action.payload.material, action.payload.value)
        case MATERIAL_ORDER_VALUE_CHANGED: return materialOrderValueChanged(state, action.payload.material, action.payload.value)
        case SET_MATERIAL_CRAFT_LIST_EXPANDED: return setMaterialCraftListExpanded(state, action.payload.expanded)
        case SET_MATERIAL_CRAFT_EXPANDED: return setMaterialCraftExpanded(state, action.payload.material, action.payload.expanded)
        case SET_MATERIAL_CRAFT_BUDGET_STAGE: return setMaterialCraftBudgetStage(state, action.payload.stage)
        default: return state
    }
}
