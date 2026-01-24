import { ItemData } from '../../../common/state';
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget';
import { BudgetState } from '../state/budget'
import { BalanceMaterialData } from './budget';
import { calculateMaterialDetails } from './budgetViewData';

function getBalanceLines(timestamp: number, budgetState: BudgetState, inventory: Array<ItemData>, validBudgetItems?: string[]): { [itemName: string]: BudgetLineData[] } {
    const balancedData = createBalanceMaterialData(budgetState, inventory, Object.keys(budgetState.materials))
    return calculateBalanceLines(timestamp, balancedData, validBudgetItems);
}

function createBalanceMaterialData(budgetState: BudgetState, inventory: Array<ItemData>, materialNames: string[]): BalanceMaterialData[] {
    return materialNames.map(name => {
        const material = budgetState.materials[name];
        if (!material) {
            throw new Error(`Material '${name}' not found in materialsMap`);
        }
        if (!material.budgetList || material.budgetList.length === 0) {
            throw new Error(`Material '${name}' has no budgetList entries`);
        }
        const materialDetails = calculateMaterialDetails(budgetState, name, inventory);
        return {
            name: material.sheetName,
            balanceQuantity: materialDetails!.balanceQuantity,
            balanceWithMarkup: materialDetails!.balanceWithMarkup,
            budget: Object.fromEntries(material.budgetList.map(b => [b.itemName, b.quantity]))
        };
    });
}

function calculateBalanceLines(timestamp: number, materials: BalanceMaterialData[], validBudgetItems?: string[], pendingLines?: { [itemName: string]: BudgetLineData[] }): { [itemName: string]: BudgetLineData[] } {
    const lines: { [itemName: string]: BudgetLineData[] } = {}
    for (const material of materials) {
        if (material.name == "Shrapnel")
            continue

        const quantity = material.balanceQuantity + (pendingLines ? Object.values(pendingLines).flatMap(lines => lines).flatMap(line => line.materials).reduce((sum, m) => sum + m.quantity, 0) : 0);
        if (quantity < 0) {
            const needed = -quantity;
            const budgets = Object.entries(material.budget);

            // Check if all valid budget entries have quantity 0
            const validBudgets = budgets.filter(([name]) => validBudgetItems?.includes(name) != false);
            const totalValidBudget = validBudgets.reduce((sum, [, qty]) => sum + qty, 0);

            if (totalValidBudget === 0 && validBudgets.length > 0) {
                // All valid budgets have quantity 0 - attribute full balance to first valid budget
                const [budgetName] = validBudgets[0];
                if (!lines[budgetName]) {
                    lines[budgetName] = [{
                        date: timestamp,
                        reason: 'Balance',
                        ped: 0,
                        materials: []
                    }]
                }
                lines[budgetName][0].materials.push({
                    name: material.name,
                    quantity: quantity
                })
                // ped stays 0 when budget quantity is 0 (no cost allocation)
            } else {
                // Normal proportional distribution
                let remaining = needed;
                for (const [budgetName, budgetValue] of validBudgets) {
                    if (remaining <= 0) break;
                    if (validBudgetItems !== undefined && !validBudgetItems.includes(budgetName)) continue;
                    const take = Math.min(budgetValue, remaining);
                    if (!lines[budgetName]) {
                        lines[budgetName] = [{
                            date: timestamp,
                            reason: 'Balance',
                            ped: 0,
                            materials: []
                        }]
                    }
                    lines[budgetName][0].materials.push({
                        name: material.name,
                        quantity: -take
                    })
                    const ped = lines[budgetName][0].ped! - (material.balanceWithMarkup * (take / needed))
                    lines[budgetName][0].ped! = Math.round((ped + Number.EPSILON) * 100) / 100
                    remaining -= take;
                }
            }
        } else if (quantity > 0) {
            const chosenBudget = Object.keys(material.budget).find(name => validBudgetItems?.includes(name) != false);
            if (!chosenBudget) continue; // not in validBudgetItems
            if (!lines[chosenBudget]) {
                lines[chosenBudget] = [{
                    date: timestamp,
                    reason: 'Balance',
                    ped: 0,
                    materials: []
                }]
            }
            lines[chosenBudget][0].materials.push({
                name: material.name,
                quantity: quantity
            })
            const ped = lines[chosenBudget][0].ped! - material.balanceWithMarkup
            lines[chosenBudget][0].ped! = Math.round((ped + Number.EPSILON) * 100) / 100
        }
    }
    return lines
}

export {
    getBalanceLines,
    createBalanceMaterialData,
    calculateBalanceLines
}
