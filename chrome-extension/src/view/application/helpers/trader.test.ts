import { ItemOwned } from '../state/inventory'
import { ItemsMap, UNIT_PERCENTAGE, UNIT_PLUS, UNIT_PED_K } from '../state/items'
import { ItemData } from '../../../common/state'
import { SORT_NAME_ASCENDING, SORT_VALUE_DESCENDING } from './inventory.sort'
import { joinDuplicates } from './inventory'
import {
    calcTraderStats,
    calcAuctionStats,
    calcTotalWithMarkup,
    filterByText,
    filterItemsByName,
    getMuValue,
    sortByMu,
    sortOwnedItems,
    groupByContainer,
    calcGroupTotal,
    getItemDetails,
} from './trader'

// ─── Test data factories ─────────────────────────────────────────────────────

function makeItemData(overrides: Partial<ItemData> = {}): ItemData {
    return {
        id: '1',
        n: 'Test Item',
        q: '10',
        v: '5.00',
        c: 'CARRIED',
        ...overrides,
    }
}

function makeItemOwned(dataOverrides: Partial<ItemData> = {}, hidden = false): ItemOwned {
    return {
        data: makeItemData(dataOverrides),
        c: {
            hidden: {
                any: hidden,
                name: hidden,
                container: false,
                value: false,
            }
        }
    }
}

// ─── calcTraderStats ─────────────────────────────────────────────────────────

describe('calcTraderStats', () => {
    it('should return zeros for empty list', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items: ItemOwned[] = []

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcTraderStats(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.totalValue).toBe(0)
        expect(result.hiddenCount).toBe(0)
    })

    it('should sum values and count hidden items', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ v: '10.00' }),
            makeItemOwned({ v: '5.50' }, true),
            makeItemOwned({ v: '3.25' }),
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcTraderStats(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.totalValue).toBeCloseTo(18.75)
        expect(result.hiddenCount).toBe(1)
    })

    it('should handle items with empty value as zero', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ v: '' }),
            makeItemOwned({ v: '10.00' }),
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcTraderStats(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.totalValue).toBeCloseTo(10.00)
    })
})

// ─── calcAuctionStats ──��─────────────────────────────────────────────────────

describe('calcAuctionStats', () => {
    it('should return zeros for empty list', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items: ItemData[] = []

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcAuctionStats(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.totalPed).toBe(0)
        expect(result.count).toBe(0)
    })

    it('should sum values and count items', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemData({ v: '100.00' }),
            makeItemData({ v: '50.50' }),
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcAuctionStats(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.totalPed).toBeCloseTo(150.50)
        expect(result.count).toBe(2)
    })
})

// ─── calcTotalWithMarkup ─────────────────────────────────────────────────────

describe('calcTotalWithMarkup', () => {
    it('should use plain value when no markup set', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ n: 'Ore A', v: '10.00' }),
            makeItemOwned({ n: 'Ore B', v: '5.00' }),
        ]
        const itemsMap: ItemsMap = {}

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcTotalWithMarkup(items, itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toBeCloseTo(15.00)
    })

    it('should apply percentage markup when set', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ n: 'Mind Essence', q: '100', v: '10.00' }),
        ]
        const itemsMap: ItemsMap = {
            'Mind Essence': {
                markup: { value: '120', unit: UNIT_PERCENTAGE },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcTotalWithMarkup(items, itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // 10.00 * 120 / 100 = 12.00
        expect(result).toBeCloseTo(12.00)
    })

    it('should mix markup and non-markup items', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ n: 'With MU', q: '100', v: '10.00' }),
            makeItemOwned({ n: 'No MU', q: '50', v: '5.00' }),
        ]
        const itemsMap: ItemsMap = {
            'With MU': {
                markup: { value: '200', unit: UNIT_PERCENTAGE },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcTotalWithMarkup(items, itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // 10.00 * 200/100 + 5.00 = 20.00 + 5.00 = 25.00
        expect(result).toBeCloseTo(25.00)
    })
})

// ─── filterByText ────────────────────────────────────────────────────────────

