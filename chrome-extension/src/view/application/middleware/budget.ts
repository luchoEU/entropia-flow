import { ItemData } from "../../../common/state"
import { mergeDeep } from "../../../common/merge"
import { BudgetLineData, BudgetSheet, BudgetSheetGetInfo } from "../../services/api/sheets/sheetsBudget"
import { SetStage, STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { ADD_BUDGET_GROUP, ADD_BUDGET_ITEM_PENDING_LINES, CLEAR_BUDGET_ITEM_PENDING_LINES, ADD_BUDGET_MATERIAL_SELECTION, DISABLE_BUDGET_ITEM, DISABLE_BUDGET_MATERIAL, ENABLE_BUDGET_ITEM, ENABLE_BUDGET_MATERIAL, MOVE_ITEM_TO_GROUP, PROCESS_BUDGET_MATERIAL_SELECTION, REFRESH_BUDGET, REMOVE_BUDGET_GROUP, REMOVE_BUDGET_MATERIAL_SELECTION, RENAME_BUDGET_GROUP, SEND_BUDGET_PENDING_LINES, SET_BUDGET_MATERIAL_EXPANDED, TOGGLE_BUDGET_GROUP_EXPANDED, TOGGLE_BUDGET_UNGROUPED_EXPANDED, sendBudgetPendingLines, setBudgetFromSheet, setBudgetStage, setBudgetState, addBudgetItemPendingLines, clearBudgetItemPendingLines } from "../actions/budget"
import { ADD_ACTIONS, REMOVE_ACTIONS, updateActionBudgetName } from "../actions/activity"
import { loadItemData, SET_ITEM_PARTIAL_WEB_DATA } from "../actions/items"
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
import { nameFromItemString } from "../helpers/craft"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: BudgetState = await api.storage.loadBudget()
            if (state)
                dispatch(setBudgetState(mergeDeep(initialState, state)))
            break
        }
        case ADD_ACTIONS: {
            for (const storedAction of action.payload.actions) {
                if (storedAction.type === 'sold_auction') {
                    const budget: BudgetState = getBudget(getState())
                    // Find the budget item for this sold item
                    const item = budget.list.items.find(item => item.name === storedAction.item)
                    if (item) {
                        // Add sold line to item's pending lines
                        const line: BudgetLineData = {
                            date: storedAction.timestamp,
                            reason: 'Sold',
                            ped: storedAction.value,
                            materials: [{ name: storedAction.item, quantity: -storedAction.amount! }]
                        }
                        dispatch(addBudgetItemPendingLines(storedAction.item, [line]))

                        // Associate budget name with the action
                        dispatch(updateActionBudgetName(storedAction.id, item.name))
                    }
                }
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
        case CLEAR_BUDGET_ITEM_PENDING_LINES: {
            const state: BudgetState = getBudget(getState())
            await api.storage.saveBudget(cleanForSave(state))
            break
        }
        case REFRESH_BUDGET: { 
            const settings: SettingsState = getSettings(getState())
            const budget: BudgetState = getBudget(getState())
            const materials: ItemsState = getItems(getState())
            const inventory: Array<ItemData> = getItemList(getInventory(getState()))

            let map: BudgetMaterialsMap = { }
            let items: BudgetItem[] = []
            dispatch(setBudgetFromSheet(map, items, 0))

            const setStage = (stage: number) => dispatch(setBudgetStage(stage))
            const list: string[] = await api.sheets.getBudgetSheetList(settings, setStage)

            let loaded = 0
            for (const itemName of list) {
                if (budget.disabledItems.names.indexOf(itemName) != -1) continue

                const { updatedMap, updatedItems } = await processSheetInfo(api, setStage, settings, itemName, budget.disabledMaterials[itemName], materials, map, items)
                map = updatedMap
                items = updatedItems

                dispatch(setBudgetFromSheet(map, items, ++loaded / list.length * 99))
            }

            for (const invMat of inventory) {
                if (map[invMat.n] !== undefined) {
                    const realElement = {
                        itemName: invMat.c,
                        disabled: budget.disabledMaterials[invMat.n]?.includes(invMat.c) || false,
                        quantity: Number(invMat.q)
                    }

                    map[invMat.n].realList.push(realElement)
                }
            }

            dispatch(setBudgetFromSheet(map, items, 100))

            // Load item data for materials with unknown unit value
            for (const materialName of Object.keys(map)) {
                if (map[materialName].unitValue === 0) {
                    dispatch(loadItemData(materialName))
                }
            }

            const updatedState: BudgetState = getBudget(getState())
            await api.storage.saveBudget(cleanForSave(updatedState))

            setStage(STAGE_INITIALIZING)
            break
        }
        case PROCESS_BUDGET_MATERIAL_SELECTION: {
            const budget: BudgetState = getBudget(getState())
            const selectedMaterials = Object.values(budget.materials.map).filter(m => m.selected)
            const lines = getBalanceLines(Date.now(), selectedMaterials)
            dispatch(sendBudgetPendingLines(lines))

            break
        }
        case SEND_BUDGET_PENDING_LINES: {
            const settings: SettingsState = getSettings(getState())
            const lines: { [itemName: string]: BudgetLineData[] } = action.payload.pendingLines
            const budget: BudgetState = getBudget(getState())
            const materials: ItemsState = getItems(getState())

            let map: BudgetMaterialsMap = budget.materials.map
            let items: BudgetItem[] = budget.list.items

            const setStage = (stage: number) => dispatch(setBudgetStage(stage))
            let loaded = 0
            for (const itemName in lines) {
                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, { itemName })
                for (const line of lines[itemName]) {
                    await sheet.addLine(line)
                }
                await sheet.save()

                for (const materialName in map)
                    map[materialName].budgetList = map[materialName].budgetList.filter(item => item.itemName !== itemName);
                items = items.filter(i => i.name !== itemName)

                const { updatedMap, updatedItems } = await processSheetInfo(api, setStage, settings, itemName, budget.disabledMaterials[itemName], materials, map, items)
                map = updatedMap
                items = updatedItems

                dispatch(setBudgetFromSheet(map, items, ++loaded / Object.keys(lines).length * 99))
            }

            // Clear pendingLines from items that had lines applied
            for (const itemName in lines) {
                dispatch(clearBudgetItemPendingLines(itemName))
            }

            for (const materialName in map) {
                map[materialName].selected = false;
            }
            dispatch(setBudgetFromSheet(map, items, 100))
            setStage(STAGE_INITIALIZING)

            break
        }
        case SET_ITEM_PARTIAL_WEB_DATA: {
            const materialName: string = action.payload.item
            const budget: BudgetState = getBudget(getState())
            const material = budget.materials.map[materialName]

            if (material && material.unitValue === 0) {
                const materials: ItemsState = getItems(getState())
                const matInfo = materials.map[materialName]
                const unitValue = matInfo?.web?.item?.data?.value.value ?? 0

                if (unitValue !== 0) {
                    const map = { ...budget.materials.map }
                    map[materialName] = { ...map[materialName], unitValue }
                    dispatch(setBudgetFromSheet(map, budget.list.items, budget.loadPercentage))
                }
            }
            break
        }
    }
}

