import { ItemData } from "../../../common/state"
import { BudgetItem, BudgetDisabledMaterials, BudgetMaterialsMap, BudgetMaterialState, BudgetState } from "../state/budget"
import { BalanceMaterialData, getRealList } from "./budget"
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

export interface ItemViewData {
    item: BudgetItem
    isLoading: boolean
    isLoaded: boolean
    pendingAmount: number
    stored: number
    balance: number
    detailsViewData: BudgetDetailsViewData | null
}

export interface GroupViewData {
    id: string
    name: string
    itemNames: string[]
    expanded: boolean
    totals: ItemTotals
    balance: number
    items: ItemViewData[]
    detailsViewData: BudgetDetailsViewData | null
}

export interface UngroupedViewData {
    expanded: boolean
    totals: ItemTotals
    balance: number
    items: ItemViewData[]
}

export interface TotalsViewData {
    peds: number
    stored: number
    markup: number
    total: number
    balance: number
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

export function getMaterials(budgetState: BudgetState, usedMaterialsMap: BudgetMaterialsMap, inventory: Array<ItemData>, disabledMaterials: BudgetDisabledMaterials, validBudgetItems?: string[]): MaterialSummary[] {
    const result: MaterialSummary[] = []

    for (const [materialName, material] of Object.entries(usedMaterialsMap)) {
        const materialDetails = calculateMaterialDetails(budgetState, materialName, inventory);
        const quantity = material.budgetList.reduce((acc, b) => validBudgetItems?.includes(b.itemName) ? acc + b.quantity : acc, 0)
        const value = quantity * material.unitValue
        const validItems = material.budgetList.filter(b => validBudgetItems?.includes(b.itemName) != false)
        const balanceQuantity = Math.max(-validItems.reduce((acc, b) => acc + b.quantity, 0), materialDetails.balanceQuantity)
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

function getItemViewData(item: BudgetItem, s: BudgetState, inventory: Array<ItemData>): ItemViewData {
    const detailsViewData = _calculateBudgetDetailsViewData(s, [item.name], item.name, item.name, inventory)

    return {
        item,
        stored: detailsViewData?.totalBudgetValue || 0,
        balance: detailsViewData?.totalBalanceWithMarkup || 0,
        isLoading: item.refreshStatus === 'loading',
        isLoaded: item.refreshStatus === 'loaded',
        pendingAmount: item.pendingLines?.length || 0,
        detailsViewData
    }
}

export function calculateBudgetViewData(s: BudgetState, inventory: Array<ItemData>): BudgetViewData {
    const groupedItemNames = new Set(s.groups.list.flatMap(g => g.itemNames))
    const ungroupedItems = s.list.items.filter(i => !groupedItemNames.has(i.name))

    // Calculate groups data
    const groups: GroupViewData[] = s.groups.list.map(group => {
        const groupItems = s.list.items.filter(i => group.itemNames.includes(i.name))
        const detailsViewData = _calculateBudgetDetailsViewData(s, group.itemNames, group.id, group.name, inventory)

        return {
            id: group.id,
            name: group.name,
            itemNames: group.itemNames,
            expanded: group.expanded,
            totals: {
                peds: groupItems.reduce((sum, i) => sum + i.peds, 0),
                markup: groupItems.reduce((sum, i) => sum + i.totalMU, 0),
                stored: detailsViewData?.totalBudgetValue || 0,
                total: groupItems.reduce((sum, i) => sum + i.total, 0)
            },
            balance: detailsViewData?.totalBalanceWithMarkup || 0,
            items: groupItems.map(item => getItemViewData(item, s, inventory)),
            detailsViewData
        }
    })

    // Calculate ungrouped data
    const ungroupedTotals: ItemTotals = {
        peds: ungroupedItems.reduce((sum, i) => sum + i.peds, 0),
        markup: ungroupedItems.reduce((sum, i) => sum + i.totalMU, 0),
        stored: 0,
        total: ungroupedItems.reduce((sum, i) => sum + i.total, 0)
    }
    const ungroupedItemNames = ungroupedItems.map(i => i.name)
    const ungroupedMaterials = getMaterials(s,getUsedMaterialsMap(ungroupedItemNames, s.materials), inventory, s.disabledMaterials)
    const ungroupedMaterialsBalance = ungroupedMaterials.reduce((sum, mat) => sum + mat.budgetWithMarkup, 0)

    const ungrouped: UngroupedViewData = {
        expanded: s.groups.ungroupedExpanded,
        totals: ungroupedTotals,
        balance: ungroupedMaterialsBalance,
        items: ungroupedItems.map(item => getItemViewData(item, s, inventory))
    }

    // Calculate overall totals
    const allItemNames = s.list.items.map(i => i.name)
    const allMaterials = getMaterials(s,getUsedMaterialsMap(allItemNames, s.materials), inventory, s.disabledMaterials)
    const totalMaterialsBalance = allMaterials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)
    const detailsViewData = _calculateBudgetDetailsViewData(s, allItemNames, 'totals', 'Totals', inventory)
    ungroupedTotals.stored = detailsViewData?.totalBudgetValue || 0

    const totals: TotalsViewData = {
        peds: s.list.items.reduce((sum, i) => sum + i.peds, 0),
        stored: detailsViewData?.totalBudgetValue || 0,
        markup: s.list.items.reduce((sum, i) => sum + i.totalMU, 0),
        total: s.list.items.reduce((sum, i) => sum + i.total, 0),
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

function _calculateBudgetDetailsViewData(
    s: BudgetState,
    itemNames: string[],
    selectedItem: string | null,
    title: string,
    inventory: Array<ItemData>
): BudgetDetailsViewData | null {
    if (itemNames.length === 0) return null

    const items = itemNames.map(n => s.list.items.find(i => i.name === n))
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
    Object.values(pendingLines).forEach(lines => {
        lines.sort((a, b) => a.date - b.date)
    })

    const usedMaterialsMap = getUsedMaterialsMap(itemNames, s.materials)
    const validBudgetItems = itemNames.filter(name => !s.disabledItems.names.includes(name))
    const materials = getMaterials(s, usedMaterialsMap, inventory, s.disabledMaterials, validBudgetItems)
    const balanceLines = calculateBalanceLines(Date.now(), materials, validBudgetItems)
    Object.entries(balanceLines).forEach(([itemName, lines]) => {
        if (!pendingLines[itemName]) {
            pendingLines[itemName] = []
        }
        pendingLines[itemName].push(...lines)
    })

    // Calculate totals for the selected items
    const totals: ItemTotals = itemNames.reduce((acc, itemName) => {
        const item = s.list.items.find(i => i.name === itemName)
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
            lines: lines.map(line => ({
                date: line.date,
                reason: line.reason,
                ped: line.ped,
                materials: line.materials
            })),
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
        stage: s.stage,
        selectedItem
    }
}

export function calculateMaterialDetailsViewData(
    budgetState: BudgetState,
    materialName: string,
    inventory: Array<ItemData>
): MaterialDetailsViewData | null {
    const material = budgetState.materials[materialName]
    if (!material) return null
    return calculateMaterialDetails(budgetState, materialName, inventory)
}

export function calculateMaterialDetails(
    budgetState: BudgetState,
    materialName: string,
    inventory: Array<ItemData>
): MaterialDetailsViewData {
    const realList = getRealList(materialName, inventory, budgetState.disabledMaterials)

    const material = budgetState.materials[materialName]!

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
        realQuantity: Object.values(itemMap).reduce((sum, item) => sum + (item.real?.quantity || 0), 0)
    }
    const balanceQuantity = totals.realQuantity - totals.budgetQuantity - totals.pendingQuantity

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