describe('filterByText', () => {
    const items = [
        { n: 'Light Mind Essence', c: 'CARRIED' },
        { n: 'Lysterium Ingot', c: 'AUCTION' },
        { n: 'Vibrant Sweat', c: 'CARRIED' },
    ]

    it('should return all items for empty filter', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = filterByText(items, '')

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toHaveLength(3)
    })

    it('should filter by name (case insensitive)', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = filterByText(items, 'lyst')

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toHaveLength(1)
        expect(result[0].n).toBe('Lysterium Ingot')
    })

    it('should filter by container', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = filterByText(items, 'auction')

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toHaveLength(1)
        expect(result[0].n).toBe('Lysterium Ingot')
    })

    it('should match across name and container', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = filterByText(items, 'carried')

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toHaveLength(2)
    })
})

// ─── filterItemsByName ───────────────────────────────────────────────────────

describe('filterItemsByName', () => {
    const items = [
        { n: 'Alpha' },
        { n: 'Beta' },
        { n: 'Gamma' },
    ]

    it('should return all items for empty filter', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = filterItemsByName(items, '')

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toHaveLength(3)
    })

    it('should filter by name case insensitively', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = filterItemsByName(items, 'BET')

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toHaveLength(1)
        expect(result[0].n).toBe('Beta')
    })
})

// ─── getMuValue ──────────────────────────────────────────────────────────────

describe('getMuValue', () => {
    it('should return null when no markup set', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {}

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getMuValue('Ore', '100', '10.00', itemsMap, 'total')

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toBeNull()
    })

    it('should return total value for total mode', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Ore': { markup: { value: '150', unit: UNIT_PERCENTAGE } }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getMuValue('Ore', '100', '10.00', itemsMap, 'total')

        // ============================================================================
        // ASSERT
        // ============================================================================
        // 10.00 * 150/100 = 15.00
        expect(result).toBeCloseTo(15.00)
    })

    it('should return markup difference for mu-ped mode', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Ore': { markup: { value: '150', unit: UNIT_PERCENTAGE } }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getMuValue('Ore', '100', '10.00', itemsMap, 'mu-ped')

        // ============================================================================
        // ASSERT
        // ============================================================================
        // (10.00 * 150/100) - 10.00 = 15.00 - 10.00 = 5.00
        expect(result).toBeCloseTo(5.00)
    })

    it('should handle plus unit', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Ore': { markup: { value: '0.5', unit: UNIT_PLUS } }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getMuValue('Ore', '100', '10.00', itemsMap, 'total')

        // ============================================================================
        // ASSERT
        // ============================================================================
        // 10.00 + 100 * 0.5 = 60.00
        expect(result).toBeCloseTo(60.00)
    })

    it('should handle /k unit', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Ore': { markup: { value: '2', unit: UNIT_PED_K } }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getMuValue('Ore', '1000', '10.00', itemsMap, 'total')

        // ============================================================================
        // ASSERT
        // ============================================================================
        // 1000 * 2 / 1000 = 2.00
        expect(result).toBeCloseTo(2.00)
    })
})

// ─── sortByMu ────────────────────────────────────────────────────────────────

describe('sortByMu', () => {
    it('should sort items with markup before items without', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            { n: 'No MU', q: '10', v: '5.00', c: '' },
            { n: 'Has MU', q: '10', v: '5.00', c: '' },
        ]
        const itemsMap: ItemsMap = {
            'Has MU': { markup: { value: '200', unit: UNIT_PERCENTAGE } }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = sortByMu(items, itemsMap, 'total', true)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result[0].n).toBe('Has MU')
        expect(result[1].n).toBe('No MU')
    })

    it('should sort descending by total value', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            { n: 'Low', q: '10', v: '5.00', c: '' },
            { n: 'High', q: '10', v: '10.00', c: '' },
        ]
        const itemsMap: ItemsMap = {
            'Low': { markup: { value: '100', unit: UNIT_PERCENTAGE } },
            'High': { markup: { value: '100', unit: UNIT_PERCENTAGE } },
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = sortByMu(items, itemsMap, 'total', true)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result[0].n).toBe('High')
        expect(result[1].n).toBe('Low')
    })

    it('should sort ascending when desc is false', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            { n: 'High', q: '10', v: '10.00', c: '' },
            { n: 'Low', q: '10', v: '5.00', c: '' },
        ]
        const itemsMap: ItemsMap = {
            'High': { markup: { value: '100', unit: UNIT_PERCENTAGE } },
            'Low': { markup: { value: '100', unit: UNIT_PERCENTAGE } },
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = sortByMu(items, itemsMap, 'total', false)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result[0].n).toBe('Low')
        expect(result[1].n).toBe('High')
    })

    it('should not mutate the original array', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            { n: 'B', q: '10', v: '10.00', c: '' },
            { n: 'A', q: '10', v: '5.00', c: '' },
        ]
        const original = [...items]

        // ============================================================================
        // ACT
        // ============================================================================
        sortByMu(items, {}, 'total', true)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(items[0].n).toBe(original[0].n)
        expect(items[1].n).toBe(original[1].n)
    })
})

