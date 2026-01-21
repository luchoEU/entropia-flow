import { calculateBalanceLines, BalanceMaterialData } from './budget'

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