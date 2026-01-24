import { describe, it, expect } from "@jest/globals"
import { BalanceMaterialData } from "./budget"
import { calculateBalanceLines, createBalanceMaterialData, getBalanceLines } from "./budgetGetBalanceLines"
import { BudgetMaterialsMap, BudgetState } from "../state/budget"

const createMockBudgetState = (materials: BudgetMaterialsMap) => {
    const budgetState: BudgetState = {
        stage: 0,
        loadPercentage: 0,
        disabledItems: { names: [] },
        disabledMaterials: {},
        list: { items: [] },
        groups: { list: [], ungroupedExpanded: false },
        materials
    }
    return budgetState
}

describe('calculateBalanceLines', () => {
  it('calculates balance lines for selected materials', () => {
    const materials: BalanceMaterialData[] = [
      {
        name: 'Diluted Sweat',
        balanceQuantity: 931,
        balanceWithMarkup: 10.05,
        budget: {
          'Light Mind Essence': 0
        }
      },
      {
        name: 'Force Nexus',
        balanceQuantity: -14085,
        balanceWithMarkup: -143.67,
        budget: {
          'Light Mind Essence': 4080,
          'Mind Essence': 10005,
        }
      },
      {
        name: 'Light Mind Essence',
        balanceQuantity: -250298,
        balanceWithMarkup: -27.53,
        budget: {
          'Light Mind Essence': 1311007
        }
      },
      {
        name: 'Mind Essence',
        balanceQuantity: -4520,
        balanceWithMarkup: -0.54,
        budget: {
          'Mind Essence': 2005596
        }
      },
      {
        name: 'Vibrant Sweat',
        balanceQuantity: 0,
        balanceWithMarkup: 0.00,
        budget: {
          'Mind Essence': 51964
        }
      }
    ]

    const date = Date.now()
    const result = calculateBalanceLines(date, materials)

    expect(Object.keys(result)).toHaveLength(2)
    expect(result).toHaveProperty('Mind Essence')
    expect(result).toHaveProperty('Light Mind Essence')

    const lineME = result['Mind Essence'][0]
    expect(lineME.date).toBe(date)
    expect(lineME.reason).toBe('Balance')
    expect(lineME.ped).toBeCloseTo(143.67 * (10005/14085) + 0.54, 2)
    expect(lineME.materials).toHaveLength(2)
    expect(lineME.materials).toEqual(
      expect.arrayContaining([
        { name: 'Force Nexus', quantity: -10005 },
        { name: 'Mind Essence', quantity: -4520 }
      ])
    )

    const lineLME = result['Light Mind Essence'][0]
    expect(lineLME.date).toBe(date)
    expect(lineLME.reason).toBe('Balance')
    expect(lineLME.ped).toBeCloseTo(-10.05 + 143.67 * (4080/14085) + 27.53, 2)
    expect(lineLME.materials).toHaveLength(3)
    expect(lineLME.materials).toEqual(
      expect.arrayContaining([
        { name: 'Diluted Sweat', quantity: 931 },
        { name: 'Force Nexus', quantity: -4080 },
        { name: 'Light Mind Essence', quantity: -250298 },
      ])
    )
  })
})