// ─── sortOwnedItems ─────────────────────────────────────────────────────────

describe('sortOwnedItems', () => {
    it('should sort by standard sort type', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ id: '1', n: 'Zebra', v: '5.00' }),
            makeItemOwned({ id: '2', n: 'Alpha', v: '10.00' }),
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const result = sortOwnedItems(items, { mode: 'standard', sortType: SORT_NAME_ASCENDING }, {})

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result[0].data.n).toBe('Alpha')
        expect(result[1].data.n).toBe('Zebra')
    })

    it('should sort by MU total descending', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ id: '1', n: 'Low', q: '10', v: '5.00' }),
            makeItemOwned({ id: '2', n: 'High', q: '10', v: '10.00' }),
        ]
        const itemsMap: ItemsMap = {
            'Low': { markup: { value: '100', unit: UNIT_PERCENTAGE } },
            'High': { markup: { value: '100', unit: UNIT_PERCENTAGE } },
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = sortOwnedItems(items, { mode: 'total', desc: true }, itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result[0].data.n).toBe('High')
        expect(result[1].data.n).toBe('Low')
    })
})

// ─── groupByContainer ────────────────────────────────────────────────────────

describe('groupByContainer', () => {
    it('should return empty array for no items', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = groupByContainer([])

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toEqual([])
    })

    it('should group items by container sorted alphabetically', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ n: 'Item A', c: 'STORAGE' }),
            makeItemOwned({ n: 'Item B', c: 'CARRIED' }),
            makeItemOwned({ n: 'Item C', c: 'STORAGE' }),
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const result = groupByContainer(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toHaveLength(2)
        expect(result[0][0]).toBe('CARRIED')
        expect(result[0][1]).toHaveLength(1)
        expect(result[1][0]).toBe('STORAGE')
        expect(result[1][1]).toHaveLength(2)
    })

    it('should use placeholder for empty container', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ n: 'Item', c: '' }),
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const result = groupByContainer(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result[0][0]).toBe('(no container)')
    })

    it('should preserve container after joinDuplicates merges items', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // Simulate the real data flow: raw inventory has items in different containers.
        // enrichedItemsAtom calls joinDuplicates() which merges items by name.
        // The merged items must still carry a container so groupByContainer works.
        const rawItems: ItemData[] = [
            makeItemData({ id: '1', n: 'Mind Essence', q: '1000', v: '1.00', c: 'CARRIED' }),
            makeItemData({ id: '2', n: 'Lysterium Ingot', q: '500', v: '2.50', c: 'STORAGE' }),
            makeItemData({ id: '3', n: 'Vibrant Sweat', q: '200', v: '0.20', c: 'CARRIED' }),
        ]

        // This is what enrichedItemsAtom does before passing to the component
        const merged = joinDuplicates(rawItems)
        const ownedItems: ItemOwned[] = merged.map(d => ({
            data: d,
            c: { hidden: { any: false, name: false, container: false, value: false } }
        }))

        // ============================================================================
        // ACT
        // ============================================================================
        const result = groupByContainer(ownedItems)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // BUG: joinDuplicates drops the `c` field, so all items end up in "(no container)"
        // Expected: items grouped by their original containers (CARRIED, STORAGE)
        expect(result.length).toBeGreaterThan(1)
        const containerNames = result.map(([name]) => name)
        expect(containerNames).toContain('CARRIED')
        expect(containerNames).toContain('STORAGE')
        expect(containerNames).not.toContain('(no container)')
    })

    it('should group by container when same item exists in multiple containers', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // Same item name in two containers — joinDuplicates merges them into one row,
        // losing the per-container breakdown needed for tree view.
        const rawItems: ItemData[] = [
            makeItemData({ id: '1', n: 'Mind Essence', q: '500', v: '0.50', c: 'CARRIED' }),
            makeItemData({ id: '2', n: 'Mind Essence', q: '1500', v: '1.50', c: 'STORAGE' }),
        ]

        const merged = joinDuplicates(rawItems)
        const ownedItems: ItemOwned[] = merged.map(d => ({
            data: d,
            c: { hidden: { any: false, name: false, container: false, value: false } }
        }))

        // ============================================================================
        // ACT
        // ============================================================================
        const result = groupByContainer(ownedItems)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // BUG: joinDuplicates merges both into one item with no container.
        // For tree view we need either:
        //   - Two separate rows (CARRIED: 500, STORAGE: 1500), or
        //   - At minimum, the merged item should carry a container value
        const containerNames = result.map(([name]) => name)
        expect(containerNames).not.toContain('(no container)')
    })
})

