import { mergeDeep } from "../../../common/merge"
import { BudgetLineData, BudgetSheet } from "../../services/api/sheets/sheetsBudget"
import { ADD_BUDGET_GROUP, ADD_BUDGET_ITEM_PENDING_LINES, CLEAR_BUDGET_ITEM_PENDING_LINES, ADD_BUDGET_MATERIAL_SELECTION, DISABLE_BUDGET_ITEM, DISABLE_BUDGET_MATERIAL, ENABLE_BUDGET_ITEM, ENABLE_BUDGET_MATERIAL, MOVE_ITEM_TO_GROUP, PROCESS_BUDGET_MATERIAL_SELECTION, REFRESH_BUDGET, REMOVE_BUDGET_GROUP, REMOVE_BUDGET_MATERIAL_SELECTION, RENAME_BUDGET_GROUP, SEND_BUDGET_PENDING_LINES, SET_BUDGET_MATERIAL_EXPANDED, TOGGLE_BUDGET_GROUP_EXPANDED, TOGGLE_BUDGET_UNGROUPED_EXPANDED, sendBudgetPendingLines, setBudgetFromSheet, setBudgetStage, setBudgetState, addBudgetItemPendingLines, DELETE_BUDGET_PENDING_LINE, removeBudgetItemPendingLines } from "../actions/budget"
import { ADD_ACTIONS, REMOVE_ACTIONS, updateActionBudgetName } from "../actions/activity"
import { SET_ITEM_PARTIAL_WEB_DATA, SET_ITEMS_STATE } from "../actions/items"
import { AppAction } from "../slice/app"
import { cleanForSave, getBalanceLines, initialState } from "../helpers/budget"
import { getItemList } from "../helpers/inventory"
import { getBudget } from "../selectors/budget"
import { getInventory } from "../selectors/inventory"
import { getItems } from "../selectors/items"
import { getSettings } from "../selectors/settings"
import { getActivity } from "../selectors/activity"
import { BudgetItem, BudgetMaterialsMap, BudgetState } from "../state/budget"
import { ItemsState } from "../state/items"
import { SettingsState } from "../state/settings"
import { inferBudgetLinesFromActions } from "../helpers/budgetInference"
import { BudgetSheetInterfaceCallbacks, refreshBudgetData, sendBudgetPendingLinesFunc } from "../helpers/budgetSheetInterface"
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
        case ADD_BUDGET_MATERIAL_SELECTION:
        case REMOVE_BUDGET_MATERIAL_SELECTION:
        case ADD_BUDGET_GROUP:
        case REMOVE_BUDGET_GROUP:
        case RENAME_BUDGET_GROUP:
        case MOVE_ITEM_TO_GROUP:
        case TOGGLE_BUDGET_GROUP_EXPANDED:
        case TOGGLE_BUDGET_UNGROUPED_EXPANDED:
        case ADD_BUDGET_ITEM_PENDING_LINES:
        case CLEAR_BUDGET_ITEM_PENDING_LINES:
        case DELETE_BUDGET_PENDING_LINE: {
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
                const inventory = getItemList(getInventory(getState()))
                await refreshBudgetData(settings, budget, materials, inventory, callbacks);
                
                // Save the final state to storage
                const finalState: BudgetState = getBudget(getState());
                await api.storage.saveBudget(cleanForSave(finalState));
            } else {
                const lines: { [itemName: string]: BudgetLineData[] } = action.payload.pendingLines
                await sendBudgetPendingLinesFunc(settings, budget, materials, lines, callbacks)
            }
            
            break
        }
        case PROCESS_BUDGET_MATERIAL_SELECTION: {
            const budget: BudgetState = getBudget(getState())
            const selectedMaterials = Object.fromEntries(Object.entries(budget.materials.map).filter(([_, m]) => m.selected))
            const lines = getBalanceLines(Date.now(), selectedMaterials)
            dispatch(sendBudgetPendingLines(lines))
            break
        }
        case SET_ITEMS_STATE:
        case SET_CURRENT_INVENTORY: {
            const budget = getBudget(getState())
            const inventory = getItemList(getInventory(getState()))
            
            // Update realList for all materials that exist in inventory
            const map = { ...budget.materials.map }
            let hasChanges = false
            
            for (const invMat of inventory) {
                if (map[invMat.n] !== undefined) {
                    const currentRealList = map[invMat.n].realList
                    const existingIndex = currentRealList.findIndex(real => real.itemName === invMat.c)
                    
                    if (existingIndex >= 0) {
                        // Update existing entry if quantity changed
                        if (currentRealList[existingIndex].quantity !== Number(invMat.q)) {
                            currentRealList[existingIndex] = {
                                ...currentRealList[existingIndex],
                                quantity: Number(invMat.q)
                            }
                            hasChanges = true
                        }
                    } else {
                        // Add new entry
                        currentRealList.push({
                            itemName: invMat.c,
                            disabled: budget.disabledMaterials[invMat.n]?.includes(invMat.c) || false,
                            quantity: Number(invMat.q)
                        })
                        hasChanges = true
                    }
                }
            }
            
            // Also remove entries that no longer exist in inventory
            for (const materialName of Object.keys(map)) {
                const invMaterial = inventory.find(inv => inv.n === materialName)
                if (!invMaterial) {
                    // Remove all realList entries for this material if it's not in inventory
                    if (map[materialName].realList.length > 0) {
                        map[materialName] = {
                            ...map[materialName],
                            realList: []
                        }
                        hasChanges = true
                    }
                } else {
                    // Remove entries for containers that no longer exist for this material
                    const invContainers = inventory
                        .filter(inv => inv.n === materialName)
                        .map(inv => inv.c)
                    
                    const originalLength = map[materialName].realList.length
                    map[materialName].realList = map[materialName].realList.filter(
                        real => invContainers.includes(real.itemName)
                    )
                    
                    if (map[materialName].realList.length !== originalLength) {
                        hasChanges = true
                    }
                }
            }
            
            if (hasChanges) {
                dispatch(setBudgetFromSheet(map, budget.list.items, budget.loadPercentage))
            }
            break
        }
        case SET_ITEM_PARTIAL_WEB_DATA: {
            const materialName: string = action.payload.item
            const budget = getBudget(getState())
            const material = budget.materials.map[materialName]
            
            if (material) {
                const inventory = getItemList(getInventory(getState()))
                const invMaterial = inventory.find(inv => inv.n === materialName)
                
                if (invMaterial) {
                    // Update realList to match current inventory
                    const map = { ...budget.materials.map }
                    const currentRealList = map[materialName].realList
                    
                    // Find existing real entries and update quantities, or add new ones
                    const existingIndex = currentRealList.findIndex(real => real.itemName === invMaterial.c)
                    if (existingIndex >= 0) {
                        // Update existing entry
                        currentRealList[existingIndex] = {
                            ...currentRealList[existingIndex],
                            quantity: Number(invMaterial.q)
                        }
                    } else {
                        // Add new entry
                        currentRealList.push({
                            itemName: invMaterial.c,
                            disabled: budget.disabledMaterials[materialName]?.includes(invMaterial.c) || false,
                            quantity: Number(invMaterial.q)
                        })
                    }
                    
                    dispatch(setBudgetFromSheet(map, budget.list.items, budget.loadPercentage))
                }
                
                if (material.unitValue === 0) {
                    const materials: ItemsState = getItems(getState())
                    const matInfo = materials.map[materialName]
                    const unitValue = matInfo?.web?.item?.data?.value.value ?? 0
                    
                    if (unitValue !== 0) {
                        const map = { ...budget.materials.map }
                        map[materialName] = { ...map[materialName], unitValue }
                        dispatch(setBudgetFromSheet(map, budget.list.items, budget.loadPercentage))
                    }
                }
            }
            break
        }
    }
}

export default [
    requests
]
