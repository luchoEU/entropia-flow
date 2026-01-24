import { BudgetLineData, BudgetSheet, BudgetSheetGetInfo } from "../../services/api/sheets/sheetsBudget"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { BudgetItem, BudgetMaterial, BudgetMaterialsMap, BudgetState } from "../state/budget"
import { SettingsState } from "../state/settings"
import { ItemsState } from "../state/items"
import { isLimited, itemStringFromNameLimited, nameFromItemStringLimited } from "../helpers/craft"

export interface BudgetSheetInterfaceCallbacks {
    onProgress: (map: BudgetMaterialsMap, items: BudgetItem[], percentage: number) => void
    setStage: (stage: number) => void
    getBudgetSheetList: (settings: SettingsState) => Promise<string[]>,
    loadBudgetSheet: (settings: SettingsState, itemName: string) => Promise<BudgetSheet>
    removeBudgetItemPendingLines: (itemName: string, lines: BudgetLineData[]) => void
}

export async function refreshBudgetData(
    settings: SettingsState,
    budget: BudgetState,
    materials: ItemsState,
    callbacks: BudgetSheetInterfaceCallbacks
) {
    // Mark all existing items as loading initially
    let items = budget.list.items.map(item => ({
        ...item,
        refreshStatus: 'loading'
    } as BudgetItem))
    callbacks.onProgress(budget.materials.map, items, 0)

    // Get sheet list with stage callback
    const list: string[] = await callbacks.getBudgetSheetList(settings)
    items = items.filter(item => list.includes(item.name))

    // Process each sheet from the list
    let map: BudgetMaterialsMap = { }
    let loaded = 0
    for (const itemName of list) {
        if (budget.list.disabled?.indexOf(itemName) != -1) continue

        // Process sheet info and update item status
        const { updatedMap, updatedItems } = await _processSheetInfo(settings, itemName, materials, map, items, callbacks)

        // Only update if we got valid results
        if (updatedMap && updatedItems) {
            map = { ...map, ...updatedMap }
            items = updatedItems

            // Notify progress
            callbacks.onProgress(map, items, ++loaded / list.length * 99)
        }
    }

    // Normalize load status after processing all pending lines
    items = items.map(item => ({
        ...item,
        refreshStatus: 'idle'
    }))

    // Final progress update
    callbacks.onProgress(map, items, 100)
    callbacks.setStage(STAGE_INITIALIZING)

    return {
        finalMap: map,
        finalItems: items
    }
}

export async function sendBudgetPendingLinesFunc(
    settings: SettingsState,
    budget: BudgetState,
    materials: ItemsState,
    lines: { [itemName: string]: BudgetLineData[] },
    callbacks: BudgetSheetInterfaceCallbacks
) {
    let map: BudgetMaterialsMap = budget.materials.map
    let items: BudgetItem[] = budget.list.items

    // Mark all existing items as loading initially
    items = budget.list.items.map(item => item.name in lines ? ({
        ...item,
        refreshStatus: 'loading'
    } as BudgetItem) : item)
    callbacks.onProgress(map, items, 0)

    let loaded = 0
    for (const itemName in lines) {
        const sheet: BudgetSheet = await callbacks.loadBudgetSheet(settings, itemName)

        // Add all lines to sheet
        const isBlueprint = budget.list.items.find(i => i.name === itemName)?.isBlueprint
        for (const line of lines[itemName]) {
            const transformedLine: BudgetLineData = isBlueprint ? {
                ...line,
                materials: line.materials.map(m => ({
                    ...m,
                    name: itemStringFromNameLimited(itemName, m.name)
                }))
            } : line
            await sheet.addLine(transformedLine)
        }
        await sheet.save()

        // Remove existing budget entries and item
        for (const materialName in map) {
            map[materialName].budgetList = map[materialName].budgetList.filter(item => item.itemName !== itemName);
        }
        items = items.filter(i => i.name !== itemName)

        // Process sheet info and update items
        const { updatedMap, updatedItems } = await _processSheetInfo(settings, itemName, materials, map, items, callbacks)
        map = updatedMap
        items = updatedItems

        callbacks.onProgress(map, items, ++loaded / Object.keys(lines).length * 99)
    }

    // Clear pendingLines from items that had lines applied
    for (const itemName in lines) {
        callbacks.removeBudgetItemPendingLines(itemName, lines[itemName]);
    }

    // Normalize load status after processing all pending lines
    items = items.map(item => ({
        ...item,
        refreshStatus: 'idle'
    }))

    callbacks.onProgress(map, items, 100)
    callbacks.setStage(STAGE_INITIALIZING)

    return {
        finalMap: map,
        finalItems: items
    }
}

async function _processSheetInfo(
    settings: SettingsState,
    itemName: string,
    materials: ItemsState,
    map: BudgetMaterialsMap,
    items: BudgetItem[],
    callbacks: BudgetSheetInterfaceCallbacks
): Promise<{ updatedMap: BudgetMaterialsMap, updatedItems: BudgetItem[] }> {
    const sheet: BudgetSheet | null = await callbacks.loadBudgetSheet(settings, itemName)
    if (!sheet) {
        return { updatedMap: map, updatedItems: items }
    }
    
    const info: BudgetSheetGetInfo = await sheet.getInfo()

    for (const infoName of Object.keys(info.materials)) {
        var m = info.materials[infoName]

        const name = nameFromItemStringLimited(itemName, infoName)
        const matInfo = materials.map[name]

        if (map[name] === undefined) {
            map[name] = {
                sheetName: infoName,
                expanded: false,
                markup: m.markup,
                unitValue: matInfo?.refined ? matInfo.refined.kValue / 1000 : (matInfo?.web?.item?.data?.value.value ?? 0),
                budgetList: [],
                disabled: []
            }
        }

        const budgetElement: BudgetMaterial = {
            itemName,
            quantity: m.current
        }

        map[name].budgetList.push(budgetElement)
    }

    const newItem: BudgetItem = {
        name: itemName,
        totalMU: info.totalMU,
        total: info.total,
        peds: info.peds,
        url: sheet.getUrl(),
        isBlueprint: Object.keys(info.materials).some(m => m === 'Blueprint'),
        pendingLines: items.find(i => i.name === itemName)?.pendingLines,
        refreshStatus: 'loaded'
    }
    items = items.filter(i => i.name !== itemName)
    items.push(newItem)

    return { updatedMap: map, updatedItems: items }
}