// ─── calcGroupTotal ──────────────────────────────────────────────────────────

describe('calcGroupTotal', () => {
    it('should return zero for empty group', () => {
        // ============================================================================
        // ARRANGE / ACT
        // ============================================================================
        const result = calcGroupTotal([])

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toBe(0)
    })

    it('should sum item values', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const items = [
            makeItemOwned({ v: '10.50' }),
            makeItemOwned({ v: '5.25' }),
        ]

        // ============================================================================
        // ACT
        // ============================================================================
        const result = calcGroupTotal(items)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result).toBeCloseTo(15.75)
    })
})

// ─── getItemDetails ──────────────────────────────────────────────────────────

describe('getItemDetails', () => {
    it('should return details for a simple item name', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Lysterium Ingot': {
                markup: { value: '110', unit: UNIT_PERCENTAGE },
                reserveAmount: '50',
                notes: 'Good seller',
                user: { name: 'Lysterium Ingot', type: 'Ore', value: 0.25, valueOnEdit: '0.25' },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getItemDetails('Lysterium Ingot', itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.type).toBe('Ore')
        expect(result.value).toBe(0.25)
        expect(result.markup).toBe('110%')
        expect(result.reserve).toBe('50 PED')
        expect(result.notes).toBe('Good seller')
    })

    it('should resolve compound item name to base name for lookup', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // Compound name: "Soft Leather ← Soft Hide" — the itemsMap is keyed by "Soft Leather"
        const itemsMap: ItemsMap = {
            'Soft Leather': {
                markup: { value: '130', unit: UNIT_PERCENTAGE },
                reserveAmount: '20',
                notes: 'Crafting material',
                user: { name: 'Soft Leather', type: 'Leather', value: 0.05, valueOnEdit: '0.05' },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getItemDetails('Soft Leather \u2190 Soft Hide', itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.type).toBe('Leather')
        expect(result.value).toBe(0.05)
        expect(result.markup).toBe('130%')
        expect(result.reserve).toBe('20 PED')
        expect(result.notes).toBe('Crafting material')
    })

    it('should return fallback values when item is not in map', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {}

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getItemDetails('Unknown Item', itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.type).toBeUndefined()
        expect(result.value).toBeUndefined()
        expect(result.markup).toBeUndefined()
        expect(result.reserve).toBeUndefined()
        expect(result.notes).toBeUndefined()
    })

    it('should format markup with correct unit', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Force Nexus': {
                markup: { value: '0.5', unit: UNIT_PLUS },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getItemDetails('Force Nexus', itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.markup).toBe('0.5+')
    })

    it('should format markup with /k unit', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Vibrant Sweat': {
                markup: { value: '2', unit: UNIT_PED_K },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getItemDetails('Vibrant Sweat', itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.markup).toBe('2/k')
    })

    it('should return sources for compound items', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Soft Leather': {
                markup: { value: '100', unit: UNIT_PERCENTAGE },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getItemDetails('Soft Leather \u2190 Soft Hide, Animal Hide', itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.baseName).toBe('Soft Leather')
        expect(result.sources).toEqual(['Soft Hide', 'Animal Hide'])
    })

    it('should have no sources for simple items', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const itemsMap: ItemsMap = {
            'Mind Essence': {
                markup: { value: '120', unit: UNIT_PERCENTAGE },
            }
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const result = getItemDetails('Mind Essence', itemsMap)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(result.baseName).toBe('Mind Essence')
        expect(result.sources).toBeUndefined()
    })
})
