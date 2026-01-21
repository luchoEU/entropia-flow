import { calculateBalanceLines, BalanceMaterialData, initialState, reduceDeleteBudgetPendingLine } from './budget'

describe('calculateBalanceLines', () => {
  it('calculates balance lines for selected materials', () => {
    const materials: BalanceMaterialData[] = [
      {
        sheetName: 'Diluted Sweat',
        balanceQuantity: 931,
        balanceWithMarkup: 10.05,
        budget: {
          'Light Mind Essence': 0
        }
      },
      {
        sheetName: 'Force Nexus',
        balanceQuantity: -14085,
        balanceWithMarkup: -143.67,
        budget: {
          'Light Mind Essence': 4080,
          'Mind Essence': 10005,
        }
      },
      {
        sheetName: 'Light Mind Essence',
        balanceQuantity: -250298,
        balanceWithMarkup: -27.53,
        budget: {
          'Light Mind Essence': 1311007
        }
      },
      {
        sheetName: 'Mind Essence',
        balanceQuantity: -4520,
        balanceWithMarkup: -0.54,
        budget: {
          'Mind Essence': 2005596
        }
      },
      {
        sheetName: 'Vibrant Sweat',
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

describe('reduceDeleteBudgetPendingLine', () => {
  it('should delete a specific pending line by index', () => {
    const testState = {
      ...initialState,
      list: {
        items: [
          {
            name: 'Test Item',
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://test.com',
            pendingLines: [
              { date: 1, reason: 'Line 1', ped: 10, materials: [] },
              { date: 2, reason: 'Line 2', ped: 20, materials: [] },
              { date: 3, reason: 'Line 3', ped: 30, materials: [] }
            ]
          },
          {
            name: 'Other Item',
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://other.com'
          }
        ]
      }
    }

    // Delete the middle line (index 1)
    const result = reduceDeleteBudgetPendingLine(testState, 'Test Item', 1)

    expect(result.list.items[0].pendingLines).toHaveLength(2)
    expect(result.list.items[0].pendingLines).toEqual([
      { date: 1, reason: 'Line 1', ped: 10, materials: [] },
      { date: 3, reason: 'Line 3', ped: 30, materials: [] }
    ])
    // Other item should be unchanged
    expect(result.list.items[1].pendingLines).toBeUndefined()
  })

  it('should clear pendingLines array when last line is deleted', () => {
    const testState = {
      ...initialState,
      list: {
        items: [
          {
            name: 'Test Item',
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://test.com',
            pendingLines: [
              { date: 1, reason: 'Only Line', ped: 10, materials: [] }
            ]
          }
        ]
      }
    }

    const result = reduceDeleteBudgetPendingLine(testState, 'Test Item', 0)

    expect(result.list.items[0].pendingLines).toBeUndefined()
  })

  it('should not modify state if item not found', () => {
    const testState = {
      ...initialState,
      list: {
        items: [
          {
            name: 'Test Item',
            totalMU: 0,
            total: 0,
            peds: 0,
            url: 'http://test.com'
          }
        ]
      }
    }

    const result = reduceDeleteBudgetPendingLine(testState, 'Nonexistent Item', 0)

    expect(result).toEqual(testState)
  })
})