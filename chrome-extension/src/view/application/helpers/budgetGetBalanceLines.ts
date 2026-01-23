import { BudgetLineData } from '../../services/api/sheets/sheetsBudget';
import { BudgetMaterialsMap } from '../state/budget'
import { BalanceMaterialData } from './budget';

function getBalanceLines(timestamp: number, materialsMap: BudgetMaterialsMap, validBudgetItems?: string[]): { [itemName: string]: BudgetLineData[] } {
    const balancedData = createBalanceMaterialData(materialsMap, Object.keys(materialsMap))
    return calculateBalanceLines(timestamp, balancedData, validBudgetItems);
}

function createBalanceMaterialData(materialsMap: BudgetMaterialsMap, materialNames: string[]): BalanceMaterialData[] {
    return materialNames.map(name => {
        const material = materialsMap[name];
        if (!material) {
            throw new Error(`Material '${name}' not found in materialsMap`);
        }
        if (!material.budgetList || material.budgetList.length === 0) {
            throw new Error(`Material '${name}' has no budgetList entries`);
        }
        return {
            sheetName: material.sheetName,
            balanceQuantity: material.c?.balanceQuantity || 0,
            balanceWithMarkup: material.c?.balanceWithMarkup || 0,
            budget: Object.fromEntries(material.budgetList.map(b => [b.itemName, b.quantity]))
        };
    });
}

function calculateBalanceLines(timestamp: number, materials: BalanceMaterialData[], validBudgetItems?: string[]): { [itemName: string]: BudgetLineData[] } {
    const lines: { [itemName: string]: BudgetLineData[] } = {}
    for (const material of materials) {
        if (material.balanceQuantity < 0) {
            const needed = -material.balanceQuantity;
            let remaining = needed;
            const budgets = Object.entries(material.budget);
            for (const [budgetName, budgetValue] of budgets) {
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
                    name: material.sheetName,
                    quantity: -take
                })
                const ped = lines[budgetName][0].ped! - (material.balanceWithMarkup * (take / needed))
                lines[budgetName][0].ped = Math.round((ped + Number.EPSILON) * 100) / 100
                remaining -= take;
            }
        } else if (material.balanceQuantity > 0) {
            const budgets = Object.entries(material.budget);
            if (budgets.length > 0) {
                const [firstBudgetName] = budgets[0];
                if (validBudgetItems === undefined || validBudgetItems.includes(firstBudgetName)) {
                    if (!lines[firstBudgetName]) {
                        lines[firstBudgetName] = [{
                            date: timestamp,
                            reason: 'Balance',
                            ped: 0,
                            materials: []
                        }]
                    }
                    lines[firstBudgetName][0].materials.push({
                        name: material.sheetName,
                        quantity: material.balanceQuantity
                    })
                    const ped = lines[firstBudgetName][0].ped! - material.balanceWithMarkup
                    lines[firstBudgetName][0].ped = Math.round((ped + Number.EPSILON) * 100) / 100
                }
            }
        }
    }
    return lines
}

export {
    getBalanceLines,
    createBalanceMaterialData,
    calculateBalanceLines
}
