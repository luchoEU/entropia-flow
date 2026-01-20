import { ViewItemData } from '../state/history'
import { inferActions, reverseInferActions } from './actionInference'

describe('actionInference', () => {
    describe('inferActions', () => {
        it('should infer auction sale, chip_out, and move from example diff', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'PED Card', q: '', v: '111.95', c: 'CARRIED' },
                { key: 1, n: 'Light Mind Essence', q: '-1006245', v: '-100.62', c: 'AUCTION' },
                { key: 2, n: 'Empty Skill Implant (L)', q: '', v: '-1.23', c: 'Payn-Inc Implant Inserter' },
                { key: 3, n: 'Spacecraft Pilot Skill Implant (L)', q: '1', v: '1.09', c: 'CARRIED' },
                { key: 4, n: 'Payn-Inc Implant Inserter', q: '', v: '-0.01', c: 'CARRIED ⟹ STORAGE (Calypso)' },
            ]

            const actions = inferActions(diff)

            // Note: diff[4] is split into two conceptual items:
            // - decay part (value: -0.01) goes with chip_out
            // - move part (container change) goes with moved

            expect(actions).toEqual([
                {
                    type: 'sold_auction',
                    item: 'Light Mind Essence',
                    amount: 1006245,
                    value: 111.95,
                    relatedItems: [diff[0], diff[1]]  // PED Card + Light Mind Essence
                },
                {
                    type: 'chip_out',
                    item: 'Spacecraft Pilot Skill Implant (L)',
                    from: 'Empty Skill Implant (L)',  // The implant the chip was extracted from
                    amount: 1,
                    value: 1.23,  // implant value (1.23) - inserter decay is separate
                    relatedItems: [
                        diff[2],  // Empty Skill Implant (L) consumed
                        diff[3],  // Spacecraft Pilot Skill Implant (L) gained
                        { key: 4, n: 'Payn-Inc Implant Inserter', q: '', v: '-0.01', c: 'CARRIED' }  // decay only
                    ]
                },
                {
                    type: 'moved',
                    item: 'Payn-Inc Implant Inserter',
                    from: 'CARRIED',
                    to: 'STORAGE (Calypso)',
                    relatedItems: [
                        { key: 4, n: 'Payn-Inc Implant Inserter', q: '', v: '', c: 'CARRIED ⟹ STORAGE (Calypso)' }  // move only, no value
                    ]
                }
            ])
        })

        it('should infer bought_auction without PED Card (payment made earlier)', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'T1 Weapon Economy Enhancer Blueprint (L)', q: '24', v: '0.24', c: 'AUCTION' }
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([{
                type: 'bought_auction',
                item: 'T1 Weapon Economy Enhancer Blueprint (L)',
                amount: 24,
                value: 0.24,
                relatedItems: [diff[0]]
            }])
        })

        it('should infer bought_auction with PED Card deduction (payment concurrent)', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'PED Card', q: '', v: '-0.24', c: 'CARRIED' },
                { key: 1, n: 'T1 Weapon Economy Enhancer Blueprint (L)', q: '24', v: '0.24', c: 'AUCTION' }
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([{
                type: 'bought_auction',
                item: 'T1 Weapon Economy Enhancer Blueprint (L)',
                amount: 24,
                value: 0.24,
                relatedItems: [diff[1], diff[0]]
            }])
        })

        it('should infer refine of Light Mind Essence', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Diluted Sweat', q: '-4918', v: '-49.18', c: 'CARRIED' },
                { key: 1, n: 'Force Nexus', q: '-4918', v: '-49.18', c: 'STORAGE (Calypso)' },
                { key: 2, n: 'Light Mind Essence', q: '983600', v: '98.36', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([{
                type: 'refine',
                item: 'Light Mind Essence',
                amount: 983600,
                value: 98.36,
                relatedItems: [diff[0], diff[1], diff[2]]
            }])
        })

        it('should infer bought_auction for Diluted Sweat', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Diluted Sweat', q: '7320', v: '73.20', c: 'CARRIED' },
                { key: 1, n: 'PED Card', q: '', v: '-79.00', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([{
                type: 'bought_auction',
                item: 'Diluted Sweat',
                amount: 7320,
                value: 79.00,
                relatedItems: [diff[0], diff[1]]
            }])
        })
    })

    describe('reverseInferActions', () => {
        it('should reverse the actions back to the original diff', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'PED Card', q: '', v: '111.95', c: 'CARRIED' },
                { key: 1, n: 'Light Mind Essence', q: '-1006245', v: '-100.62', c: 'AUCTION' },
                { key: 2, n: 'Empty Skill Implant (L)', q: '', v: '-1.23', c: 'Payn-Inc Implant Inserter' },
                { key: 3, n: 'Spacecraft Pilot Skill Implant (L)', q: '1', v: '1.09', c: 'CARRIED' },
                { key: 4, n: 'Payn-Inc Implant Inserter', q: '', v: '-0.01', c: 'CARRIED ⟹ STORAGE (Calypso)' },
            ]

            const actions = inferActions(diff)
            const reversed = reverseInferActions(actions)

            // Sort both by key for comparison
            const sortedDiff = [...diff].sort((a, b) => a.key - b.key)
            const sortedReversed = [...reversed].sort((a, b) => a.key - b.key)

            expect(sortedReversed).toEqual(sortedDiff)
        })

        it('should reverse bought_auction without PED Card', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'T1 Weapon Economy Enhancer Blueprint (L)', q: '24', v: '0.24', c: 'AUCTION' }
            ]

            const actions = inferActions(diff)
            const reversed = reverseInferActions(actions)

            expect(reversed).toEqual(diff)
        })

        it('should reverse refine action', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Diluted Sweat', q: '-4918', v: '-49.18', c: 'CARRIED' },
                { key: 1, n: 'Force Nexus', q: '-4918', v: '-49.18', c: 'STORAGE (Calypso)' },
                { key: 2, n: 'Light Mind Essence', q: '983600', v: '98.36', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)
            const reversed = reverseInferActions(actions)

            const sortedDiff = [...diff].sort((a, b) => a.key - b.key)
            const sortedReversed = [...reversed].sort((a, b) => a.key - b.key)

            expect(sortedReversed).toEqual(sortedDiff)
        })
    })
})
