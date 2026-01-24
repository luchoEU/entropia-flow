import { describe, it, expect } from "@jest/globals"
import { inferBudgetLinesFromActions, BudgetInferenceResult } from './budgetInference'
import { StoredAction } from '../state/activity'
import { BudgetState } from '../state/budget'

describe('budgetInference', () => {
    describe('inferBudgetLinesFromActions', () => {
        const createMockBudgetState = (itemNames: string[], materials: { name: string; usedBy: string }[] = []) => {
            const budgetState: BudgetState = {
                stage: 0,
                loadPercentage: 0,
                disabledItems: { names: [] },
                disabledMaterials: {},
                list: {
                    items: itemNames.map(name => ({
                        name,
                        totalMU: 0,
                        total: 0,
                        peds: 0,
                        url: `http://example.com/${name}`
                    }))
                },
                groups: { list: [], ungroupedExpanded: false },
                materials: {}
            }

            for (const material of materials) {
                budgetState.materials[material.name] = {
                    sheetName: material.name,
                    expanded: false,
                    unitValue: 0,
                    markup: 1,
                    budgetList: [{ itemName: material.usedBy, disabled: false, quantity: 0 }],
                }
            }

            return budgetState
        }

        const createSoldAction = (item: string, amount: number, value: number, timestamp: number = Date.now()): StoredAction => ({
            id: `action-${Math.random()}`,
            type: 'sold_auction',
            item,
            amount,
            value,
            timestamp,
            sources: ['inventory'],
            relatedItems: []
        })

        const createBoughtAction = (item: string, amount: number, value: number, timestamp: number = Date.now()): StoredAction => ({
            id: `action-${Math.random()}`,
            type: 'bought_auction',
            item,
            amount,
            value,
            timestamp,
            sources: ['inventory'],
            relatedItems: []
        })

        const createOtherAction = (type: string, item: string, timestamp: number = Date.now()): StoredAction => ({
            id: `action-${Math.random()}`,
            type: type as any,
            item,
            timestamp,
            sources: ['inventory'],
            relatedItems: []
        })

        const createListedAction = (item: string, amount: number, value: number, timestamp: number = Date.now()): StoredAction => ({
            id: `action-${Math.random()}`,
            type: 'listed_auction',
            item,
            amount,
            value,
            timestamp,
            sources: ['inventory'],
            relatedItems: []
        })

        it('should create budget line for sold_auction action with matching budget item', () => {
            const budget = createMockBudgetState(['Light Mind Essence', 'Force Nexus'])
            const soldAction = createSoldAction('Light Mind Essence', 1000, 150.50)

            const results = inferBudgetLinesFromActions([soldAction], budget)

            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(soldAction)
            expect(result.budgetLine).toBeDefined()
            expect(result.budgetName).toBe('Light Mind Essence')
            
            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(soldAction.timestamp)
                expect(result.budgetLine.reason).toBe('Sold')
                expect(result.budgetLine.ped).toBe(150.50)
                expect(result.budgetLine.materials).toEqual([
                    { name: 'Light Mind Essence', quantity: -1000 }
                ])
            }
        })

        it('should return empty array when no matching budget item found', () => {
            const budget = createMockBudgetState(['Other Item'])
            const soldAction = createSoldAction('Light Mind Essence', 1000, 150.50)
            
            const results = inferBudgetLinesFromActions([soldAction], budget)

            expect(results).toHaveLength(0)
        })

        it('should handle multiple sold_auction actions in batch', () => {
            const budget = createMockBudgetState(['Light Mind Essence', 'Force Nexus'])
            const soldAction1 = createSoldAction('Light Mind Essence', 1000, 150.50, 1000)
            const soldAction2 = createSoldAction('Force Nexus', 500, 75.25, 2000)
            
            const results = inferBudgetLinesFromActions([soldAction1, soldAction2], budget)

            expect(results).toHaveLength(2)
            
            // First action
            const result1 = results[0]
            expect(result1.action).toEqual(soldAction1)
            expect(result1.budgetName).toBe('Light Mind Essence')
            expect(result1.budgetLine?.ped).toBe(150.50)
            
            // Second action
            const result2 = results[1]
            expect(result2.action).toEqual(soldAction2)
            expect(result2.budgetName).toBe('Force Nexus')
            expect(result2.budgetLine?.ped).toBe(75.25)
        })

        it('should create budget line for bought_auction action with matching budget item', () => {
            const budget = createMockBudgetState(['Mind Essence', 'Force Nexus'])
            const boughtAction = createBoughtAction('Mind Essence', 1001052, 1.43)
            
            const results = inferBudgetLinesFromActions([boughtAction], budget)

            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(boughtAction)
            expect(result.budgetLine).toBeDefined()
            expect(result.budgetName).toBe('Mind Essence')
            
            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(boughtAction.timestamp)
                expect(result.budgetLine.reason).toBe('Buy')
                expect(result.budgetLine.ped).toBe(-1.43) // negative value for cost
                expect(result.budgetLine.materials).toEqual([
                    { name: 'Mind Essence', quantity: 1001052 } // positive quantity for acquisition
                ])
            }
        })

        it('should create budget line for bought_auction action when item is a material used by budget item', () => {
            const budget = createMockBudgetState(
                ['Light Mind Essence'],
                [{ name: 'Force Nexus', usedBy: 'Light Mind Essence' }]
            )
            const boughtAction = createBoughtAction('Force Nexus', 20014, 204.00)
            
            const results = inferBudgetLinesFromActions([boughtAction], budget)

            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(boughtAction)
            expect(result.budgetLine).toBeDefined()
            expect(result.budgetName).toBe('Light Mind Essence') // Should associate with Light Mind Essence
            
            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(boughtAction.timestamp)
                expect(result.budgetLine.reason).toBe('Buy')
                expect(result.budgetLine.ped).toBe(-204.00) // negative value for cost
                expect(result.budgetLine.materials).toEqual([
                    { name: 'Force Nexus', quantity: 20014 } // positive quantity for acquisition
                ])
            }
        })

        it('should return empty array when bought_auction has no matching budget item or material', () => {
            const budget = createMockBudgetState(['Other Item'])
            const boughtAction = createBoughtAction('Force Nexus', 20014, 204.00)
            
            const results = inferBudgetLinesFromActions([boughtAction], budget)

            expect(results).toHaveLength(0)
        })

        it('should handle mixed sold_auction and bought_auction actions', () => {
            const budget = createMockBudgetState(
                ['Mind Essence', 'Force Nexus'],
                [{ name: 'Diluted Sweat', usedBy: 'Mind Essence' }]
            )
            const soldAction = createSoldAction('Mind Essence', 1000, 150.50)
            const boughtAction = createBoughtAction('Diluted Sweat', 4918, 49.18)
            
            const results = inferBudgetLinesFromActions([soldAction, boughtAction], budget)

            expect(results).toHaveLength(2)
            
            // Sold action - should have 'Sold' reason, positive PED, negative quantity
            const soldResult = results.find(r => r.action.type === 'sold_auction')
            expect(soldResult?.budgetLine?.reason).toBe('Sold')
            expect(soldResult?.budgetLine?.ped).toBe(150.50)
            expect(soldResult?.budgetLine?.materials).toEqual([
                { name: 'Mind Essence', quantity: -1000 }
            ])
            
            // Bought action - should have 'Buy' reason, negative PED, positive quantity
            const boughtResult = results.find(r => r.action.type === 'bought_auction')
            expect(boughtResult?.budgetLine?.reason).toBe('Buy')
            expect(boughtResult?.budgetLine?.ped).toBe(-49.18)
            expect(boughtResult?.budgetLine?.materials).toEqual([
                { name: 'Diluted Sweat', quantity: 4918 }
            ])
            expect(boughtResult?.budgetName).toBe('Mind Essence') // Should associate with Mind Essence
        })

        it('should handle empty actions array', () => {
            const budget = createMockBudgetState(['Test Item'])
            
            const results = inferBudgetLinesFromActions([], budget)

            expect(results).toHaveLength(0)
        })

        it('should handle empty budget items list', () => {
            const budget = createMockBudgetState([])
            const soldAction = createSoldAction('Light Mind Essence', 1000, 150.50)
            
            const results = inferBudgetLinesFromActions([soldAction], budget)

            expect(results).toHaveLength(0)
        })

        it('should preserve original action objects without modification', () => {
            const budget = createMockBudgetState(['Test Item'])
            const originalAction = createSoldAction('Test Item', 1000, 150.50)
            const actionCopy = JSON.parse(JSON.stringify(originalAction))
            
            const results = inferBudgetLinesFromActions([originalAction], budget)

            expect(results[0].action).toBe(originalAction)
            expect(originalAction).toEqual(actionCopy) // Ensure original wasn't modified
        })

        it('should create budget line for listed_auction action with 7 items and 1.19 PED fee', () => {
            // Arrange
            const budget = createMockBudgetState(['T3 Weapon Economy Enhancer'])
            const listedAction = createListedAction('T3 Weapon Economy Enhancer', 7, 1.19, 123456789)

            // Act
            const results = inferBudgetLinesFromActions([listedAction], budget)

            // Assert
            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(listedAction)
            expect(result.budgetName).toBe('T3 Weapon Economy Enhancer')
            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(123456789)
                expect(result.budgetLine.reason).toBe('Listed')
                expect(result.budgetLine.ped).toBe(-1.19)
                expect(result.budgetLine.materials).toEqual([
                    { name: 'T3 Weapon Economy Enhancer', quantity: -7 }
                ])
            }
        })
    })
})
