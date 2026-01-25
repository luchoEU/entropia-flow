import { ItemData } from "../../../common/state"
import { BudgetItem, BudgetMaterialsMap, BudgetMaterialState, BudgetState } from "../state/budget"
import { BalanceMaterialData } from "./budget"
import { calculateBalanceLines } from "./budgetGetBalanceLines"
import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"

export interface MaterialSummary extends BalanceMaterialData {
    budgetQuantity: number
    budgetValue: number
    budgetWithMarkup: number
}

export interface ItemTotals {
    peds: number
    stored: number
    markup: number
    total: number
}

// Base interface for all budget rows (items, groups, totals)
export interface BudgetRowData {
    name: string
    peds: number
    stored: number
    markup: number
    total: number
    balance: number
}

export interface ItemViewData extends BudgetRowData {
    isLoading: boolean
    isLoaded: boolean
    pendingAmount: number
    disabled: boolean
    detailsViewData: BudgetDetailsViewData | null
}

export interface GroupViewData extends BudgetRowData {
    id: string
    itemNames: string[]
    expanded: boolean
    disabled: boolean
    items: ItemViewData[]
    detailsViewData: BudgetDetailsViewData | null
}

export interface UngroupedViewData extends BudgetRowData {
    expanded: boolean
    items: ItemViewData[]
}

export interface TotalsViewData extends BudgetRowData {
    detailsViewData: BudgetDetailsViewData | null
}

export interface BudgetViewData {
    groups: GroupViewData[]
    ungrouped: UngroupedViewData
    totals: TotalsViewData
    stage: number
    loadPercentage: number
}

// Detail panel view data interfaces
export interface PendingLineViewData {
    index: number
    date: number
    reason: string
    ped?: number
    materials: { name: string, quantity: number }[]
}

export interface PendingLinesGroupViewData {
    itemName: string
    lines: PendingLineViewData[]
    matNames: string[]
}

export interface BudgetDetailsViewData {
    title: string
    items: { name: string, url: string }[]
    totals: ItemTotals
    totalBalanceWithMarkup: number
    totalBudgetValue: number
    materials: MaterialSummary[]
    pendingLines: PendingLinesGroupViewData[]
    pendingLinesForAction: Record<string, BudgetLineData[]>
    stage: number
    selectedItem: string | null
}

export interface MaterialItemRowViewData {
    itemName: string
    budget?: { quantity: number }
    pending?: { quantity: number }
    real?: { quantity: number, disabled: boolean }
}

export interface MaterialDetailsViewData {
    materialName: string
    materialUnitValue: number
    markup: number
    balanceWithMarkup: number
    sheetName: string
    items: MaterialItemRowViewData[]
    totals: { budgetQuantity: number, pendingQuantity: number, realQuantity: number }
    balanceQuantity: number
}

export function getUsedMaterialsMap(itemNames: string[], materialsMap: BudgetMaterialsMap): Record<string, BudgetMaterialState> {
    return Object.fromEntries(Object.entries(materialsMap).filter(([_, m]) => m.budgetList?.some(b => itemNames.includes(b.itemName)) ?? false))
}

