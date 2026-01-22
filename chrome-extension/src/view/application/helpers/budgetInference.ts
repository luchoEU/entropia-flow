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
                const material = budget.materials.map[storedAction.item]
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
        }
    }

    return results
}