async function processSheetInfo(api: any, setStage: SetStage, settings: SettingsState, itemName: string, disabledMaterials: string[], materials: ItemsState, map: BudgetMaterialsMap, items: BudgetItem[]): Promise<{ updatedMap: BudgetMaterialsMap, updatedItems: BudgetItem[] }> {
    const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, { itemName })
    const info: BudgetSheetGetInfo = await sheet.getInfo()

    for (const infoName of Object.keys(info.materials)) {
        var m = info.materials[infoName]

        const name = nameFromItemString(itemName, infoName)
        const matInfo = materials.map[name]

        if (map[name] === undefined) {
            map[name] = {
                sheetName: infoName,
                expanded: false,
                selected: false,
                markup: m.markup,
                unitValue: matInfo?.refined ? matInfo.refined.kValue / 1000 : (matInfo?.web?.item?.data?.value.value ?? 0),
                budgetList: [],
                realList: [],
                c: undefined! // this will be filled when it is added to the state
            }
        }

        const budgetElement = {
            itemName,
            disabled: disabledMaterials?.includes(name) || false,
            quantity: m.current
        }

        map[name].budgetList.push(budgetElement)
    }

    items.push({
        name: itemName,
        totalMU: info.totalMU,
        total: info.total,
        peds: info.peds,
        url: sheet.getUrl()
    })

    return { updatedMap: map, updatedItems: items }
}

export default [
    requests
]