export function getMaterials(budgetState: BudgetState, usedMaterialsMap: BudgetMaterialsMap, inventory: Array<ItemData>, validBudgetItems?: string[]): MaterialSummary[] {
    const result: MaterialSummary[] = []

    for (const [materialName, material] of Object.entries(usedMaterialsMap)) {
        const materialDetails = calculateMaterialDetails(budgetState, materialName, inventory);
        const quantity = material.budgetList.reduce((acc, b) => validBudgetItems?.includes(b.itemName) ? acc + b.quantity : acc, 0)
        const value = quantity * material.unitValue
        const validItems = material.budgetList.filter(b => validBudgetItems?.includes(b.itemName) != false)
        result.push({
            name: materialName,
            budgetQuantity: quantity,
            budgetValue: value,
            budgetWithMarkup: value * material.markup,
            balanceQuantity: materialDetails.balanceQuantity,
            balanceWithMarkup: materialDetails.balanceWithMarkup,
            budget: Object.fromEntries(validItems.map(b => [b.itemName, b.quantity]))
        })
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
}

type BudgetItemInput = BudgetDetailsInput['budgetItems'][number]

function getMaterialsFromInput(
    budgetItems: BudgetItemInput[],
    usedMaterialsMap: BudgetMaterialsMap,
    materialDisabled: Record<string, string[]>,
    inventory: Array<ItemData>,
    validBudgetItems?: string[]
): MaterialSummary[] {
    const result: MaterialSummary[] = []

    for (const [materialName, material] of Object.entries(usedMaterialsMap)) {
        const materialDetails = calculateMaterialDetailsFromInput(budgetItems, materialName, material, materialDisabled, inventory)
        const quantity = material.budgetList.reduce((acc, b) => validBudgetItems?.includes(b.itemName) ? acc + b.quantity : acc, 0)
        const value = quantity * material.unitValue
        const validItems = material.budgetList.filter(b => validBudgetItems?.includes(b.itemName) != false)
        result.push({
            name: materialName,
            budgetQuantity: quantity,
            budgetValue: value,
            budgetWithMarkup: value * material.markup,
            balanceQuantity: materialDetails.balanceQuantity,
            balanceWithMarkup: materialDetails.balanceWithMarkup,
            budget: Object.fromEntries(validItems.map(b => [b.itemName, b.quantity]))
        })
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
}

function calculateMaterialDetailsFromInput(
    budgetItems: BudgetItemInput[],
    materialName: string,
    material: BudgetMaterialState,
    materialDisabled: Record<string, string[]>,
    inventory: Array<ItemData>
): { balanceQuantity: number; balanceWithMarkup: number } {
    const realList = inventory
        .filter(item => item.n === materialName)
        .map(item => ({
            itemName: item.c,
            disabled: materialDisabled[materialName]?.includes(item.c) || false,
            quantity: Number(item.q)
        }))

    const itemMap: Record<string, { budget?: number; pending?: number; real?: { quantity: number; disabled: boolean } }> = {}

    material.budgetList.forEach(b => {
        if (!itemMap[b.itemName]) itemMap[b.itemName] = {}
        itemMap[b.itemName].budget = b.quantity
        budgetItems.find(i => i.name === b.itemName)?.pendingLines?.forEach(p => {
            const mat = p.materials.find(m => m.name === materialName)
            if (!mat) return
            if (!itemMap[p.reason]) itemMap[p.reason] = {}
            itemMap[p.reason].pending = (mat.quantity + (itemMap[p.reason].pending || 0))
        })
    })

    realList.forEach(r => {
        if (!itemMap[r.itemName]) itemMap[r.itemName] = {}
        itemMap[r.itemName].real = { quantity: r.quantity, disabled: r.disabled }
    })

    const totals = {
        budgetQuantity: Object.values(itemMap).reduce((sum, item) => sum + (item.budget || 0), 0),
        pendingQuantity: Object.values(itemMap).reduce((sum, item) => sum + (item.pending || 0), 0),
        realQuantity: Object.values(itemMap).reduce((sum, item) => sum + (item.real?.disabled ? 0 : item.real?.quantity || 0), 0)
    }
    const balanceQuantity = materialName === "Shrapnel" ? 0 : totals.realQuantity - totals.budgetQuantity - totals.pendingQuantity

    return {
        balanceQuantity,
        balanceWithMarkup: balanceQuantity * material.unitValue * material.markup
    }
}

function toBudgetDetailsInput(s: BudgetState, itemNames: string[], selectedItem: string | null, title: string, inventory: Array<ItemData>): BudgetDetailsInput {
    return {
        itemNames,
        selectedItem,
        title,
        budgetItems: s.list.items.map(i => ({
            name: i.name,
            url: i.url,
            peds: i.peds,
            totalMU: i.totalMU,
            total: i.total,
            pendingLines: i.pendingLines
        })),
        materialsMap: s.materials.map,
        materialDisabled: s.materials.disabled,
        disabledItems: s.list.disabled || [],
        stage: s.stage,
        inventory
    }
}

function getItemViewData(item: BudgetItem, s: BudgetState, inventory: Array<ItemData>, disabled: boolean): ItemViewData {
    const detailsViewData = disabled ? null : calculateBudgetDetailsViewData(toBudgetDetailsInput(s, [item.name], item.name, item.name, inventory))

    return {
        name: item.name,
        peds: disabled ? 0 : item.peds,
        stored: disabled ? 0 : (detailsViewData?.totalBudgetValue || 0),
        markup: disabled ? 0 : item.totalMU,
        total: disabled ? 0 : item.total,
        balance: disabled ? 0 : (detailsViewData?.totalBalanceWithMarkup || 0),
        isLoading: item.refreshStatus === 'loading',
        isLoaded: item.refreshStatus === 'loaded',
        pendingAmount: item.pendingLines?.length || 0,
        disabled,
        detailsViewData
    }
}

function getDisabledItemViewData(item: string): ItemViewData {
    return {
        isLoading: false,
        isLoaded: false,
        pendingAmount: 0,
        disabled: true,
        detailsViewData: null,
        name: item,
        peds: 0,
        stored: 0,
        markup: 0,
        total: 0,
        balance: 0
    }
}

export function calculateBudgetViewData(s: BudgetState, inventory: Array<ItemData>): BudgetViewData {
    const disabledItems = s.list.disabled || []
    const groupedItemNames = new Set(s.groups.list.flatMap(g => g.itemNames))
    const ungroupedItems = s.list.items.filter(i => !groupedItemNames.has(i.name))

    // Calculate groups data
    const disabledGroups = s.groups.disabledGroups || []
    const groups: GroupViewData[] = s.groups.list.map(group => {
        const groupDisabled = disabledGroups.includes(group.id)
        const groupItems = s.list.items.filter(i => group.itemNames.includes(i.name))
        const detailsViewData = groupDisabled ? null : calculateBudgetDetailsViewData(toBudgetDetailsInput(s, group.itemNames, group.id, group.name, inventory))
        // Get disabled items that belong to this group but are not in s.list.items
        const groupDisabledItems = disabledItems.filter(name =>
            group.itemNames.includes(name) && !groupItems.some(i => i.name === name)
        )

        return {
            id: group.id,
            name: group.name,
            itemNames: group.itemNames,
            expanded: group.expanded,
            disabled: groupDisabled,
            peds: groupDisabled ? 0 : groupItems.reduce((sum, i) => sum + i.peds, 0),
            markup: groupDisabled ? 0 : groupItems.reduce((sum, i) => sum + i.totalMU, 0),
            stored: groupDisabled ? 0 : (detailsViewData?.totalBudgetValue || 0),
            total: groupDisabled ? 0 : groupItems.reduce((sum, i) => sum + i.total, 0),
            balance: groupDisabled ? 0 : (detailsViewData?.totalBalanceWithMarkup || 0),
            items: groupItems.map(item => getItemViewData(item, s, inventory, groupDisabled || disabledItems.includes(item.name)))
                .concat(groupDisabledItems.map(item => getDisabledItemViewData(item))),
            detailsViewData
        }
    })

    // Calculate ungrouped data
    const enabledUngroupedItems = ungroupedItems.filter(i => !disabledItems.includes(i.name))
    const ungroupedItemNames = ungroupedItems.map(i => i.name)
    const ungroupedMaterials = getMaterials(s, getUsedMaterialsMap(ungroupedItemNames, s.materials.map), inventory, ungroupedItemNames.filter(name => !disabledItems.includes(name)))
    const ungroupedMaterialsBalance = ungroupedMaterials.reduce((sum, mat) => sum + mat.budgetWithMarkup, 0)
    // Get disabled items that are not in any group
    const ungroupedDisabledItems = disabledItems.filter(name => !groupedItemNames.has(name) && !ungroupedItems.some(i => i.name === name))

    const ungrouped: UngroupedViewData = {
        name: 'Ungrouped',
        expanded: s.groups.ungroupedExpanded,
        peds: enabledUngroupedItems.reduce((sum, i) => sum + i.peds, 0),
        markup: enabledUngroupedItems.reduce((sum, i) => sum + i.totalMU, 0),
        stored: 0, // Will be updated below
        total: enabledUngroupedItems.reduce((sum, i) => sum + i.total, 0),
        balance: ungroupedMaterialsBalance,
        items: ungroupedItems.map(item => getItemViewData(item, s, inventory, disabledItems.includes(item.name)))
            .concat(ungroupedDisabledItems.map(item => getDisabledItemViewData(item)))
    }

    // Calculate overall totals
    // Get item names that are in disabled groups
    const itemsInDisabledGroups = s.groups.list
        .filter(g => disabledGroups.includes(g.id))
        .flatMap(g => g.itemNames)
    const enabledItems = s.list.items.filter(i => !disabledItems.includes(i.name) && !itemsInDisabledGroups.includes(i.name))
    const allItemNames = s.list.items.map(i => i.name)
    const enabledItemNames = allItemNames.filter(name => !disabledItems.includes(name) && !itemsInDisabledGroups.includes(name))
    const allMaterials = getMaterials(s, getUsedMaterialsMap(allItemNames, s.materials.map), inventory, enabledItemNames)
    const totalMaterialsBalance = allMaterials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)
    const detailsViewData = calculateBudgetDetailsViewData(toBudgetDetailsInput(s, allItemNames, 'totals', 'Totals', inventory))
    ungrouped.stored = detailsViewData?.totalBudgetValue || 0

    const totals: TotalsViewData = {
        name: 'Total',
        peds: enabledItems.reduce((sum, i) => sum + i.peds, 0),
        stored: detailsViewData?.totalBudgetValue || 0,
        markup: enabledItems.reduce((sum, i) => sum + i.totalMU, 0),
        total: enabledItems.reduce((sum, i) => sum + i.total, 0),
        balance: totalMaterialsBalance,
        detailsViewData
    }

    return {
        groups,
        ungrouped,
        totals,
        stage: s.stage,
        loadPercentage: s.loadPercentage
    }
}

export type UrlSelection = {
    selectedItem: string | null,
    selectedMaterial: string | null,
} & ({
    type: 'item',
    itemName: string,
} | {
    type: 'group',
    groupId: string,
} | {
    type: 'totals',
})

// Minimal input for calculateBudgetDetailsViewData to make it testable
export interface BudgetDetailsInput {
    itemNames: string[]
    selectedItem: string | null
    title: string
    budgetItems: Array<{
        name: string
        url: string
        peds: number
        totalMU: number
        total: number
        pendingLines?: BudgetLineData[]
    }>
    materialsMap: BudgetMaterialsMap
    materialDisabled?: Record<string, string[]>
    disabledItems: string[]
    stage: number
    inventory: Array<ItemData>
}

export function calculateBudgetDetailsViewData(input: BudgetDetailsInput): BudgetDetailsViewData | null {
    const { itemNames, selectedItem, title, budgetItems, materialsMap, materialDisabled, disabledItems, stage, inventory } = input
    if (itemNames.length === 0) return null

    const items = itemNames.map(n => budgetItems.find(i => i.name === n))
    if (items.some(i => !i)) return null

    // Combine balanceLines with pendingLines from items
    const pendingLines: Record<string, BudgetLineData[]> = {}
    items.forEach(item => {
        if (item?.pendingLines) {
            if (!pendingLines[item.name]) {
                pendingLines[item.name] = []
            }
            pendingLines[item.name].push(...item.pendingLines)
        }
    })

    const usedMaterialsMap = getUsedMaterialsMap(itemNames, materialsMap)
    const validBudgetItems = itemNames.filter(name => !disabledItems.includes(name))
    const materials = getMaterialsFromInput(budgetItems, usedMaterialsMap, materialDisabled || {}, inventory, validBudgetItems)
    const balanceLines = calculateBalanceLines(Date.now(), materials, validBudgetItems)
    Object.entries(balanceLines).forEach(([itemName, lines]) => {
        if (!pendingLines[itemName]) {
            pendingLines[itemName] = []
        }
        pendingLines[itemName].push(...lines)
    })

    // Calculate totals for the selected items
    const totals: ItemTotals = itemNames.reduce((acc, itemName) => {
        const item = budgetItems.find(i => i.name === itemName)
        if (item) {
            acc.peds += item.peds
            acc.markup += item.totalMU
            acc.total += item.total
        }
        return acc
    }, { peds: 0, stored: 0, markup: 0, total: 0 })

    // Convert pendingLines to view data format
    const pendingLinesViewData: PendingLinesGroupViewData[] = Object.entries(pendingLines).map(([itemName, lines]) => {
        const matNames: string[] = [...new Set(lines.flatMap(line =>
            line.materials.map(mat => mat.name)
        ))].sort()

        return {
            itemName,
            lines: lines.map((line, index) => ({
                index,
                date: line.date,
                reason: line.reason,
                ped: line.ped,
                materials: line.materials
            })).sort((a, b) => a.date - b.date),
            matNames
        }
    })

    return {
        title,
        items: items.filter(i => i !== undefined).map(item => ({ name: item.name, url: item.url })),
        totals,
        totalBalanceWithMarkup: materials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0),
        totalBudgetValue: materials.reduce((sum, mat) => sum + mat.budgetValue, 0),
        materials,
        pendingLines: pendingLinesViewData,
        pendingLinesForAction: pendingLines,
        stage,
        selectedItem
    }
}