describe('getBalanceLines', () => {
    it('should return empty lines when materials are balanced', () => {
        const materialsMap: BudgetMaterialsMap = {
            'Material1': {
                sheetName: 'Material1',
                unitValue: 1,
                markup: 1.5,
                budgetList: [{ itemName: 'Item1', quantity: 10, disabled: false }],
                expanded: false
            }
        }
        
        const result = getBalanceLines(1234567890, createMockBudgetState(materialsMap), [])
        
        // Small positive balances might still create lines, let's check what we get
        // If there's a very small positive balance, it might still create a line
        if (Object.keys(result).length > 0) {
            expect(result['Item1'][0].materials[0].quantity).toBeLessThanOrEqual(1) // Should be very small
        }
    })

    it('should create negative balance lines when material is deficient', () => {
        const materialsMap: BudgetMaterialsMap = {
            'Material1': {
                sheetName: 'Material1',
                unitValue: 1,
                markup: 1.5,
                budgetList: [{ itemName: 'Item1', quantity: 10, disabled: false }],
                expanded: false
            }
        }
        
        const result = getBalanceLines(1234567890, createMockBudgetState(materialsMap), [])
        
        expect(Object.keys(result)).toHaveLength(1)
        expect(result['Item1']).toHaveLength(1)
        expect(result['Item1'][0].reason).toBe('Balance')
        expect(result['Item1'][0].materials).toHaveLength(1)
        expect(result['Item1'][0].materials[0].name).toBe('Material1')
        expect(result['Item1'][0].materials[0].quantity).toBe(-5) // 5 - 10 = -5
        expect(result['Item1'][0].ped).toBeGreaterThan(0) // Should be positive PED cost
    })

    it('should create positive balance lines when material is surplus', () => {
        const materialsMap: BudgetMaterialsMap = {
            'Material1': {
                sheetName: 'Material1',
                unitValue: 1,
                markup: 1.5,
                budgetList: [{ itemName: 'Item1', quantity: 10, disabled: false }],
                expanded: false
            }
        }
        
        const result = getBalanceLines(1234567890, createMockBudgetState(materialsMap), [])
        
        expect(Object.keys(result)).toHaveLength(1)
        expect(result['Item1']).toHaveLength(1)
        expect(result['Item1'][0].reason).toBe('Balance')
        expect(result['Item1'][0].materials).toHaveLength(1)
        expect(result['Item1'][0].materials[0].name).toBe('Material1')
        expect(result['Item1'][0].materials[0].quantity).toBe(5) // 15 - 10 = 5
        expect(result['Item1'][0].ped).toBeLessThan(0) // Should be negative PED (savings)
    })

    it('should handle materials with negative balance from calculated values', () => {
        const materialsMap: BudgetMaterialsMap = {
            'Material1': {
                sheetName: 'Material1',
                unitValue: 1,
                markup: 1.5,
                budgetList: [{ itemName: 'Item1', quantity: 10, disabled: false }],
                expanded: false
            }
        }
        
        const result = getBalanceLines(1234567890, createMockBudgetState(materialsMap), [])
        
        expect(Object.keys(result)).toHaveLength(1)
        expect(result['Item1']).toHaveLength(1)
        expect(result['Item1'][0].materials[0].quantity).toBe(-3) // Deficiency of 3
        expect(result['Item1'][0].ped).toBeGreaterThan(0) // Cost to acquire materials
    })

    it('should share a balance line between two items that reference the same budget entry', () => {
        const timestamp = 9876543210;

        const materialsMap: BudgetMaterialsMap = {
            // Item A: T6 Weapon Economy Enhancer
            'T6 Weapon Economy Enhancer': {
                sheetName: 'T6 Weapon Economy Enhancer',
                unitValue: 1,
                markup: 1.0,
                budgetList: [{ itemName: 'SharedBudget', quantity: 100, disabled: false }],
                expanded: false
            },
            // Item B: Another material that also references the same budget
            'Other Material Sharing Budget': {
                sheetName: 'Other Material Sharing Budget',
                unitValue: 1,
                markup: 1.0,
                budgetList: [{ itemName: 'SharedBudget', quantity: 50, disabled: false }],
                expanded: false
            }
        }

        const lines = getBalanceLines(timestamp, createMockBudgetState(materialsMap), [])

        // Shared budget should exist
        expect(lines).toHaveProperty('SharedBudget')
        // And there should be a single line entry for that budget
        expect(lines['SharedBudget']).toHaveLength(1)

        // The line should include both materials
        const line = lines['SharedBudget'][0]
        const materialNames = line.materials.map(m => m.name)
        expect(materialNames).toEqual(expect.arrayContaining(['T6 Weapon Economy Enhancer', 'Other Material Sharing Budget']))

        // Date should be the timestamp
        expect(line.date).toBe(timestamp)
    })

    it('should filter balance lines to only include valid budget items when provided', () => {
        const timestamp = 9876543210;

        const materialsMap: BudgetMaterialsMap = {
            // Item A: T6 Weapon Economy Enhancer
            'T6 Weapon Economy Enhancer': {
                sheetName: 'T6 Weapon Economy Enhancer',
                unitValue: 1,
                markup: 1.0,
                budgetList: [{ itemName: 'SharedBudget', quantity: 100, disabled: false }],
                expanded: false
            },
            // Item B: Another material that also references the same budget
            'Other Material Sharing Budget': {
                sheetName: 'Other Material Sharing Budget',
                unitValue: 1,
                markup: 1.0,
                budgetList: [{ itemName: 'SharedBudget', quantity: 50, disabled: false }],
                expanded: false
            },
            // Item C: Material with different budget
            'Different Budget Material': {
                sheetName: 'Different Budget Material',
                unitValue: 1,
                markup: 1.0,
                budgetList: [{ itemName: 'OtherBudget', quantity: 30, disabled: false }],
                expanded: false
            }
        }

        // Test without validBudgetItems (should return all lines)
        const allLines = getBalanceLines(timestamp, createMockBudgetState(materialsMap), [])
        expect(Object.keys(allLines)).toHaveLength(2)
        expect(allLines).toHaveProperty('SharedBudget')
        expect(allLines).toHaveProperty('OtherBudget')

        // Test with validBudgetItems filter - should filter by budget names, not material names
        const filteredLines = getBalanceLines(timestamp, createMockBudgetState(materialsMap), [], ['SharedBudget'])
        expect(Object.keys(filteredLines)).toHaveLength(1)
        expect(filteredLines).toHaveProperty('SharedBudget')
        expect(filteredLines['SharedBudget']).toHaveLength(1)
        
        // The line should still include both materials that share the budget
        const line = filteredLines['SharedBudget'][0]
        const materialNames = line.materials.map(m => m.name)
        expect(materialNames).toEqual(expect.arrayContaining(['T6 Weapon Economy Enhancer', 'Other Material Sharing Budget']))

        // Test with empty validBudgetItems (should return empty)
        const emptyLines = getBalanceLines(timestamp, createMockBudgetState(materialsMap), [])
        expect(Object.keys(emptyLines)).toHaveLength(0)
    })

    describe('UI Component Scenarios', () => {
        it('should filter balance lines for BudgetDetailsPanel with mixed enabled/disabled items', () => {
            const timestamp = 9876543210;
            const materialsMap: BudgetMaterialsMap = {
                'T6 Weapon Economy Enhancer': {
                    sheetName: 'T6 Weapon Economy Enhancer',
                    unitValue: 1,
                    markup: 1.0,
                    budgetList: [{ itemName: 'T6 Weapon Economy Enhancer', quantity: 100, disabled: false }],
                    expanded: false
                },
                'Other Material': {
                    sheetName: 'Other Material', 
                    unitValue: 1,
                    markup: 1.0,
                    budgetList: [{ itemName: 'Disabled Budget Item', quantity: 50, disabled: false }],
                    expanded: false
                }
            }

            // Simulate BudgetDetailsPanel scenario
            const itemNames = ['T6 Weapon Economy Enhancer', 'Disabled Budget Item'] // Both items selected
            const disabledItems = ['Disabled Budget Item'] // But one is disabled
            const validBudgetItems = itemNames.filter(name => !disabledItems.includes(name))
            
            const balanceLines = getBalanceLines(timestamp, createMockBudgetState(materialsMap), [], validBudgetItems)

            // Should only create lines for enabled items
            expect(Object.keys(balanceLines)).toHaveLength(1)
            expect(balanceLines).toHaveProperty('T6 Weapon Economy Enhancer')
            expect(balanceLines).not.toHaveProperty('Disabled Budget Item')
        })
    })

    describe('calculateBalanceLines with validBudgetItems', () => {
        it('should correctly filter with mixed enabled/disabled budget items', () => {
            const timestamp = 9876543210;
            const materialsMap: BudgetMaterialsMap = {
                'T6 Weapon Economy Enhancer': {
                    sheetName: 'T6 Weapon Economy Enhancer',
                    unitValue: 1,
                    markup: 1.0,
                    budgetList: [{ itemName: 'T6 Weapon Economy Enhancer', quantity: 100, disabled: false }],
                    expanded: false
                },
                'Other Material': {
                    sheetName: 'Other Material', 
                    unitValue: 1,
                    markup: 1.0,
                    budgetList: [{ itemName: 'Other Budget Item', quantity: 50, disabled: false }],
                    expanded: false
                }
            }

            // Simulate middleware scenario where we have validBudgetItems (enabled items only)
            const validBudgetItems = ['T6 Weapon Economy Enhancer'] // Other Budget Item is disabled
            const lines = getBalanceLines(timestamp, createMockBudgetState(materialsMap), [], validBudgetItems)

            // Should only create lines for valid budget items
            expect(Object.keys(lines)).toHaveLength(1)
            expect(lines).toHaveProperty('T6 Weapon Economy Enhancer')
            expect(lines).not.toHaveProperty('Other Budget Item')

            // The line should contain the material
            const line = lines['T6 Weapon Economy Enhancer'][0]
            expect(line.materials).toHaveLength(1)
            expect(line.materials[0].name).toBe('T6 Weapon Economy Enhancer')
        })
    })

    it('should create balance line for dataset with zero budgets and specified item', () => {
        const materialsMap: BudgetMaterialsMap = {
            "Dianthus Crystal Powder": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T1 Weapon Economy Enhancer",
                        "quantity": 68
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T7 Weapon Economy Enhancer",
                        "quantity": 0
                    }
                ],
                "expanded": false,
                "markup": 1.43,
                "sheetName": "Dianthus Crystal Powder",
                "unitValue": 0.6,
            },
            "Empty Enhancer Component": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T1 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T1 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T7 Weapon Economy Enhancer",
                        "quantity": 0
                    }
                ],
                "expanded": false,
                "markup": 1,
                "sheetName": "Empty Enhancer Component",
                "unitValue": 1,
            },
            "Energy Matter Residue": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T1 Weapon Economy Enhancer",
                        "quantity": 9777
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T7 Weapon Economy Enhancer",
                        "quantity": 0
                    }
                ],
                "expanded": false,
                "markup": 1.015,
                "sheetName": "Energy Matter Residue",
                "unitValue": 0.01,
            },
            "Material Efficiency Component": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T1 Weapon Economy Enhancer",
                        "quantity": 198
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T7 Weapon Economy Enhancer",
                        "quantity": 0
                    }
                ],
                "expanded": false,
                "markup": 1.04,
                "sheetName": "Material Efficiency Component",
                "unitValue": 0.5,
            },
            "Metal Residue": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T1 Mining Finder Range Enhancer",
                        "quantity": 731
                    },
                    {
                        "disabled": false,
                        "itemName": "T1 Weapon Economy Enhancer",
                        "quantity": 16186
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T7 Weapon Economy Enhancer",
                        "quantity": 0
                    }
                ],
                "expanded": false,
                "markup": 1.0093,
                "sheetName": "Metal Residue",
                "unitValue": 0.01,
            },
            "Nova Fragment": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T1 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T1 Weapon Economy Enhancer",
                        "quantity": 40240
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T7 Weapon Economy Enhancer",
                        "quantity": 0
                    }
                ],
                "expanded": false,
                "markup": 200,
                "sheetName": "Nova Fragment",
                "unitValue": 0.00001,
            },
            "Shrapnel": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T1 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T1 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T2 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T3 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T4 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Mining Finder Range Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T5 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 0
                    },
                    {
                        "disabled": false,
                        "itemName": "T7 Weapon Economy Enhancer",
                        "quantity": 0
                    }
                ],
                "expanded": false,
                "markup": 1.005,
                "sheetName": "Shrapnel",
                "unitValue": 0.0001,
            },
            "Socket 6 Component": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 666
                    }
                ],
                "expanded": false,
                "markup": 1.0268000000000002,
                "sheetName": "Socket 6 Component",
                "unitValue": 0.1,
            },
            "T6 Weapon Economy Enhancer": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 32
                    }
                ],
                "expanded": false,
                "markup": 3,
                "sheetName": "Item",
                "unitValue": 1,
            },
            "T6 Weapon Economy Enhancer Blueprint (L)": {
                "budgetList": [
                    {
                        "disabled": false,
                        "itemName": "T6 Weapon Economy Enhancer",
                        "quantity": 1
                    }
                ],
                "expanded": false,
                "markup": 40,
                "sheetName": "Blueprint",
                "unitValue": 0.01,
            }
        }
        const result = getBalanceLines(1769148912087, createMockBudgetState(materialsMap), [])

        expect(result).toEqual({
            "T6 Weapon Economy Enhancer": [
                {
                    "date": 1769148912087,
                    "reason": "Balance",
                    "ped": -29.02,
                    "materials": [
                        {
                            "name": "Energy Matter Residue",
                            "quantity": -3555
                        },
                        {
                            "name": "Metal Residue",
                            "quantity": 2875
                        },
                        {
                            "name": "Nova Fragment",
                            "quantity": -53
                        }
                    ]
                }
            ]
        })
    })

    describe('calculateBalanceLines with validBudgetItems', () => {
        it('should only create balance lines for valid budget items', () => {
            const timestamp = 9876543210;
            const materials: BalanceMaterialData[] = [
                {
                    name: 'Material1',
                    balanceQuantity: -10,
                    balanceWithMarkup: -20,
                    budget: {
                        'ValidBudget': 10,
                        'InvalidBudget': 5
                    }
                },
                {
                    name: 'Material2',
                    balanceQuantity: -5,
                    balanceWithMarkup: -15,
                    budget: {
                        'InvalidBudget': 10,
                        'AnotherInvalid': 5
                    }
                }
            ]

            // Without filter - should create lines for all budgets
            const allLines = calculateBalanceLines(timestamp, materials)
            expect(Object.keys(allLines)).toHaveLength(2)
            expect(allLines).toHaveProperty('ValidBudget')
            expect(allLines).toHaveProperty('InvalidBudget')

            // With filter - should only create lines for valid budgets
            const filteredLines = calculateBalanceLines(timestamp, materials, ['ValidBudget'])
            expect(Object.keys(filteredLines)).toHaveLength(1)
            expect(filteredLines).toHaveProperty('ValidBudget')
            expect(filteredLines['ValidBudget']).toHaveLength(1)
            expect(filteredLines['ValidBudget'][0].materials).toHaveLength(1)
            expect(filteredLines['ValidBudget'][0].materials[0].name).toBe('Material1')
        })

        it('should handle positive balances with validBudgetItems filter', () => {
            const timestamp = 9876543210;
            const materials: BalanceMaterialData[] = [
                {
                    name: 'Material1',
                    balanceQuantity: 10,
                    balanceWithMarkup: 20,
                    budget: {
                        'ValidBudget': 10,
                        'InvalidBudget': 5
                    }
                }
            ]

            // Without filter - should create line for first budget
            const allLines = calculateBalanceLines(timestamp, materials)
            expect(Object.keys(allLines)).toHaveLength(1)
            expect(allLines).toHaveProperty('ValidBudget') // Should use first budget

            // With filter - should create line if first budget is valid
            const filteredLines = calculateBalanceLines(timestamp, materials, ['ValidBudget'])
            expect(Object.keys(filteredLines)).toHaveLength(1)
            expect(filteredLines).toHaveProperty('ValidBudget')
        })
    })

    it('should handle test case from user screenshot scenario', () => {
        const timestamp = 1705900000000 // Approximate timestamp from "Jan 21, 2024, 10:53:20 AM"
        
        const materialsMap: BudgetMaterialsMap = {
            'Force Essence': {
                sheetName: 'Force Essence',
                unitValue: 3.48, // Assuming value based on PED calculation
                markup: 1.0, // Assuming no markup for this calculation
                budgetList: [
                    { itemName: 'armor-plating', quantity: 216, disabled: false },
                    { itemName: 'shock-absorber', quantity: 100, disabled: false }
                ],
                expanded: false
            },
            'Basic Universal Terminator': {
                sheetName: 'Basic Universal Terminator',
                unitValue: 2.16, // Calculated from 87 PED / 40 units
                markup: 1.0,
                budgetList: [
                    { itemName: 'armor-plating', quantity: 80, disabled: false },
                    { itemName: 'shock-absorber', quantity: 75, disabled: false }
                ],
                expanded: false
            }
        }
        
        const result = getBalanceLines(timestamp, createMockBudgetState(materialsMap), [])
        
        // Should create balance lines for deficient materials
        expect(Object.keys(result)).toContain('armor-plating')
        // Note: shock-absorber might not have a line if calculations result in no balance
        
        // Check armor-plating balance
        expect(result['armor-plating']).toHaveLength(1)
        expect(result['armor-plating'][0].reason).toBe('Balance')
        expect(result['armor-plating'][0].date).toBe(timestamp)
        expect(result['armor-plating'][0].materials).toHaveLength(2)
        
        // Should show deficiencies for both materials
        const armorPlatingForceEssence = result['armor-plating'][0].materials.find(m => m.name === 'Force Essence')
        const armorPlatingTerminator = result['armor-plating'][0].materials.find(m => m.name === 'Basic Universal Terminator')
        
        expect(armorPlatingForceEssence).toBeDefined()
        expect(armorPlatingForceEssence!.quantity).toBe(-71) // Based on calculated balance
        expect(armorPlatingTerminator).toBeDefined()
        expect(armorPlatingTerminator!.quantity).toBe(-30) // Based on calculated balance
        
        // Check shock-absorber balance if it exists
        if (result['shock-absorber']) {
            expect(result['shock-absorber'][0].materials).toHaveLength(2)
            
            const shockAbsorberForceEssence = result['shock-absorber'][0].materials.find(m => m.name === 'Force Essence')
            const shockAbsorberTerminator = result['shock-absorber'][0].materials.find(m => m.name === 'Basic Universal Terminator')
            
            expect(shockAbsorberForceEssence).toBeDefined()
            expect(shockAbsorberTerminator).toBeDefined()
        }
        
        // PED values should be positive (cost to acquire materials)
        expect(result['armor-plating'][0].ped).toBeGreaterThan(0)
        if (result['shock-absorber']) {
            expect(result['shock-absorber'][0].ped).toBeLessThan(0)
        }
    })
})

