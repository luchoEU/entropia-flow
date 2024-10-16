import { ADD_BUDGET_MATERIAL_SELECTION, DISABLE_BUDGET_ITEM, DISABLE_BUDGET_MATERIAL, ENABLE_BUDGET_ITEM, ENABLE_BUDGET_MATERIAL, REMOVE_BUDGET_MATERIAL_SELECTION, SET_BUDGET_DISABLED_EXPANDED, SET_BUDGET_FROM_SHEET, SET_BUDGET_LIST_EXPANDED, SET_BUDGET_MATERIAL_EXPANDED, SET_BUDGET_MATERIAL_LIST_EXPANDED, SET_BUDGET_STAGE, SET_BUDGET_STATE } from "../actions/budget"
import { reduceDisableBudgetItem, reduceDisableBudgetMaterial, reduceEnableBudgetItem, reduceEnableBudgetMaterial, initialState, reduceAddBudgetMaterialSelection, reduceRemoveBudgetMaterialSelection, setBudgetDisabledExpanded, reduceSetBudgetFromSheet, setBudgetListExpanded, setBudgetMaterialExpanded, setBudgetMaterialListExpanded, setBudgetStage, setState } from "../helpers/budget"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_BUDGET_STATE: return setState(state, action.payload.state)
        case SET_BUDGET_FROM_SHEET: return reduceSetBudgetFromSheet(state, action.payload.map, action.payload.items, action.payload.loadPercentage)
        case SET_BUDGET_MATERIAL_LIST_EXPANDED: return setBudgetMaterialListExpanded(state, action.payload.expanded)
        case SET_BUDGET_MATERIAL_EXPANDED: return setBudgetMaterialExpanded(state, action.payload.material, action.payload.expanded)
        case SET_BUDGET_STAGE: return setBudgetStage(state, action.payload.stage)
        case SET_BUDGET_LIST_EXPANDED: return setBudgetListExpanded(state, action.payload.expanded)
        case SET_BUDGET_DISABLED_EXPANDED: return setBudgetDisabledExpanded(state, action.payload.expanded)
        case ENABLE_BUDGET_ITEM: return reduceEnableBudgetItem(state, action.payload.name)
        case DISABLE_BUDGET_ITEM: return reduceDisableBudgetItem(state, action.payload.name)
        case ENABLE_BUDGET_MATERIAL: return reduceEnableBudgetMaterial(state, action.payload.itemName, action.payload.materialName)
        case DISABLE_BUDGET_MATERIAL: return reduceDisableBudgetMaterial(state, action.payload.itemName, action.payload.materialName)
        case ADD_BUDGET_MATERIAL_SELECTION: return reduceAddBudgetMaterialSelection(state, action.payload.materialName)
        case REMOVE_BUDGET_MATERIAL_SELECTION: return reduceRemoveBudgetMaterialSelection(state, action.payload.materialName)
        default: return state
    }
}
