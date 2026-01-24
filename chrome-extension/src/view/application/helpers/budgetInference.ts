import { StoredAction } from '../state/activity'
import { BudgetState } from '../state/budget'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'

export interface BudgetInferenceResult {
    action: StoredAction
    budgetLine: BudgetLineData
    budgetName: string
}

export function inferBudgetLinesFromActions(
    actions: StoredAction[],
    budget: BudgetState
): BudgetInferenceResult[] {
    const results: BudgetInferenceResult[] = []

    for (const storedAction of actions) {
        if (storedAction.type === 'sold_auction') {
            const item = budget.list.items.find(item => item.name === storedAction.item)
            if (item) {
                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Sold',
                    ped: storedAction.value,
                    materials: [{ name: storedAction.item, quantity: -storedAction.amount! }]
                }
                
                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName: item.name
                })
            }
        } else if (storedAction.type === 'bought_auction') {
            let budgetName: string | undefined
            const mainItem = budget.list.items.find(item => item.name === storedAction.item)
            if (mainItem) {
                budgetName = mainItem.name
            } else {
                const material = budget.materials[storedAction.item]
                if (material && material.budgetList.length > 0) {
                    budgetName = material.budgetList[0].itemName
                }
            }
            
            if (budgetName) {
                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Buy',
                    ped: storedAction.value ? -storedAction.value : 0,
                    materials: [{ name: storedAction.item, quantity: storedAction.amount || 0 }]
                }
                
                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName
                })
            }
        } else if (storedAction.type === 'listed_auction') {
            // Handle listing actions: create a budget line for the item with a negative quantity
            // and a negative PED corresponding to any listing fee/value on the action.
            let budgetName: string | undefined
            const mainItem = budget.list.items.find(item => item.name === storedAction.item)
            if (mainItem) {
                budgetName = mainItem.name
            }

            if (budgetName) {
                const amount = (storedAction.amount ?? 0)
                const budgetLine: BudgetLineData = {
                    date: storedAction.timestamp,
                    reason: 'Listed',
                    ped: storedAction.value ? -storedAction.value : 0,
                    materials: [{ name: storedAction.item, quantity: -amount }]
                }
                results.push({
                    action: storedAction,
                    budgetLine,
                    budgetName
                })
            }
        } else if (storedAction.type === 'craft') {
            // Handle craft actions: create a budget line for the crafted item
            // and include materials used in crafting from relatedItems
            let budgetName: string | undefined
            const mainItem = budget.list.items.find(item => item.name === storedAction.item)
            if (mainItem) {
                budgetName = mainItem.name
            }

            if (budgetName) {
                const amount = (storedAction.amount ?? 0)
                const materials = [
                    { name: storedAction.item, quantity: amount },
                    // Include materials used from relatedItems
                    ...storedAction.relatedItems.map(related => ({
                        name: related.n,
                        quantity: -parseInt(related.q) // negative for consumed materials
                    }))
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
