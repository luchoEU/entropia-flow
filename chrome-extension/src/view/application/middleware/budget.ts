import { ItemData } from "../../../common/state"
import { mergeDeep } from "../../../common/merge"
import { BudgetLineData, BudgetSheet, BudgetSheetGetInfo } from "../../services/api/sheets/sheetsBudget"
import { SetStage, STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { ADD_BUDGET_MATERIAL_SELECTION, DISABLE_BUDGET_ITEM, DISABLE_BUDGET_MATERIAL, ENABLE_BUDGET_ITEM, ENABLE_BUDGET_MATERIAL, PROCESS_BUDGET_MATERIAL_SELECTION, REFRESH_BUDGET, REMOVE_BUDGET_MATERIAL_SELECTION, SET_BUDGET_MATERIAL_EXPANDED, setBudgetFromSheet, setBudgetStage, setBudgetState } from "../actions/budget"
import { AppAction } from "../slice/app"
import { cleanForSave, initialState } from "../helpers/budget"
import { getItemList } from "../helpers/inventory"
import { getBudget } from "../selectors/budget"
import { getInventory } from "../selectors/inventory"
import { getItems } from "../selectors/items"
import { getSettings } from "../selectors/settings"
import { BudgetItem, BudgetMaterialsMap, BudgetState } from "../state/budget"
import { ItemsState } from "../state/items"
import { SettingsState } from "../state/settings"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: BudgetState = await api.storage.loadBudget()
            if (state)
                dispatch(setBudgetState(mergeDeep(initialState, state)))
            break
        }
        case SET_BUDGET_MATERIAL_EXPANDED:
        case ENABLE_BUDGET_ITEM:
        case DISABLE_BUDGET_ITEM:
        case ENABLE_BUDGET_MATERIAL:
        case DISABLE_BUDGET_MATERIAL:
        case ADD_BUDGET_MATERIAL_SELECTION:
        case REMOVE_BUDGET_MATERIAL_SELECTION: {
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
                        quantity: -Number(invMat.q)
                    }

                    map[invMat.n].realList.push(realElement)
                }
            }

            dispatch(setBudgetFromSheet(map, items, 100))

            setStage(STAGE_INITIALIZING)
            break
        }
        case PROCESS_BUDGET_MATERIAL_SELECTION: {
            const settings: SettingsState = getSettings(getState())
            const budget: BudgetState = getBudget(getState())
            const materials: ItemsState = getItems(getState())

            const lines : { [itemName: string]: BudgetLineData } = { }

            for (var materialName of Object.keys(budget.materials.map)) {
                const material = budget.materials.map[materialName]
                if (material.selected) {
                    const itemName = material.budgetList[0].itemName
                    if (!lines[itemName]) {
                        lines[itemName] = {
                            reason: 'Balance',
                            ped: 0,
                            materials: []
                        }
                    }
                    lines[itemName].materials.push({
                        name: materialName,
                        quantity: -(material.c?.balanceQuantity || 0)
                    })
                    lines[itemName].ped = (lines[itemName].ped || 0) + (material.c?.balanceWithMarkup || 0)
                }
            }

            let map: BudgetMaterialsMap = budget.materials.map
            let items: BudgetItem[] = budget.list.items

            const setStage = (stage: number) => dispatch(setBudgetStage(stage))
            let loaded = 0
            for (const itemName in lines) {
                const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, { itemName })
                await sheet.addLine(lines[itemName])
                await sheet.save()

                for (const materialName in map)
                    map[materialName].budgetList = map[materialName].budgetList.filter(item => item.itemName !== itemName);
                items = items.filter(i => i.name !== itemName)

                const { updatedMap, updatedItems } = await processSheetInfo(api, setStage, settings, itemName, budget.disabledMaterials[itemName], materials, map, items)
                map = updatedMap
                items = updatedItems

                dispatch(setBudgetFromSheet(map, items, ++loaded / Object.keys(lines).length * 99))
            }

            for (const materialName in map) {
                map[materialName].selected = false;
            }
            dispatch(setBudgetFromSheet(map, items, 100))

            setStage(STAGE_INITIALIZING)

            break
        }
    }
}

async function processSheetInfo(api: any, setStage: SetStage, settings: SettingsState, itemName: string, disabledMaterials: string[], materials: ItemsState, map: BudgetMaterialsMap, items: BudgetItem[]): Promise<{ updatedMap: BudgetMaterialsMap, updatedItems: BudgetItem[] }> {
    const sheet: BudgetSheet = await api.sheets.loadBudgetSheet(settings, setStage, { itemName })
    const info: BudgetSheetGetInfo = await sheet.getInfo()

    for (const name of Object.keys(info.materials)) {
        var m = info.materials[name]

        const matInfo = materials.map[name]

        if (map[name] === undefined) {
            map[name] = {
                expanded: false,
                selected: false,
                markup: m.markup,
                unitValue: matInfo?.refined ? matInfo.refined.kValue / 1000 : 0,
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
        peds: info.peds
    })

    return { updatedMap: map, updatedItems: items }
}

export default [
    requests
]