export function calculateMaterialDetailsViewData(
    budgetState: BudgetState,
    materialName: string,
    inventory: Array<ItemData>
): MaterialDetailsViewData | null {
    const material = budgetState.materials.map[materialName]
    if (!material) return null
    return calculateMaterialDetails(budgetState, materialName, inventory)
}

export function calculateMaterialDetails(
    budgetState: BudgetState,
    materialName: string,
    inventory: Array<ItemData>
): MaterialDetailsViewData {
    const realList = inventory
        .filter(item => item.n === materialName)
        .map(item => ({
            itemName: item.c,
            disabled: budgetState.materials.disabled?.[materialName]?.includes(item.c) || false,
            quantity: Number(item.q)
        }))

    const material = budgetState.materials.map[materialName]!

    // Create a map of itemName to budget and real data
    const itemMap: Record<string, MaterialItemRowViewData> = {}

    material.budgetList.forEach(b => {
        if (!itemMap[b.itemName]) itemMap[b.itemName] = { itemName: b.itemName }
        itemMap[b.itemName].budget = { quantity: b.quantity }
        budgetState.list.items.find(i => i.name === b.itemName)?.pendingLines?.forEach(p => {
            const mat = p.materials.find(m => m.name === materialName)
            if (!mat) return
            if (!itemMap[p.reason]) itemMap[p.reason] = { itemName: p.reason }
            itemMap[p.reason].pending = { quantity: (mat.quantity + (itemMap[p.reason].pending?.quantity || 0)) }
        })
    })

    realList.forEach(r => {
        if (!itemMap[r.itemName]) itemMap[r.itemName] = { itemName: r.itemName }
        itemMap[r.itemName].real = { quantity: r.quantity, disabled: r.disabled }
    })

    function getPriority(item: MaterialItemRowViewData): number {
        if (item.budget) return 0
        if (item.pending) return 1
        if (item.real) return 2
        return 3 // fallback if none exist
    }
    const sortedItems = Object.values(itemMap).sort((a, b) => {
        const priorityDiff = getPriority(a) - getPriority(b)
        if (priorityDiff !== 0) return priorityDiff
        return a.itemName.localeCompare(b.itemName)
    })
    const totals = {
        budgetQuantity: Object.values(itemMap).reduce((sum, item) => sum + (item.budget?.quantity || 0), 0),
        pendingQuantity: Object.values(itemMap).reduce((sum, item) => sum + (item.pending?.quantity || 0), 0),
        realQuantity: Object.values(itemMap).reduce((sum, item) => sum + (item.real?.disabled ? 0 : item.real?.quantity || 0), 0)
    }
    let balanceQuantity = materialName == "Shrapnel" ? 0 : totals.realQuantity - totals.budgetQuantity - totals.pendingQuantity

    return {
        materialName,
        materialUnitValue: material.unitValue,
        markup: material.markup,
        sheetName: material.sheetName,
        items: sortedItems,
        totals,
        balanceQuantity,
        balanceWithMarkup: balanceQuantity * material.unitValue * material.markup
    }
}
