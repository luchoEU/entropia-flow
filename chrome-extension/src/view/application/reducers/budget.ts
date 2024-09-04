import { DISABLE_BUDGET_ITEM, DISABLE_BUDGET_MATERIAL, ENABLE_BUDGET_ITEM, ENABLE_BUDGET_MATERIAL, SET_BUDGET_DISABLED_EXPANDED, SET_BUDGET_FROM_SHEET, SET_BUDGET_LIST_EXPANDED, SET_BUDGET_MATERIAL_EXPANDED, SET_BUDGET_MATERIAL_LIST_EXPANDED, SET_BUDGET_STAGE, SET_BUDGET_STATE } from "../actions/budget"
import { disableBudgetItem, disableBudgetMaterial, enableBudgetItem, enableBudgetMaterial, initialState, setBudgetDisabledExpanded, setBudgetFromSheet, setBudgetListExpanded, setBudgetMaterialExpanded, setBudgetMaterialListExpanded, setBudgetStage, setState } from "../helpers/budget"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_BUDGET_STATE: return setState(state, action.payload.state)
        case SET_BUDGET_FROM_SHEET: return setBudgetFromSheet(state, action.payload.map, action.payload.items, action.payload.loadPercentage)
        case SET_BUDGET_MATERIAL_LIST_EXPANDED: return setBudgetMaterialListExpanded(state, action.payload.expanded)
        case SET_BUDGET_MATERIAL_EXPANDED: return setBudgetMaterialExpanded(state, action.payload.material, action.payload.expanded)
        case SET_BUDGET_STAGE: return setBudgetStage(state, action.payload.stage)
        case SET_BUDGET_LIST_EXPANDED: return setBudgetListExpanded(state, action.payload.expanded)
        case SET_BUDGET_DISABLED_EXPANDED: return setBudgetDisabledExpanded(state, action.payload.expanded)
        case ENABLE_BUDGET_ITEM: return enableBudgetItem(state, action.payload.name)
        case DISABLE_BUDGET_ITEM: return disableBudgetItem(state, action.payload.name)
        case ENABLE_BUDGET_MATERIAL: return enableBudgetMaterial(state, action.payload.itemName, action.payload.materialName)
        case DISABLE_BUDGET_MATERIAL: return disableBudgetMaterial(state, action.payload.itemName, action.payload.materialName)
        default: return state
    }
}
