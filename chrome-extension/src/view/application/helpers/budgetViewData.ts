import { BudgetItem, BudgetMaterialsMap, BudgetMaterialState, BudgetState } from "../state/budget"
import { BalanceMaterialData, getGroupTotals, getUngroupedItems } from "./budget"
import { calculateBalanceLines } from "./budgetGetBalanceLines"
import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"

export interface MaterialSummary extends BalanceMaterialData {
    budgetQuantity: number
    budgetValue: number
    budgetWithMarkup: number
}

export interface ItemTotals {
    peds: number
    totalMU: number
    total: number
}

export interface ItemViewData {
    item: BudgetItem
    materialsBalance: number
    isLoading: boolean
    isLoaded: boolean
    pendingAmount: number
    detailsPanelViewData: BudgetDetailsPanelViewData | null
}

export interface GroupViewData {
    id: string
    name: string
    itemNames: string[]
    expanded: boolean
    totals: ItemTotals
    materialsBalance: number
    items: ItemViewData[]
    detailsPanelViewData: BudgetDetailsPanelViewData | null
}

export interface UngroupedViewData {
    expanded: boolean
    totals: ItemTotals
    materialsBalance: number
    items: ItemViewData[]
}

export interface TotalsViewData {
    peds: number
    totalMU: number
    total: number
    materialsBalance: number
    detailsPanelViewData: BudgetDetailsPanelViewData | null
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

export interface BudgetDetailsPanelViewData {
    title: string
    items: { name: string, url: string }[]
    totals: ItemTotals
    totalBalanceWithMarkup: number
    materials: MaterialSummary[]
    pendingLines: PendingLinesGroupViewData[]
    pendingLinesForAction: Record<string, BudgetLineData[]>
    stage: number
    selectedItem: string | null
}

export interface MaterialItemRowViewData {
    itemName: string
    budget?: { quantity: number, value: number }
    real?: { quantity: number, value: number, disabled: boolean }
}

export interface MaterialDetailsPanelViewData {
    materialName: string
    markup: number
    balanceWithMarkup: number
    sheetName: string
    items: MaterialItemRowViewData[]
    totals: { budgetQuantity: number, budgetValue: number, realQuantity: number, realValue: number }
    balance: { quantity: number, value: number }
    selectedItem: string | null
}

export function getUsedMaterialsMap(itemNames: string[], materialsMap: BudgetMaterialsMap): Record<string, BudgetMaterialState> {
    return Object.fromEntries(Object.entries(materialsMap).filter(([_, m]) => m.budgetList.some(b => itemNames.includes(b.itemName))))
}

export function getMaterials(usedMaterialsMap: BudgetMaterialsMap, validBudgetItems?: string[]): MaterialSummary[] {
    const result: MaterialSummary[] = []

    for (const [materialName, material] of Object.entries(usedMaterialsMap)) {
        const quantity = material.budgetList.reduce((acc, b) => validBudgetItems?.includes(b.itemName) ? acc + b.quantity : acc, 0)
        const value = quantity * material.unitValue
        const validItems = material.budgetList.filter(b => validBudgetItems?.includes(b.itemName) != false)
        const balanceQuantity = Math.max(-validItems.reduce((acc, b) => acc + b.quantity, 0), material.c.balanceQuantity)
        result.push({
            name: materialName,
            budgetQuantity: quantity,
            budgetValue: value,
            budgetWithMarkup: value * material.markup,
            balanceQuantity,
            balanceWithMarkup: material.c.balanceQuantity != 0 ? material.c.balanceWithMarkup * (balanceQuantity / material.c.balanceQuantity) : 0,
            budget: Object.fromEntries(validItems.map(b => [b.itemName, b.quantity]))
        })
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
}

function getItemViewData(item: BudgetItem, s: BudgetState): ItemViewData {
    const detailsPanelViewData = _calculateBudgetDetailsPanelViewData(s, [item.name], item.name, item.name)

    return {
        item,
        materialsBalance: detailsPanelViewData?.totalBalanceWithMarkup || 0,
        isLoading: item.refreshStatus === 'loading',
        isLoaded: item.refreshStatus === 'loaded',
        pendingAmount: item.pendingLines?.length || 0,
        detailsPanelViewData
    }
}

export function calculateBudgetViewData(s: BudgetState): BudgetViewData {
    const ungroupedItems = getUngroupedItems(s)

    // Calculate groups data
    const groups: GroupViewData[] = s.groups.list.map(group => {
        const groupItems = s.list.items.filter(i => group.itemNames.includes(i.name))
        const totals = getGroupTotals(group, s.list.items)
        const detailsPanelViewData = _calculateBudgetDetailsPanelViewData(s, group.itemNames, group.id, group.name)

        return {
            id: group.id,
            name: group.name,
            itemNames: group.itemNames,
            expanded: group.expanded,
            totals,
            materialsBalance: detailsPanelViewData?.totalBalanceWithMarkup || 0,
            items: groupItems.map(item => getItemViewData(item, s)),
            detailsPanelViewData
        }
    })

    // Calculate ungrouped data
    const ungroupedTotals: ItemTotals = {
        peds: ungroupedItems.reduce((sum, i) => sum + i.peds, 0),
        totalMU: ungroupedItems.reduce((sum, i) => sum + i.totalMU, 0),
        total: ungroupedItems.reduce((sum, i) => sum + i.total, 0)
    }
    const ungroupedItemNames = ungroupedItems.map(i => i.name)
    const ungroupedMaterials = getMaterials(getUsedMaterialsMap(ungroupedItemNames, s.materials.map))
    const ungroupedMaterialsBalance = ungroupedMaterials.reduce((sum, mat) => sum + mat.budgetWithMarkup, 0)

    const ungrouped: UngroupedViewData = {
        expanded: s.groups.ungroupedExpanded,
        totals: ungroupedTotals,
        materialsBalance: ungroupedMaterialsBalance,
        items: ungroupedItems.map(item => getItemViewData(item, s))
    }

    // Calculate overall totals
    const allItemNames = s.list.items.map(i => i.name)
    const allMaterials = getMaterials(getUsedMaterialsMap(allItemNames, s.materials.map))
    const totalMaterialsBalance = allMaterials.reduce((sum, mat) => sum + mat.balanceWithMarkup, 0)

    const totals: TotalsViewData = {
        peds: s.list.items.reduce((sum, i) => sum + i.peds, 0),
        totalMU: s.list.items.reduce((sum, i) => sum + i.totalMU, 0),
        total: s.list.items.reduce((sum, i) => sum + i.total, 0),
        materialsBalance: totalMaterialsBalance,
        detailsPanelViewData: _calculateBudgetDetailsPanelViewData(s, allItemNames, 'totals', 'Totals')
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

function _calculateBudgetDetailsPanelViewData(
    s: BudgetState,
    itemNames: string[],
    selectedItem: string | null,
    title: string
): BudgetDetailsPanelViewData | null {
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

    const usedMaterialsMap = getUsedMaterialsMap(itemNames, s.materials.map)
    const validBudgetItems = itemNames.filter(name => !s.disabledItems.names.includes(name))
    const materials = getMaterials(usedMaterialsMap, validBudgetItems)
    const balanceLines = calculateBalanceLines(Date.now(), materials, validBudgetItems)
    Object.entries(balanceLines).forEach(([itemName, lines]) => {
        if (!pendingLines[itemName]) {
            pendingLines[itemName] = []
        }
        pendingLines[itemName].push(...lines)
    })

    // Calculate totals for the selected items
    const totals = itemNames.reduce((acc, itemName) => {
        const item = s.list.items.find(i => i.name === itemName)
        if (item) {
            acc.peds += item.peds
            acc.totalMU += item.totalMU
            acc.total += item.total
        }
        return acc
    }, { peds: 0, totalMU: 0, total: 0 })

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
        materials,
        pendingLines: pendingLinesViewData,
        pendingLinesForAction: pendingLines,
        stage: s.stage,
        selectedItem
    }
}

export function calculateMaterialDetailsPanelViewData(
    s: BudgetState,
    selection: UrlSelection | null
): MaterialDetailsPanelViewData | null {
    if (!selection || !selection.selectedMaterial) return null

    const material = s.materials.map[selection.selectedMaterial]
    if (!material) return null

    // Create a map of itemName to budget and real data
    const itemMap: Record<string, MaterialItemRowViewData> = {}

    material.budgetList.forEach(b => {
        if (!itemMap[b.itemName]) itemMap[b.itemName] = { itemName: b.itemName }
        itemMap[b.itemName].budget = { quantity: b.quantity, value: b.quantity * material.unitValue }
    })

    material.realList.forEach(r => {
        if (!itemMap[r.itemName]) itemMap[r.itemName] = { itemName: r.itemName }
        itemMap[r.itemName].real = { quantity: r.quantity, value: r.quantity * material.unitValue, disabled: r.disabled }
    })

    const sortedItems = Object.values(itemMap).sort((a, b) => a.itemName.localeCompare(b.itemName))

    return {
        materialName: selection.selectedMaterial,
        markup: material.markup,
        balanceWithMarkup: material.c.balanceWithMarkup,
        sheetName: material.sheetName,
        items: sortedItems,
        totals: {
            budgetQuantity: material.c.totalBudgetQuantity,
            budgetValue: material.c.totalBudget,
            realQuantity: material.c.totalRealQuantity,
            realValue: material.c.totalReal
        },
        balance: {
            quantity: material.c.balanceQuantity,
            value: material.c.balance
        },
        selectedItem: selection.selectedItem
    }
}
