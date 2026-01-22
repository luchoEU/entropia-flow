import { fillBudgetMaterialCalc } from '../helpers/budget'
import { BudgetMaterialState } from '../state/budget'

describe('inventory sync in budget middleware', () => {
    it('should update realList when inventory quantities change', () => {
        const material: BudgetMaterialState = {
            sheetName: 'Test Material',
            expanded: false,
            selected: false,
            unitValue: 1.0,
            markup: 1.5,
            budgetList: [
                { itemName: 'Test Item', quantity: 10, disabled: false }
            ],
            realList: [
                { itemName: 'Container1', quantity: 5, disabled: false },
                { itemName: 'Container2', quantity: 3, disabled: false }
            ],
            c: {
                totalBudgetQuantity: 10,
                totalRealQuantity: 8,
                totalBudget: 10,
                totalReal: 8,
                balanceQuantity: -2,
                balance: -2,
                balanceWithMarkup: -3
            }
        }

        // Simulate inventory change - Container1 now has 7 instead of 5
        const updatedMaterial = fillBudgetMaterialCalc({
            ...material,
            realList: [
                { itemName: 'Container1', quantity: 7, disabled: false }, // Changed
                { itemName: 'Container2', quantity: 3, disabled: false } // Same
            ]
        })

        expect(updatedMaterial.realList).toHaveLength(2)
        expect(updatedMaterial.realList[0].quantity).toBe(7)
        expect(updatedMaterial.realList[1].quantity).toBe(3)
        expect(updatedMaterial.c.totalRealQuantity).toBe(10) // 7 + 3
        expect(updatedMaterial.c.balanceQuantity).toBe(0) // 10 (real) - 10 (budget)
    })

    it('should handle adding new container to inventory', () => {
        const material: BudgetMaterialState = {
            sheetName: 'Test Material',
            expanded: false,
            selected: false,
            unitValue: 1.0,
            markup: 1.5,
            budgetList: [
                { itemName: 'Test Item', quantity: 10, disabled: false }
            ],
            realList: [
                { itemName: 'Container1', quantity: 8, disabled: false }
            ],
            c: {
                totalBudgetQuantity: 10,
                totalRealQuantity: 8,
                totalBudget: 10,
                totalReal: 8,
                balanceQuantity: -2,
                balance: -2,
                balanceWithMarkup: -3
            }
        }

        // Add new Container2 to inventory
        const updatedMaterial = fillBudgetMaterialCalc({
            ...material,
            realList: [
                { itemName: 'Container1', quantity: 8, disabled: false },
                { itemName: 'Container2', quantity: 5, disabled: false } // New
            ]
        })

        expect(updatedMaterial.realList).toHaveLength(2)
        expect(updatedMaterial.c.totalRealQuantity).toBe(13) // 8 + 5
        expect(updatedMaterial.c.balanceQuantity).toBe(3) // 13 (real) - 10 (budget)
        expect(updatedMaterial.c.balanceWithMarkup).toBe(4.5) // 3 * 1.5
    })

    it('should handle removing container from inventory', () => {
        const material: BudgetMaterialState = {
            sheetName: 'Test Material',
            expanded: false,
            selected: false,
            unitValue: 1.0,
            markup: 1.5,
            budgetList: [
                { itemName: 'Test Item', quantity: 10, disabled: false }
            ],
            realList: [
                { itemName: 'Container1', quantity: 5, disabled: false },
                { itemName: 'Container2', quantity: 3, disabled: false }
            ],
            c: {
                totalBudgetQuantity: 10,
                totalRealQuantity: 8,
                totalBudget: 10,
                totalReal: 8,
                balanceQuantity: -2,
                balance: -2,
                balanceWithMarkup: -3
            }
        }

        // Remove Container2 from inventory
        const updatedMaterial = fillBudgetMaterialCalc({
            ...material,
            realList: [
                { itemName: 'Container1', quantity: 5, disabled: false } // Container2 removed
            ]
        })

        expect(updatedMaterial.realList).toHaveLength(1)
        expect(updatedMaterial.c.totalRealQuantity).toBe(5) // Only Container1
        expect(updatedMaterial.c.balanceQuantity).toBe(-5) // 5 (real) - 10 (budget)
        expect(updatedMaterial.c.balanceWithMarkup).toBe(-7.5) // -5 * 1.5
    })

    it('should handle disabled items in realList', () => {
        const material: BudgetMaterialState = {
            sheetName: 'Test Material',
            expanded: false,
            selected: false,
            unitValue: 1.0,
            markup: 1.5,
            budgetList: [
                { itemName: 'Test Item', quantity: 10, disabled: false }
            ],
            realList: [
                { itemName: 'Container1', quantity: 5, disabled: false },
                { itemName: 'Container2', quantity: 5, disabled: true } // Disabled
            ],
            c: {
                totalBudgetQuantity: 10,
                totalRealQuantity: 5,
                totalBudget: 10,
                totalReal: 5,
                balanceQuantity: -5,
                balance: -5,
                balanceWithMarkup: -7.5
            }
        }

        const updatedMaterial = fillBudgetMaterialCalc(material)

        // Disabled items should not count towards totalRealQuantity
        expect(updatedMaterial.c.totalRealQuantity).toBe(5) // Only Container1 (disabled: false)
        expect(updatedMaterial.c.balanceQuantity).toBe(-5) // 5 (real) - 10 (budget)
    })
})