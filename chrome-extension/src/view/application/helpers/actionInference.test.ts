import { describe, it, expect } from "@jest/globals"
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

        it('should infer craft of Explosive Projectiles', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Explosive Projectiles', q: '461', v: '0.04', c: 'CARRIED' },  // crafted product
                { key: 1, n: 'Metal Residue', q: '3', v: '0.03', c: 'CARRIED' },           // returned residue  
                { key: 2, n: 'Nanocube', q: '-19', v: '-0.19', c: 'CARRIED' },            // consumed material
                { key: 3, n: 'Shrapnel', q: '586', v: '0.05', c: 'CARRIED' }              // returned residue
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([{
                type: 'craft',
                item: 'Explosive Projectiles',  // main crafted item
                amount: 461,
                value: 0.04,  // value of crafted item only
                relatedItems: [diff[2], diff[0], diff[1], diff[3]]  // consumed first, then all positive items
            }])
        })

        it('should infer craft of Jester D-1 with multiple consumed materials', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Belkar Ingot', q: '-30', v: '-1.80', c: 'STORAGE (Calypso)' },
                { key: 1, n: 'Belkar Ingot', q: '11', v: '0.66', c: 'CARRIED' },
                { key: 2, n: 'Energy Matter Residue', q: '66', v: '0.66', c: 'CARRIED' },
                { key: 3, n: 'Iron Ingot', q: '-30', v: '-11.70', c: 'STORAGE (Calypso)' },
                { key: 4, n: 'Iron Ingot', q: '4', v: '1.56', c: 'CARRIED' },
                { key: 5, n: 'Jester D-1', q: '5', v: '7.63', c: 'CARRIED' },
                { key: 6, n: 'Melchi Crystal', q: '-15', v: '-0.60', c: 'STORAGE (Calypso)' },
                { key: 7, n: 'Melchi Crystal', q: '5', v: '0.20', c: 'CARRIED' },
                { key: 8, n: 'Metal Residue', q: '46', v: '0.46', c: 'CARRIED' },
                { key: 9, n: 'Shrapnel', q: '432', v: '0.04', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([{
                type: 'craft',
                item: 'Jester D-1',  // Main crafted item (highest value non-residue)
                amount: 5,
                value: 7.63,  // Value of crafted item only
                relatedItems: [
                    diff[0],  // Belkar Ingot (consumed)
                    diff[1],  // Belkar Ingot (returned)
                    diff[2],  // Energy Matter Residue (byproduct)
                    diff[4],  // Iron Ingot (returned)
                    diff[5],  // Jester D-1 (crafted)
                    diff[7],  // Melchi Crystal (returned)
                    diff[8],  // Metal Residue (byproduct)
                    diff[9]   // Shrapnel (byproduct)
                ]
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

        it('should reverse craft action', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Explosive Projectiles', q: '461', v: '0.04', c: 'CARRIED' },
                { key: 1, n: 'Metal Residue', q: '3', v: '0.03', c: 'CARRIED' },  
                { key: 2, n: 'Nanocube', q: '-19', v: '-0.19', c: 'CARRIED' },
                { key: 3, n: 'Shrapnel', q: '586', v: '0.05', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)
            const reversed = reverseInferActions(actions)

            const sortedDiff = [...diff].sort((a, b) => a.key - b.key)
            const sortedReversed = [...reversed].sort((a, b) => a.key - b.key)

            expect(sortedReversed).toEqual(sortedDiff)
        })
    })

    it('should infer listed_auction for T5 Weapon Economy Enhancer', () => {
        const diff: ViewItemData[] = [
            { key: 0, n: 'T5 Weapon Economy Enhancer', q: '7', v: '7.00', c: 'CARRIED ⭢ AUCTION' },
            { key: 1, n: 'PED Card', q: '', v: '-1.19', c: 'CARRIED' }
        ]

        const actions = inferActions(diff)

        expect(actions).toEqual([{
            type: 'listed_auction',
            item: 'T5 Weapon Economy Enhancer',
            amount: 7,
            value: 1.19,
            relatedItems: [diff[0], diff[1]]
        }])
    })

    it('should infer listed_auction when user puts T5 Weapon Economy Enhancer in auction', () => {
        const diff: ViewItemData[] = [
            { key: 0, n: 'T5 Weapon Economy Enhancer', q: '7', v: '7.00', c: 'CARRIED ⭢ AUCTION' },
            { key: 1, n: 'PED Card', q: '', v: '-1.19', c: 'CARRIED' }
        ]

        const actions = inferActions(diff)

        expect(actions).toEqual([{
            type: 'listed_auction',
            item: 'T5 Weapon Economy Enhancer',
            amount: 7,
            value: 1.19,
            relatedItems: [diff[0], diff[1]]
        }])
    })

     it('should infer sold_auction for exactly provided dataset', () => {
       const diff: ViewItemData[] = [
           { key: 0, n: 'T1 Weapon Economy Enhancer', q: '-7', v: '-7.00', c: 'AUCTION' },
           { key: 1, n: 'T2 Mining Finder Range Enhancer', q: '-1', v: '-1.00', c: 'AUCTION' },
           { key: 2, n: 'T3 Mining Finder Range Enhancer', q: '-1', v: '-1.00', c: 'AUCTION' },
           { key: 3, n: 'T3 Weapon Economy Enhancer', q: '-7', v: '-7.00', c: 'AUCTION' },
           { key: 4, n: 'T4 Mining Finder Range Enhancer', q: '-1', v: '-1.00', c: 'AUCTION' },
           { key: 5, n: 'PED Card', q: '', v: '171.00', c: 'CARRIED' },
       ]
       const actions = inferActions(diff)

       const reversed = reverseInferActions(actions)
       expect(reversed).toEqual(diff)

       expect(actions).toEqual([
           {
               type: 'sold_auction',
               item: 'T3 Weapon Economy Enhancer',
               amount: 7,
               value: 21.95,
               relatedItems: [diff[5], diff[3]]
           },
           {
               type: 'sold_auction',
               item: 'T1 Weapon Economy Enhancer',
               amount: 7,
               value: 22.90,
               relatedItems: [diff[5], diff[0]]
           },
           {
               type: 'sold_auction',
               item: 'T4 Mining Finder Range Enhancer',
               amount: 1,
               value: 44.72,
               relatedItems: [diff[5], diff[4]]
           },
           {
               type: 'sold_auction',
               item: 'T2 Mining Finder Range Enhancer',
               amount: 1,
               value: 40.81,
               relatedItems: [diff[5], diff[1]]
           },
           {
               type: 'sold_auction',
               item: 'T3 Mining Finder Range Enhancer',
               amount: 1,
               value: 40.62,
               relatedItems: [diff[5], diff[2]]
           }
       ])
   })
})
