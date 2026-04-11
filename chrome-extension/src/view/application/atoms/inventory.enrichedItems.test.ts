import { createStore } from 'jotai'
import { rawInventoryItemsAtom, enrichedItemsAtom, filterOptionsAtom } from './inventory'
import { ItemOwned } from '../state/inventory'
import { ItemData } from '../../../common/state'

// Jest mock so importing the inventory atoms (which transitively reach the
// messages service) does not try to talk to Chrome APIs during tests.
jest.mock('../../services/api/messages', () => ({
    __esModule: true,
    default: {},
}))

function makeOwned(data: ItemData): ItemOwned {
    return {
        data,
        c: { hidden: { any: false, name: false, container: false, value: false } }
    }
}

describe('enrichedItemsAtom — auction split', () => {
    test('keeps an item that exists both inside a container and on AUCTION as two separate rows', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // Reproduces the real-world scenario: a Spacecraft Pilot Skill Implant (L)
        // physically stored inside the Sleipnir Mk. 1 (C,L) plus a second copy
        // currently listed on the Auction. Before the fix, joinDuplicates merged
        // both into one row with container="Sleipnir Mk. 1 (C,L)" and qty=2.
        const store = createStore()
        const raw: ItemOwned[] = [
            makeOwned({
                id: '1001',
                n: 'Spacecraft Pilot Skill Implant (L)',
                q: '1',
                v: '4.57',
                c: 'Sleipnir Mk. 1 (C,L)',
            }),
            makeOwned({
                id: '1002',
                n: 'Spacecraft Pilot Skill Implant (L)',
                q: '1',
                v: '4.56',
                c: 'AUCTION',
            }),
        ]
        store.set(rawInventoryItemsAtom, raw)

        // ============================================================================
        // ACT
        // ============================================================================
        const enriched = store.get(enrichedItemsAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // Two distinct rows — one for the ship-nested copy, one for the auction copy
        expect(enriched).toHaveLength(2)
        const owned = enriched.find(e => e.data.c === 'Sleipnir Mk. 1 (C,L)')
        const auction = enriched.find(e => e.data.c === 'AUCTION')
        expect(owned).toBeDefined()
        expect(auction).toBeDefined()
        expect(owned!.data.q).toBe('1')
        expect(owned!.data.v).toBe('4.57')
        expect(auction!.data.q).toBe('1')
        expect(auction!.data.v).toBe('4.56')
    })

    test('still merges multiple non-auction copies of the same item', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // Sanity check: items with the same name but no auction copy must still
        // be joined by joinDuplicates (prior behavior is preserved for non-AUCTION).
        const store = createStore()
        const raw: ItemOwned[] = [
            makeOwned({ id: '1', n: 'Mind Essence', q: '500', v: '0.50', c: 'CARRIED' }),
            makeOwned({ id: '2', n: 'Mind Essence', q: '1500', v: '1.50', c: 'STORAGE' }),
        ]
        store.set(rawInventoryItemsAtom, raw)

        // ============================================================================
        // ACT
        // ============================================================================
        const enriched = store.get(enrichedItemsAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(enriched).toHaveLength(1)
        expect(enriched[0].data.n).toBe('Mind Essence')
        expect(enriched[0].data.q).toBe('2000')
        expect(enriched[0].data.v).toBe('2.00')
    })

    test('when filterOptions.auction is ON, hides every row of an item that has any auction copy (legacy behavior)', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // Replicates the user's report: Spacecraft Pilot Skill Implant (L) exists
        // in CARRIED, inside a ship, AND on AUCTION. With the "Hide items on
        // auction" (A) toggle ON, the legacy (Redux) tabular pipeline
        // (commit f8b093b) hid ALL rows whose name appeared on auction, not
        // just the AUCTION container rows.
        const store = createStore()
        const raw: ItemOwned[] = [
            makeOwned({ id: '1', n: 'Spacecraft Pilot Skill Implant (L)', q: '1', v: '9.13', c: 'CARRIED' }),
            makeOwned({ id: '2', n: 'Spacecraft Pilot Skill Implant (L)', q: '1', v: '0.00', c: 'Sleipnir Mk. 1 (C,L)' }),
            makeOwned({ id: '3', n: 'Spacecraft Pilot Skill Implant (L)', q: '1', v: '1.09', c: 'AUCTION' }),
            // Control item (no auction copy) must still appear
            makeOwned({ id: '4', n: 'Mind Essence', q: '100', v: '10.00', c: 'CARRIED' }),
        ]
        store.set(rawInventoryItemsAtom, raw)
        store.set(filterOptionsAtom, { reserve: false, auction: true, aggregateRefined: false })

        // ============================================================================
        // ACT
        // ============================================================================
        const enriched = store.get(enrichedItemsAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // No implant rows at all — every copy hidden because the item has an
        // auction listing. The unrelated control item survives.
        expect(enriched.some(e => e.data.n === 'Spacecraft Pilot Skill Implant (L)')).toBe(false)
        expect(enriched).toHaveLength(1)
        expect(enriched[0].data.n).toBe('Mind Essence')
    })

    test('joins multiple auction copies of the same item together (separate from non-auction copies)', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        const raw: ItemOwned[] = [
            makeOwned({ id: '1', n: 'Mind Essence', q: '500', v: '0.50', c: 'CARRIED' }),
            makeOwned({ id: '2', n: 'Mind Essence', q: '1000', v: '1.00', c: 'AUCTION' }),
            makeOwned({ id: '3', n: 'Mind Essence', q: '2000', v: '2.00', c: 'AUCTION' }),
        ]
        store.set(rawInventoryItemsAtom, raw)

        // ============================================================================
        // ACT
        // ============================================================================
        const enriched = store.get(enrichedItemsAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // One non-auction row + one joined auction row = 2
        expect(enriched).toHaveLength(2)
        const owned = enriched.find(e => e.data.c === 'CARRIED')
        const auction = enriched.find(e => e.data.c === 'AUCTION')
        expect(owned!.data.q).toBe('500')
        expect(auction!.data.q).toBe('3000')
        expect(auction!.data.v).toBe('3.00')
    })
})
