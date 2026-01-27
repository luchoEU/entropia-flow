import { StoredAction, ActivityItem, SoldAuctionItems, BoughtAuctionItems, ListedAuctionItems, RefineItems, CraftItems } from '../state/activity'
import { BudgetState } from '../state/budget'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'

export interface BudgetInferenceResult {
    action: StoredAction
    budgetLine: BudgetLineData
    budgetName: string
}

export function inferBudgetLinesFromActions(
    actions: StoredAction[],
    budget: BudgetState,
    inventoryItems: ActivityItem[]
): BudgetInferenceResult[] {
    const results: BudgetInferenceResult[] = []

    // Helper to look up inventory items by ID
    const getInventoryItem = (id: number) => inventoryItems.find(item => item.id === id)

    for (const storedAction of actions) {
        if (storedAction.type === 'sold_auction') {
            const items = storedAction.relatedItems as SoldAuctionItems
            const soldItem = getInventoryItem(items.item)
            const paymentItem = getInventoryItem(items.payment)

            if (!soldItem || !paymentItem) continue

            const budgetItem = budget.list.items.find(item => item.name === soldItem.name)
            if (budgetItem) {
                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Sold',
                    ped: paymentItem.value,
                    materials: [{ name: soldItem.name, quantity: -soldItem.quantity }]
                }

                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName: budgetItem.name
                })
            }
        } else if (storedAction.type === 'bought_auction') {
            const items = storedAction.relatedItems as BoughtAuctionItems
            const boughtItem = getInventoryItem(items.item)
            const paymentItem = items.payment ? getInventoryItem(items.payment) : undefined

            if (!boughtItem) continue

            let budgetName: string | undefined
            const mainItem = budget.list.items.find(item => item.name === boughtItem.name)
            if (mainItem) {
                budgetName = mainItem.name
            } else {
                const material = budget.materials.map[boughtItem.name]
                if (material && material.budgetList.length > 0) {
                    budgetName = material.budgetList[0].itemName
                }
            }

            if (budgetName) {
                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Buy',
                    ped: paymentItem ? -paymentItem.value : 0,
                    materials: [{ name: boughtItem.name, quantity: boughtItem.quantity }]
                }

                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName
                })
            }
        } else if (storedAction.type === 'listed_auction') {
            const items = storedAction.relatedItems as ListedAuctionItems
            const listedItem = getInventoryItem(items.item)
            const feeItem = getInventoryItem(items.fee)

            if (!listedItem || !feeItem) continue

            let budgetName: string | undefined
            const mainItem = budget.list.items.find(item => item.name === listedItem.name)
            if (mainItem) {
                budgetName = mainItem.name
            }

            if (budgetName) {
                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Listed',
                    ped: -feeItem.value,
                    materials: [{ name: listedItem.name, quantity: -listedItem.quantity }]
                }
                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName
                })
            }
        } else if (storedAction.type === 'refine') {
            const items = storedAction.relatedItems as RefineItems
            const producedItem = getInventoryItem(items.produced)

            if (!producedItem) continue

            let budgetName: string | undefined
            const mainItem = budget.list.items.find(item => item.name === producedItem.name)
            if (mainItem) {
                budgetName = mainItem.name
            }

            if (budgetName) {
                const materials = [
                    { name: producedItem.name, quantity: producedItem.quantity },
                    // Include materials used from relatedItems (consumed items have negative quantity)
                    ...items.consumed.map(consumedId => {
                        const consumed = getInventoryItem(consumedId)
                        return consumed ? { name: consumed.name, quantity: -consumed.quantity } : null
                    }).filter((m): m is { name: string; quantity: number } => m !== null)
                ]

                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Refine',
                    ped: materials.length > 1 ? Math.round(materials[1].quantity * 1.5) / 10000 : 0,
                    materials
                }
                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName
                })
            }
        } else if (storedAction.type === 'craft') {
            const items = storedAction.relatedItems as CraftItems

            if (!items.produced || items.produced.length === 0) continue

            const producedItem = getInventoryItem(items.produced[0])
            if (!producedItem) continue

            let budgetName: string | undefined
            const mainItem = budget.list.items.find(item => item.name === producedItem.name)
            if (mainItem) {
                budgetName = mainItem.name
            }

            if (budgetName) {
                const materials = [
                    { name: producedItem.name, quantity: producedItem.quantity },
                    // Include materials used from relatedItems
                    ...items.consumed.map(consumedId => {
                        const consumed = getInventoryItem(consumedId)
                        return consumed ? { name: consumed.name, quantity: -consumed.quantity } : null
                    }).filter((m): m is { name: string; quantity: number } => m !== null)
                ]

                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Craft',
                    ped: 0,
                    materials
                }
                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName
                })
            }
        }
    }

    return results
}
