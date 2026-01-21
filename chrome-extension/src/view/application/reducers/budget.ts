import { ADD_BUDGET_GROUP, ADD_BUDGET_ITEM_PENDING_LINES, CLEAR_BUDGET_ITEM_PENDING_LINES, DELETE_BUDGET_PENDING_LINE, ADD_BUDGET_MATERIAL_SELECTION, DISABLE_BUDGET_ITEM, DISABLE_BUDGET_MATERIAL, ENABLE_BUDGET_ITEM, ENABLE_BUDGET_MATERIAL, MOVE_ITEM_TO_GROUP, REMOVE_BUDGET_GROUP, REMOVE_BUDGET_MATERIAL_SELECTION, RENAME_BUDGET_GROUP, SET_BUDGET_FROM_SHEET, SET_BUDGET_MATERIAL_EXPANDED, SET_BUDGET_SELECTION, SET_BUDGET_STAGE, SET_BUDGET_STATE, TOGGLE_BUDGET_GROUP_EXPANDED, TOGGLE_BUDGET_UNGROUPED_EXPANDED } from "../actions/budget"
import { reduceAddBudgetGroup, reduceAddBudgetItemPendingLines, reduceClearBudgetItemPendingLines, reduceDeleteBudgetPendingLine, reduceDisableBudgetItem, reduceDisableBudgetMaterial, reduceEnableBudgetItem, reduceEnableBudgetMaterial, initialState, reduceAddBudgetMaterialSelection, reduceMoveItemToGroup, reduceRemoveBudgetGroup, reduceRemoveBudgetMaterialSelection, reduceRenameBudgetGroup, reduceSetBudgetFromSheet, reduceSetBudgetSelection, reduceToggleBudgetGroupExpanded, reduceToggleBudgetUngroupedExpanded, setBudgetMaterialExpanded, setBudgetStage, setState } from "../helpers/budget"

export default (state = initialState, action: any) => {
    switch (action.type) {
        case SET_BUDGET_STATE: return setState(state, action.payload.state)
        case SET_BUDGET_SELECTION: return reduceSetBudgetSelection(state, action.payload.selection)
        case SET_BUDGET_FROM_SHEET: return reduceSetBudgetFromSheet(state, action.payload.map, action.payload.items, action.payload.loadPercentage)
        case SET_BUDGET_MATERIAL_EXPANDED: return setBudgetMaterialExpanded(state, action.payload.material, action.payload.expanded)
        case SET_BUDGET_STAGE: return setBudgetStage(state, action.payload.stage)
        case ENABLE_BUDGET_ITEM: return reduceEnableBudgetItem(state, action.payload.name)
        case DISABLE_BUDGET_ITEM: return reduceDisableBudgetItem(state, action.payload.name)
        case ENABLE_BUDGET_MATERIAL: return reduceEnableBudgetMaterial(state, action.payload.itemName, action.payload.materialName)
        case DISABLE_BUDGET_MATERIAL: return reduceDisableBudgetMaterial(state, action.payload.itemName, action.payload.materialName)
        case ADD_BUDGET_MATERIAL_SELECTION: return reduceAddBudgetMaterialSelection(state, action.payload.materialName)
        case REMOVE_BUDGET_MATERIAL_SELECTION: return reduceRemoveBudgetMaterialSelection(state, action.payload.materialName)
        case ADD_BUDGET_GROUP: return reduceAddBudgetGroup(state, action.payload.name)
        case REMOVE_BUDGET_GROUP: return reduceRemoveBudgetGroup(state, action.payload.groupId)
        case RENAME_BUDGET_GROUP: return reduceRenameBudgetGroup(state, action.payload.groupId, action.payload.name)
        case MOVE_ITEM_TO_GROUP: return reduceMoveItemToGroup(state, action.payload.itemName, action.payload.groupId)
        case TOGGLE_BUDGET_GROUP_EXPANDED: return reduceToggleBudgetGroupExpanded(state, action.payload.groupId)
        case TOGGLE_BUDGET_UNGROUPED_EXPANDED: return reduceToggleBudgetUngroupedExpanded(state)
        case ADD_BUDGET_ITEM_PENDING_LINES: return reduceAddBudgetItemPendingLines(state, action.payload.itemName, action.payload.lines)
        case CLEAR_BUDGET_ITEM_PENDING_LINES: return reduceClearBudgetItemPendingLines(state, action.payload.itemName)
        case DELETE_BUDGET_PENDING_LINE: return reduceDeleteBudgetPendingLine(state, action.payload.itemName, action.payload.lineIndex)
        default: return state
    }
}