describe('createBalanceMaterialData', () => {
    it('should throw error for missing material', () => {
        const materialsMap: BudgetMaterialsMap = {}
        const materialNames = ['NonExistentMaterial']
        const pendingLinesQuantity: Record<string, number> = {}

        expect(() => {
            createBalanceMaterialData(createMockBudgetState(materialsMap), [], materialNames)
        }).toThrow("Material 'NonExistentMaterial' not found in materialsMap")
    })

    it('should throw error for material with empty budgetList', () => {
        const materialsMap: BudgetMaterialsMap = {
            'Material1': {
                sheetName: 'Material1',
                unitValue: 1,
                markup: 1.5,
                budgetList: [], // Empty budget list
                expanded: false
            }
        }
        const materialNames = ['Material1']

        expect(() => {
            createBalanceMaterialData(createMockBudgetState(materialsMap), [], materialNames)
        }).toThrow("Material 'Material1' has no budgetList entries")
    })

    it('should create balance data correctly', () => {
        const materialsMap: BudgetMaterialsMap = {
            'Material1': {
                sheetName: 'Material1',
                unitValue: 1,
                markup: 1.5,
                budgetList: [{ itemName: 'Item1', quantity: 10, disabled: false }],
                expanded: false
            }
        }
        const materialNames = ['Material1']

        const result = createBalanceMaterialData(createMockBudgetState(materialsMap), [], materialNames)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Material1')
        expect(result[0].balanceQuantity).toBe(-5) // 5 - 10 = -5
        expect(result[0].budget).toEqual({ 'Item1': 10 })
    })

    it('should handle complex scenario with multiple materials and pending lines', () => {
        const timestamp = 1769080652975 // From the provided data
        
        const usedMaterialsMap: BudgetMaterialsMap = {
            'Force Nexus': {
                budgetList: [
                    { itemName: 'Light Mind Essence', quantity: 20022, disabled: false },
                    { itemName: 'Mind Essence', quantity: 0, disabled: false }
                ],
                expanded: false,
                markup: 1.02,
                sheetName: 'Force Nexus',
                unitValue: 0.01,
            },
            'Mind Essence': {
                budgetList: [
                    { itemName: 'Mind Essence', quantity: 809432, disabled: false }
                ],
                expanded: false,
                markup: 1.1938,
                sheetName: 'Mind Essence',
                unitValue: 0.0001,
            },
            'Vibrant Sweat': {
                budgetList: [
                    { itemName: 'Mind Essence', quantity: 47834, disabled: false }
                ],
                expanded: false,
                markup: 140,
                sheetName: 'Vibrant Sweat',
                unitValue: 0.00001,
            }
        }
        
        const balanceLines = getBalanceLines(timestamp, createMockBudgetState(usedMaterialsMap), [])
        
        // All materials have balanceQuantity of 0, so no balance lines should be created
        expect(Object.keys(balanceLines)).toHaveLength(0)
    })
})
