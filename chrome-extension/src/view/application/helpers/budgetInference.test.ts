import { describe, it, expect, beforeEach } from "@jest/globals"
import { inferBudgetLinesFromActions, BudgetInferenceResult } from './budgetInference'
import { StoredAction, ActivityItem } from '../state/activity'
import { BudgetState } from '../state/budget'

describe('budgetInference', () => {
    describe('inferBudgetLinesFromActions', () => {
        let nextInventoryId = 0

        beforeEach(() => {
            nextInventoryId = 0
        })

        const createMockBudgetState = (itemNames: string[], materials: { name: string; usedBy: string }[] = []) => {
            const budgetState: BudgetState = {
                stage: 0,
                loadPercentage: 0,
                materials: {
                    disabled: {},
                    map: {}
                },
                list: {
                    disabled: [],
                    items: itemNames.map(name => ({
                        name,
                        totalMU: 0,
                        total: 0,
                        peds: 0,
                        url: `http://example.com/${name}`
                    }))
                },
                groups: { list: [], ungroupedExpanded: false }
            }

            for (const material of materials) {
                budgetState.materials.map[material.name] = {
                    sheetName: material.name,
                    expanded: false,
                    unitValue: 0,
                    markup: 1,
                    budgetList: [{ itemName: material.usedBy, quantity: 0 }],
                }
            }

            return budgetState
        }

        const createInventoryItem = (name: string, quantity: number, value: number, timestamp: number = Date.now()): ActivityItem => ({
            id: nextInventoryId++,
            name,
            quantity,
            value,
            container: 'Inventory',
            timestamp,
            source: 'inventory'
        })

        const createSoldAction = (item: string, amount: number, value: number, timestamp: number = Date.now()): { action: StoredAction; inventoryItems: ActivityItem[] } => {
            const soldItem = createInventoryItem(item, amount, 0, timestamp)
            const paymentItem = createInventoryItem('PED', value, value, timestamp)

            return {
                action: {
                    id: `action-${Math.random()}`,
                    type: 'sold_auction',
                    sources: ['inventory'],
                    relatedItems: { item: soldItem.id, payment: paymentItem.id }
                },
                inventoryItems: [soldItem, paymentItem]
            }
        }

        const createBoughtAction = (item: string, amount: number, value: number, timestamp: number = Date.now()): { action: StoredAction; inventoryItems: ActivityItem[] } => {
            const boughtItem = createInventoryItem(item, amount, 0, timestamp)
            const paymentItem = createInventoryItem('PED', value, value, timestamp)

            return {
                action: {
                    id: `action-${Math.random()}`,
                    type: 'bought_auction',
                    sources: ['inventory'],
                    relatedItems: { item: boughtItem.id, payment: paymentItem.id }
                },
                inventoryItems: [boughtItem, paymentItem]
            }
        }

        const createListedAction = (item: string, amount: number, value: number, timestamp: number = Date.now()): { action: StoredAction; inventoryItems: ActivityItem[] } => {
            const listedItem = createInventoryItem(item, amount, 0, timestamp)
            const feeItem = createInventoryItem('PED', value, value, timestamp)

            return {
                action: {
                    id: `action-${Math.random()}`,
                    type: 'listed_auction',
                    sources: ['inventory'],
                    relatedItems: { item: listedItem.id, fee: feeItem.id }
                },
                inventoryItems: [listedItem, feeItem]
            }
        }

        const createRefineAction = (item: string, amount: number, relatedItems: { name: string; quantity: number }[], timestamp: number = Date.now()): { action: StoredAction; inventoryItems: ActivityItem[] } => {
            const producedItem = createInventoryItem(item, amount, 0, timestamp)
            const consumedItems = relatedItems.map(r => createInventoryItem(r.name, Math.abs(r.quantity), 0, timestamp))

            return {
                action: {
                    id: `action-${Math.random()}`,
                    type: 'refine',
                    sources: ['inventory'],
                    relatedItems: { consumed: consumedItems.map(i => i.id), produced: producedItem.id }
                },
                inventoryItems: [producedItem, ...consumedItems]
            }
        }

        const createCraftAction = (item: string, amount: number, relatedItems: { name: string; quantity: number }[], timestamp: number = Date.now()): { action: StoredAction; inventoryItems: ActivityItem[] } => {
            const producedItem = createInventoryItem(item, amount, 0, timestamp)
            const consumedItems = relatedItems.map(r => createInventoryItem(r.name, r.quantity, 0, timestamp))

            return {
                action: {
                    id: `action-${Math.random()}`,
                    type: 'craft',
                    sources: ['inventory'],
                    relatedItems: { consumed: consumedItems.map(i => i.id), produced: [producedItem.id] }
                },
                inventoryItems: [producedItem, ...consumedItems]
            }
        }

        it('should create budget line for sold_auction action with matching budget item', () => {
            const budget = createMockBudgetState(['Light Mind Essence', 'Force Nexus'])
            const { action: soldAction, inventoryItems } = createSoldAction('Light Mind Essence', 1000, 150.50)
            const expectedTimestamp = Math.max(...inventoryItems.map(i => i.timestamp))

            const results = inferBudgetLinesFromActions([soldAction], budget, inventoryItems)

            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(soldAction)
            expect(result.budgetLine).toBeDefined()
            expect(result.budgetName).toBe('Light Mind Essence')

            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(expectedTimestamp)
                expect(result.budgetLine.reason).toBe('Sold')
                expect(result.budgetLine.ped).toBe(150.50)
                expect(result.budgetLine.materials).toEqual([
                    { name: 'Light Mind Essence', quantity: -1000 }
                ])
            }
        })

        it('should return empty array when no matching budget item found', () => {
            const budget = createMockBudgetState(['Other Item'])
            const { action: soldAction, inventoryItems } = createSoldAction('Light Mind Essence', 1000, 150.50)

            const results = inferBudgetLinesFromActions([soldAction], budget, inventoryItems)

            expect(results).toHaveLength(0)
        })

        it('should handle multiple sold_auction actions in batch', () => {
            const budget = createMockBudgetState(['Light Mind Essence', 'Force Nexus'])
            const sold1 = createSoldAction('Light Mind Essence', 1000, 150.50, 1000)
            const sold2 = createSoldAction('Force Nexus', 500, 75.25, 2000)
            const allInventoryItems = [...sold1.inventoryItems, ...sold2.inventoryItems]

            const results = inferBudgetLinesFromActions([sold1.action, sold2.action], budget, allInventoryItems)

            expect(results).toHaveLength(2)

            // First action
            const result1 = results[0]
            expect(result1.action).toEqual(sold1.action)
            expect(result1.budgetName).toBe('Light Mind Essence')
            expect(result1.budgetLine?.ped).toBe(150.50)

            // Second action
            const result2 = results[1]
            expect(result2.action).toEqual(sold2.action)
            expect(result2.budgetName).toBe('Force Nexus')
            expect(result2.budgetLine?.ped).toBe(75.25)
        })

        it('should create budget line for bought_auction action with matching budget item', () => {
            const budget = createMockBudgetState(['Mind Essence', 'Force Nexus'])
            const { action: boughtAction, inventoryItems } = createBoughtAction('Mind Essence', 1001052, 1.43)
            const expectedTimestamp = Math.max(...inventoryItems.map(i => i.timestamp))

            const results = inferBudgetLinesFromActions([boughtAction], budget, inventoryItems)

            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(boughtAction)
            expect(result.budgetLine).toBeDefined()
            expect(result.budgetName).toBe('Mind Essence')

            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(expectedTimestamp)
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
            const { action: boughtAction, inventoryItems } = createBoughtAction('Force Nexus', 20014, 204.00)
            const expectedTimestamp = Math.max(...inventoryItems.map(i => i.timestamp))

            const results = inferBudgetLinesFromActions([boughtAction], budget, inventoryItems)

            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(boughtAction)
            expect(result.budgetLine).toBeDefined()
            expect(result.budgetName).toBe('Light Mind Essence') // Should associate with Light Mind Essence

            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(expectedTimestamp)
                expect(result.budgetLine.reason).toBe('Buy')
                expect(result.budgetLine.ped).toBe(-204.00) // negative value for cost
                expect(result.budgetLine.materials).toEqual([
                    { name: 'Force Nexus', quantity: 20014 } // positive quantity for acquisition
                ])
            }
        })

        it('should return empty array when bought_auction has no matching budget item or material', () => {
            const budget = createMockBudgetState(['Other Item'])
            const { action: boughtAction, inventoryItems } = createBoughtAction('Force Nexus', 20014, 204.00)

            const results = inferBudgetLinesFromActions([boughtAction], budget, inventoryItems)

            expect(results).toHaveLength(0)
        })

        it('should handle mixed sold_auction and bought_auction actions', () => {
            const budget = createMockBudgetState(
                ['Mind Essence', 'Force Nexus'],
                [{ name: 'Diluted Sweat', usedBy: 'Mind Essence' }]
            )
            const sold = createSoldAction('Mind Essence', 1000, 150.50)
            const bought = createBoughtAction('Diluted Sweat', 4918, 49.18)
            const allInventoryItems = [...sold.inventoryItems, ...bought.inventoryItems]

            const results = inferBudgetLinesFromActions([sold.action, bought.action], budget, allInventoryItems)

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

            const results = inferBudgetLinesFromActions([], budget, [])

            expect(results).toHaveLength(0)
        })

        it('should handle empty budget items list', () => {
            const budget = createMockBudgetState([])
            const { action: soldAction, inventoryItems } = createSoldAction('Light Mind Essence', 1000, 150.50)

            const results = inferBudgetLinesFromActions([soldAction], budget, inventoryItems)

            expect(results).toHaveLength(0)
        })

        it('should preserve original action objects without modification', () => {
            const budget = createMockBudgetState(['Test Item'])
            const { action: originalAction, inventoryItems } = createSoldAction('Test Item', 1000, 150.50)
            const actionCopy = JSON.parse(JSON.stringify(originalAction))

            const results = inferBudgetLinesFromActions([originalAction], budget, inventoryItems)

            expect(results[0].action).toBe(originalAction)
            expect(originalAction).toEqual(actionCopy) // Ensure original wasn't modified
        })

        it('should create budget line for listed_auction action with 7 items and 1.19 PED fee', () => {
            // Arrange
            const budget = createMockBudgetState(['T3 Weapon Economy Enhancer'])
            const { action: listedAction, inventoryItems } = createListedAction('T3 Weapon Economy Enhancer', 7, 1.19, 123456789)

            // Act
            const results = inferBudgetLinesFromActions([listedAction], budget, inventoryItems)

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

        it('should create budget line for refine action with materials', () => {
            // Arrange
            const budget = createMockBudgetState(['Mind Essence'])
            const { action: refineAction, inventoryItems } = createRefineAction('Mind Essence', 1001000, [
                { name: 'Force Nexus', quantity: -10000 },
                { name: 'Vibrant Sweat', quantity: -10000 }
            ], 1700000000000)

            // Act
            const results = inferBudgetLinesFromActions([refineAction], budget, inventoryItems)

            // Assert
            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(refineAction)
            expect(result.budgetName).toBe('Mind Essence')
            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(1700000000000)
                expect(result.budgetLine.reason).toBe('Refine')
                expect(result.budgetLine.ped).toBe(-1.5)
                expect(result.budgetLine.materials).toEqual([
                    { name: 'Mind Essence', quantity: 1001000 },
                    { name: 'Force Nexus', quantity: -10000 },
                    { name: 'Vibrant Sweat', quantity: -10000 }
                ])
            }
        })

        it('should create budget line for craft action with materials', () => {
            // Arrange
            const budget = createMockBudgetState(['T5 Weapon Economy Enhancer'])
            const { action: craftAction, inventoryItems } = createCraftAction('T5 Weapon Economy Enhancer', 8, [
                { name: 'Dianthus Crystal Powder', quantity: 14 },
                { name: 'Energy Matter Residue', quantity: 310 },
                { name: 'Material Efficiency Component', quantity: 2 },
                { name: 'Metal Residue', quantity: 1371 },
                { name: 'Nova Fragment', quantity: 40 },
                { name: 'Shrapnel', quantity: 819 },
                { name: 'Socket 5 Component', quantity: 7 }
            ], 1700000000000)

            // Act
            const results = inferBudgetLinesFromActions([craftAction], budget, inventoryItems)

            // Assert
            expect(results).toHaveLength(1)
            const result = results[0]
            expect(result.action).toEqual(craftAction)
            expect(result.budgetName).toBe('T5 Weapon Economy Enhancer')
            if (result.budgetLine) {
                expect(result.budgetLine.date).toBe(1700000000000)
                expect(result.budgetLine.reason).toBe('Craft')
                expect(result.budgetLine.ped).toBe(0)
                expect(result.budgetLine.materials).toEqual([
                    { name: 'T5 Weapon Economy Enhancer', quantity: 8 },
                    { name: 'Dianthus Crystal Powder', quantity: -14 },
                    { name: 'Energy Matter Residue', quantity: -310 },
                    { name: 'Material Efficiency Component', quantity: -2 },
                    { name: 'Metal Residue', quantity: -1371 },
                    { name: 'Nova Fragment', quantity: -40 },
                    { name: 'Shrapnel', quantity: -819 },
                    { name: 'Socket 5 Component', quantity: -7 }
                ])
            }
        })
    })
})
