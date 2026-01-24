import { mergeDeep } from "../../../common/merge"
import { BudgetLineData, BudgetSheet } from "../../services/api/sheets/sheetsBudget"
import { ADD_BUDGET_GROUP, ADD_BUDGET_ITEM_PENDING_LINES, CLEAR_BUDGET_ITEM_PENDING_LINES, DISABLE_BUDGET_ITEM, DISABLE_BUDGET_MATERIAL, ENABLE_BUDGET_ITEM, ENABLE_BUDGET_MATERIAL, MOVE_ITEM_TO_GROUP, REFRESH_BUDGET, REMOVE_BUDGET_GROUP, RENAME_BUDGET_GROUP, SEND_BUDGET_PENDING_LINES, SET_BUDGET_MATERIAL_EXPANDED, TOGGLE_BUDGET_GROUP_EXPANDED, TOGGLE_BUDGET_UNGROUPED_EXPANDED, setBudgetFromSheet, setBudgetStage, setBudgetState, addBudgetItemPendingLines, DELETE_BUDGET_PENDING_LINE, removeBudgetItemPendingLines, UPDATE_BUDGET_PENDING_LINE, TOGGLE_BUDGET_SHOW_DISABLED, ENABLE_BUDGET_GROUP, DISABLE_BUDGET_GROUP } from "../actions/budget"
import { ADD_ACTIONS, REMOVE_ACTIONS, updateActionBudgetName } from "../actions/activity"
import { SET_ITEM_PARTIAL_WEB_DATA, SET_ITEMS_STATE } from "../actions/items"
import { AppAction } from "../slice/app"
import { cleanForSave, initialState } from "../helpers/budget"
import { getItemList } from "../helpers/inventory"
import { getBudget } from "../selectors/budget"
import { getInventory } from "../selectors/inventory"
import { getItems } from "../selectors/items"
import { getSettings } from "../selectors/settings"
import { getActivity } from "../selectors/activity"
import { BudgetItem, BudgetMaterialsMap, BudgetState } from "../state/budget"
import { SettingsState } from "../state/settings"
import { inferBudgetLinesFromActions } from "../helpers/budgetInference"
import { BudgetSheetInterfaceCallbacks, refreshBudgetData, sendBudgetPendingLinesFunc } from "../helpers/budgetSheetSynchronization"
import { SET_CURRENT_INVENTORY } from "../actions/inventory"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: BudgetState = await api.storage.loadBudget()
            if (state) {
                dispatch(setBudgetState(mergeDeep(initialState, state)))
            }
            break
        }
        case ADD_ACTIONS: {
            const budget = getBudget(getState())
            const results = inferBudgetLinesFromActions(action.payload.actions, budget)
            
            for (const result of results) {
                dispatch(addBudgetItemPendingLines(result.budgetName, [result.budgetLine]))
                dispatch(updateActionBudgetName(result.action.id, result.budgetName))
            }
            break
        }
        case REMOVE_ACTIONS: {
            const budget = getBudget(getState())
            const activityState = getActivity(getState())
            for (const actionId of action.payload.actionIds) {
                const storedAction = activityState.list.find(act => act.id === actionId)
                if (storedAction && storedAction.budgetName) {
                    // Remove budgetList entries for this item from all materials
                    const updatedMap = { ...budget.materials.map }
                    for (const materialName of Object.keys(updatedMap)) {
                        updatedMap[materialName] = {
                            ...updatedMap[materialName],
                            budgetList: updatedMap[materialName].budgetList.filter(b => b.itemName !== storedAction.budgetName)
                        }
                    }
                    dispatch(setBudgetFromSheet(updatedMap, budget.list.items, budget.loadPercentage))
                }
            }
            break
        }
        case SET_BUDGET_MATERIAL_EXPANDED:
        case ENABLE_BUDGET_ITEM:
        case DISABLE_BUDGET_ITEM:
        case ENABLE_BUDGET_MATERIAL:
        case DISABLE_BUDGET_MATERIAL:
        case ADD_BUDGET_GROUP:
        case REMOVE_BUDGET_GROUP:
        case RENAME_BUDGET_GROUP:
        case MOVE_ITEM_TO_GROUP:
        case TOGGLE_BUDGET_GROUP_EXPANDED:
        case TOGGLE_BUDGET_UNGROUPED_EXPANDED:
        case ADD_BUDGET_ITEM_PENDING_LINES:
        case CLEAR_BUDGET_ITEM_PENDING_LINES:
        case DELETE_BUDGET_PENDING_LINE:
        case UPDATE_BUDGET_PENDING_LINE:
        case TOGGLE_BUDGET_SHOW_DISABLED:
        case ENABLE_BUDGET_GROUP:
        case DISABLE_BUDGET_GROUP: {
            const state: BudgetState = getBudget(getState())
            await api.storage.saveBudget(cleanForSave(state))
            break
        }
        case REFRESH_BUDGET:
        case SEND_BUDGET_PENDING_LINES: {
            const settings: SettingsState = getSettings(getState())
            const budget = getBudget(getState())
            const materials = getItems(getState())

            const setStage = (stage: number) => dispatch(setBudgetStage(stage))
            const callbacks: BudgetSheetInterfaceCallbacks = {
                onProgress: (map: BudgetMaterialsMap, items: BudgetItem[], percentage: number) => dispatch(setBudgetFromSheet(map, items, percentage)),
                setStage,
                getBudgetSheetList: (settings: SettingsState): Promise<string[]> => api.sheets.getBudgetSheetList(settings, setStage),
                loadBudgetSheet: (settings: SettingsState, itemName: string): Promise<BudgetSheet> => api.sheets.loadBudgetSheet(settings, setStage, { itemName }),
                removeBudgetItemPendingLines: (itemName: string, lines: BudgetLineData[]) => dispatch(removeBudgetItemPendingLines(itemName, lines))
            };

            if (action.type === REFRESH_BUDGET) {
                await refreshBudgetData(settings, budget, materials, callbacks);

                // Save the final state to storage
                const finalState: BudgetState = getBudget(getState());
                await api.storage.saveBudget(cleanForSave(finalState));
            } else {
                const lines: { [itemName: string]: BudgetLineData[] } = action.payload.pendingLines
                await sendBudgetPendingLinesFunc(settings, budget, materials, lines, callbacks)
            }
            
            break
        }
        case SET_ITEMS_STATE:
        case SET_CURRENT_INVENTORY: {
            const budget = getBudget(getState())
            // Recalculate selected status with updated inventory
            if (Object.keys(budget.materials.map).length > 0) {
                dispatch(setBudgetFromSheet(budget.materials.map, budget.list.items, budget.loadPercentage))
            }
            break
        }
        case SET_ITEM_PARTIAL_WEB_DATA: {
            const materialName: string = action.payload.item
            const budget = getBudget(getState())
            const material = budget.materials.map[materialName]

            if (material && material.unitValue === 0) {
                const materials = getItems(getState())
                const matInfo = materials.map[materialName]
                const unitValue = matInfo?.web?.item?.data?.value.value ?? 0

                if (unitValue !== 0) {
                    const map: BudgetMaterialsMap = { ...budget.materials.map }
                    map[materialName] = { ...map[materialName], unitValue }
                    dispatch(setBudgetFromSheet(map, budget.list.items, budget.loadPercentage))
                }
            }
            break
        }
    }
}

export default [
    requests
]
