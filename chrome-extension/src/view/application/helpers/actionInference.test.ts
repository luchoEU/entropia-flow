import { describe, it, expect } from "@jest/globals"
import { ViewItemData } from '../state/history'
import { StoredAction } from '../state/activity'
import { inferActions, reverseInferActions, matchLootWithInventory } from './actionInference'

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

        it('should infer dismiss_pet for Ancient Exarosaur Strong Pet', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Ancient Exarosaur Strong Pet', q: '-1', v: '-4.69', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([{
                type: 'dismiss_pet',
                item: 'Ancient Exarosaur Strong Pet',
                amount: 1,
                value: 4.69,
                relatedItems: [diff[0]]
            }])
        })

        it('should infer convert_ammo and moved from shrapnel to universal ammo with items moved to storage', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Shrapnel', q: '-4353', v: '-0.43', c: 'CARRIED' },
                { key: 1, n: 'Animal Eye Oil', q: '79', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 2, n: 'Animal Muscle Oil', q: '337', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 3, n: 'Animal Oil Residue', q: '2149', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 4, n: 'Belkar Ingot', q: '1', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 5, n: 'Lysterium Ingot', q: '4', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 6, n: 'Melchi Crystal', q: '1', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 7, n: 'Metal Residue', q: '5', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 8, n: 'Simple 1 Conductors', q: '86', v: '0.00', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                { key: 9, n: 'Universal Ammo', q: '4396', v: '0.44', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)

            expect(actions).toEqual([
                {
                    type: 'convert_ammo',
                    item: 'Shrapnel',
                    amount: 4353,
                    value: 0.43,
                    relatedItems: [diff[0], diff[9]]
                },
                {
                    type: 'moved',
                    item: 'Animal Eye Oil, Animal Muscle Oil, Animal Oil Residue and 5 more',
                    from: 'CARRIED',
                    to: 'STORAGE (Calypso)',
                    relatedItems: [
                        { key: 1, n: 'Animal Eye Oil', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                        { key: 2, n: 'Animal Muscle Oil', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                        { key: 3, n: 'Animal Oil Residue', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                        { key: 4, n: 'Belkar Ingot', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                        { key: 5, n: 'Lysterium Ingot', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                        { key: 6, n: 'Melchi Crystal', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                        { key: 7, n: 'Metal Residue', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' },
                        { key: 8, n: 'Simple 1 Conductors', q: '', v: '', c: 'CARRIED ⭢ STORAGE (Calypso)' }
                    ]
                }
            ])
        })
    })

    describe('reverseInferActions', () => {
        it('should aggregate items by name and container', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'PED Card', q: '', v: '111.95', c: 'CARRIED' },
                { key: 1, n: 'Light Mind Essence', q: '-1006245', v: '-100.62', c: 'AUCTION' },
                { key: 2, n: 'Empty Skill Implant (L)', q: '', v: '-1.23', c: 'Payn-Inc Implant Inserter' },
                { key: 3, n: 'Spacecraft Pilot Skill Implant (L)', q: '1', v: '1.09', c: 'CARRIED' },
                { key: 4, n: 'Payn-Inc Implant Inserter', q: '', v: '-0.01', c: 'CARRIED ⟹ STORAGE (Calypso)' },
            ]

            const actions = inferActions(diff)
            const reversed = reverseInferActions(actions)

            // Items are now grouped by name+container
            expect(reversed.find(r => r.n === 'PED Card')?.v).toBe('111.95')
            expect(reversed.find(r => r.n === 'Light Mind Essence')?.q).toBe('-1006245')
            expect(reversed.find(r => r.n === 'Empty Skill Implant (L)')?.v).toBe('-1.23')
            expect(reversed.find(r => r.n === 'Spacecraft Pilot Skill Implant (L)')?.q).toBe('1')
            // Payn-Inc Implant Inserter appears in two containers due to split in chip_out
            const inserterCarried = reversed.find(r => r.n === 'Payn-Inc Implant Inserter' && r.c === 'CARRIED')
            const inserterMoved = reversed.find(r => r.n === 'Payn-Inc Implant Inserter' && r.c.includes('⟹'))
            expect(inserterCarried?.v).toBe('-0.01')
            expect(inserterMoved).toBeDefined()
        })

        it('should reverse bought_auction without PED Card', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'T1 Weapon Economy Enhancer Blueprint (L)', q: '24', v: '0.24', c: 'AUCTION' }
            ]

            const actions = inferActions(diff)
            const reversed = reverseInferActions(actions)

            expect(reversed.find(r => r.n === 'T1 Weapon Economy Enhancer Blueprint (L)')?.q).toBe('24')
            expect(reversed.find(r => r.n === 'T1 Weapon Economy Enhancer Blueprint (L)')?.v).toBe('0.24')
        })

        it('should reverse refine action', () => {
            const diff: ViewItemData[] = [
                { key: 0, n: 'Diluted Sweat', q: '-4918', v: '-49.18', c: 'CARRIED' },
                { key: 1, n: 'Force Nexus', q: '-4918', v: '-49.18', c: 'STORAGE (Calypso)' },
                { key: 2, n: 'Light Mind Essence', q: '983600', v: '98.36', c: 'CARRIED' }
            ]

            const actions = inferActions(diff)
            const reversed = reverseInferActions(actions)

            expect(reversed.find(r => r.n === 'Diluted Sweat')?.q).toBe('-4918')
            expect(reversed.find(r => r.n === 'Force Nexus')?.q).toBe('-4918')
            expect(reversed.find(r => r.n === 'Light Mind Essence')?.q).toBe('983600')
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

            expect(reversed.find(r => r.n === 'Explosive Projectiles')?.q).toBe('461')
            expect(reversed.find(r => r.n === 'Metal Residue')?.q).toBe('3')
            expect(reversed.find(r => r.n === 'Nanocube')?.q).toBe('-19')
            expect(reversed.find(r => r.n === 'Shrapnel')?.q).toBe('586')
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
       // PED Card is now aggregated (171 * 5 = 855) since it's used in all 5 sold_auction actions
       expect(reversed.find(r => r.n === 'PED Card')?.v).toBe('855.00')
       expect(reversed.find(r => r.n === 'T1 Weapon Economy Enhancer')?.q).toBe('-7')
       expect(reversed.find(r => r.n === 'T2 Mining Finder Range Enhancer')?.q).toBe('-1')
       expect(reversed.find(r => r.n === 'T3 Mining Finder Range Enhancer')?.q).toBe('-1')
       expect(reversed.find(r => r.n === 'T3 Weapon Economy Enhancer')?.q).toBe('-7')
       expect(reversed.find(r => r.n === 'T4 Mining Finder Range Enhancer')?.q).toBe('-1')

       // Each sold_auction action uses the full PED Card value (function limitation)
       expect(actions.length).toBe(5)
       expect(actions.every(a => a.type === 'sold_auction')).toBe(true)
       expect(actions.every(a => a.value === 171)).toBe(true)
   })

    it('should aggregate items by name and container from multiple actions', () => {
        const actions = [
            {
                "id": "1769326381859-unknown-Wasp HC (L)",
                "item": "Wasp HC (L)",
                "relatedItems": [
                    { "c": "Vigilante Arm Guards, Adjusted (M)", "key": 0, "n": "Wasp HC (L)", "q": "1", "v": "0.32" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769326381859,
                "type": "unknown",
                "value": 0.32
            },
            {
                "id": "1769326443844-unknown-Ancient Exarosaur Strong Pet",
                "item": "Ancient Exarosaur Strong Pet",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Ancient Exarosaur Strong Pet", "q": "-1", "v": "-4.69" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769326443844,
                "type": "unknown",
                "value": -4.69
            },
            {
                "amount": 1,
                "id": "1769326505865-craft-Ancient Exarosaur Strong Pet",
                "item": "Ancient Exarosaur Strong Pet",
                "relatedItems": [
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 10, "n": "Universal Ammo", "q": "-15526", "v": "-1.55" },
                    { "c": "CARRIED", "key": 0, "n": "Adjusted Hyperion Armor Catalyst", "q": "2", "v": "0.20" },
                    { "c": "Vigilante Harness, Adjusted (M)", "key": 1, "n": "Ancient Exarosaur Strong Pet", "q": "1", "v": "4.58" },
                    { "c": "Vigilante Thigh Guards, Adjusted (M)", "key": 3, "n": "Fractured Servo", "q": "7", "v": "0.70" },
                    { "c": "Vigilante Harness, Adjusted (M)", "key": 5, "n": "Hyperion Daily Voucher", "q": "1", "v": "-0.02" },
                    { "c": "Vigilante Shin Guards, Adjusted (M)", "key": 6, "n": "Hyperium", "q": "4", "v": "0.40" },
                    { "c": "Vigilante Shin Guards, Adjusted (M)", "key": 8, "n": "Output Amplifier Component", "q": "3", "v": "1.20" },
                    { "c": "Vigilante Thigh Guards, Adjusted (M)", "key": 9, "n": "Shrapnel", "q": "55834", "v": "5.58" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769326505865,
                "type": "craft",
                "value": 4.58
            },
            {
                "id": "1769326505865-unknown-ArMatrix Extender P20 (L), Hyperion Aurora OC-40 (L), Melee Trauma Amplifier 4",
                "item": "ArMatrix Extender P20 (L), Hyperion Aurora OC-40 (L), Melee Trauma Amplifier 4",
                "relatedItems": [
                    { "c": "Vigilante Helmet, Adjusted (M)", "key": 2, "n": "ArMatrix Extender P20 (L)", "q": "-38", "v": "-0.01" },
                    { "c": "Vigilante Helmet, Adjusted (M)", "key": 4, "n": "Hyperion Aurora OC-40 (L)", "q": "", "v": "-0.05" },
                    { "c": "Vigilante Foot Guards, Adjusted (M)", "key": 7, "n": "Melee Trauma Amplifier 4", "q": "", "v": "-0.62" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769326505865,
                "type": "unknown",
                "value": -0.68
            },
            {
                "id": "1769326691637-unknown-Armor Plating Mk. 6A, Armor Plating Mk. 6A, Mind Essence and 4 more",
                "item": "Armor Plating Mk. 6A, Armor Plating Mk. 6A, Mind Essence and 4 more",
                "relatedItems": [
                    { "c": "Vigilante Harness, Adjusted (M)", "key": 0, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.02" },
                    { "c": "Vigilante Helmet, Adjusted (M)", "key": 1, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "CARRIED", "key": 2, "n": "Mind Essence", "q": "-38", "v": "" },
                    { "c": "CARRIED", "key": 3, "n": "Restoration Chip, Adjusted", "q": "", "v": "-0.01" },
                    { "c": "CARRIED", "key": 4, "n": "Vigilante Gloves, Adjusted (M)", "q": "", "v": "-0.02" },
                    { "c": "CARRIED", "key": 5, "n": "Vigilante Harness, Adjusted (M)", "q": "", "v": "-0.02" },
                    { "c": "CARRIED", "key": 6, "n": "Vigilante Helmet, Adjusted (M)", "q": "", "v": "-0.02" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769326691637,
                "type": "unknown",
                "value": -0.1
            },
            {
                "amount": 11,
                "id": "1769327166034-craft-Robot Weapon Sight",
                "item": "Robot Weapon Sight",
                "relatedItems": [
                    { "c": "CARRIED", "key": 18, "n": "Mind Essence", "q": "-790", "v": "-0.08" },
                    { "c": "Longreach 4", "key": 14, "n": "Hyperion Daily Voucher", "q": "1", "v": "-0.05" },
                    { "c": "CARRIED", "key": 15, "n": "Hyperium", "q": "3", "v": "0.30" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 20, "n": "Robot Weapon Sight", "q": "11", "v": "2.31" },
                    { "c": "CARRIED", "key": 21, "n": "Shrapnel", "q": "22683", "v": "2.27" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327166034,
                "type": "craft",
                "value": 2.31
            },
            {
                "id": "1769327166034-unknown-ArMatrix Extender P20 (L), ArMatrix L-Amplifier 45B (L), ArMatrix LR-60 (L) and 21 more",
                "item": "ArMatrix Extender P20 (L), ArMatrix L-Amplifier 45B (L), ArMatrix LR-60 (L) and 21 more",
                "relatedItems": [
                    { "c": "ArMatrix LR-60 (L)", "key": 0, "n": "ArMatrix Extender P20 (L)", "q": "", "v": "-0.02" },
                    { "c": "ArMatrix LR-60 (L)", "key": 1, "n": "ArMatrix L-Amplifier 45B (L)", "q": "", "v": "-0.04" },
                    { "c": "CARRIED", "key": 2, "n": "ArMatrix LR-60 (L)", "q": "", "v": "-0.08" },
                    { "c": "Vigilante Thigh Guards, Adjusted (M)", "key": 3, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.05" },
                    { "c": "Vigilante Helmet, Adjusted (M)", "key": 4, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.04" },
                    { "c": "Vigilante Harness, Adjusted (M)", "key": 5, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.02" },
                    { "c": "Vigilante Shin Guards, Adjusted (M)", "key": 6, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.02" },
                    { "c": "Vigilante Foot Guards, Adjusted (M)", "key": 7, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "Vigilante Gloves, Adjusted (M)", "key": 8, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "Longreach 4", "key": 9, "n": "Bullseye 8", "q": "", "v": "-0.04" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 10, "n": "Bullseye 8", "q": "", "v": "-0.03" },
                    { "c": "Vigilante Gloves, Adjusted (M)", "key": 11, "n": "Bullseye 8", "q": "", "v": "-0.01" },
                    { "c": "Vigilante Helmet, Adjusted (M)", "key": 12, "n": "Divine Intervention Chip", "q": "", "v": "-0.03" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 13, "n": "EMT kit Ek-2600, Modified", "q": "", "v": "-0.47" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 16, "n": "Longreach 4", "q": "", "v": "-0.03" },
                    { "c": "CARRIED", "key": 17, "n": "Marber Bravo-Type Plasma Annihilator", "q": "", "v": "-0.01" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 19, "n": "Restoration Chip, Adjusted", "q": "", "v": "-0.04" },
                    { "c": "CARRIED", "key": 23, "n": "Vigilante Arm Guards, Adjusted (M)", "q": "", "v": "-0.01" },
                    { "c": "CARRIED", "key": 24, "n": "Vigilante Foot Guards, Adjusted (M)", "q": "", "v": "-0.06" },
                    { "c": "CARRIED", "key": 25, "n": "Vigilante Gloves, Adjusted (M)", "q": "", "v": "-0.02" },
                    { "c": "CARRIED", "key": 26, "n": "Vigilante Harness, Adjusted (M)", "q": "", "v": "-0.04" },
                    { "c": "CARRIED", "key": 27, "n": "Vigilante Helmet, Adjusted (M)", "q": "", "v": "-0.09" },
                    { "c": "CARRIED", "key": 28, "n": "Vigilante Shin Guards, Adjusted (M)", "q": "7", "v": "-0.03" },
                    { "c": "CARRIED", "key": 29, "n": "Vigilante Thigh Guards, Adjusted (M)", "q": "32310", "v": "-0.13" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327166034,
                "type": "unknown",
                "value": -1.33
            },
            {
                "amount": 193,
                "id": "1769327413672-refine-Shrapnel",
                "item": "Shrapnel",
                "relatedItems": [
                    { "c": "CARRIED", "key": 3, "n": "Mind Essence", "q": "-38", "v": "" },
                    { "c": "CARRIED", "key": 5, "n": "Shrapnel", "q": "193", "v": "0.02" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327413672,
                "type": "refine",
                "value": 0.02
            },
            {
                "id": "1769327413672-unknown-Armor Plating Mk. 6A, Armor Plating Mk. 6A, Armor Plating Mk. 6A and 4 more",
                "item": "Armor Plating Mk. 6A, Armor Plating Mk. 6A, Armor Plating Mk. 6A and 4 more",
                "relatedItems": [
                    { "c": "Vigilante Arm Guards, Adjusted (M)", "key": 0, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "Vigilante Harness, Adjusted (M)", "key": 1, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "Vigilante Helmet, Adjusted (M)", "key": 2, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "CARRIED", "key": 4, "n": "Restoration Chip, Adjusted", "q": "", "v": "-0.01" },
                    { "c": "CARRIED", "key": 6, "n": "Vigilante Gloves, Adjusted (M)", "q": "", "v": "-0.01" },
                    { "c": "CARRIED", "key": 7, "n": "Vigilante Harness, Adjusted (M)", "q": "", "v": "-0.02" },
                    { "c": "CARRIED", "key": 8, "n": "Vigilante Helmet, Adjusted (M)", "q": "", "v": "-0.02" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327413672,
                "type": "unknown",
                "value": -0.09
            },
            {
                "amount": 263,
                "id": "1769327474753-refine-Shrapnel",
                "item": "Shrapnel",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Mind Essence", "q": "-38", "v": "-0.01" },
                    { "c": "CARRIED", "key": 1, "n": "Shrapnel", "q": "263", "v": "0.02" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327474753,
                "type": "refine",
                "value": 0.02
            },
            {
                "id": "1769327474753-unknown-Vigilante Thigh Guards, Adjusted (M)",
                "item": "Vigilante Thigh Guards, Adjusted (M)",
                "relatedItems": [
                    { "c": "CARRIED", "key": 2, "n": "Vigilante Thigh Guards, Adjusted (M)", "q": "", "v": "-0.02" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327474753,
                "type": "unknown",
                "value": -0.02
            },
            {
                "id": "1769327535820-unknown-Shrapnel",
                "item": "Shrapnel",
                "relatedItems": [
                    { "c": "STORAGE (ARIS)", "key": 0, "n": "Shrapnel", "q": "563", "v": "0.05" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327535820,
                "type": "unknown",
                "value": 0.05
            },
            {
                "amount": 1001052,
                "budgetName": "Mind Essence",
                "id": "1769327596871-sold_auction-Mind Essence",
                "item": "Mind Essence",
                "relatedItems": [
                    { "c": "CARRIED", "key": 1, "n": "PED Card", "q": "", "v": "118.95" },
                    { "c": "AUCTION", "key": 0, "n": "Mind Essence", "q": "-1001052", "v": "-100.10" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327596871,
                "type": "sold_auction",
                "value": 118.95
            },
            {
                "id": "1769327906867-unknown-Universal Ammo",
                "item": "Universal Ammo",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Universal Ammo", "q": "-86254", "v": "-8.63" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327906867,
                "type": "unknown",
                "value": -8.63
            },
            {
                "amount": 2,
                "id": "1769327968708-craft-Output Amplifier Component",
                "item": "Output Amplifier Component",
                "relatedItems": [
                    { "c": "CARRIED", "key": 21, "n": "Mind Essence", "q": "-790", "v": "-0.08" },
                    { "c": "CARRIED", "key": 15, "n": "Derelict Robot Component", "q": "6", "v": "0.60" },
                    { "c": "CARRIED", "key": 18, "n": "Hyperion Daily Voucher", "q": "1", "v": "" },
                    { "c": "CARRIED", "key": 22, "n": "Output Amplifier Component", "q": "2", "v": "0.80" },
                    { "c": "CARRIED", "key": 28, "n": "Rusty Optics", "q": "7", "v": "0.70" },
                    { "c": "CARRIED", "key": 29, "n": "Shrapnel", "q": "32310", "v": "3.23" },
                    { "c": "CARRIED", "key": 38, "n": "Worn Circuit Board", "q": "6", "v": "0.60" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327968708,
                "type": "craft",
                "value": 0.8
            },
            {
                "id": "1769327968708-unknown-ArMatrix Extender P20 (L), ArMatrix L-Amplifier 45B (L), ArMatrix LR-60 (L) and 28 more",
                "item": "ArMatrix Extender P20 (L), ArMatrix L-Amplifier 45B (L), ArMatrix LR-60 (L) and 28 more",
                "relatedItems": [
                    { "c": "ArMatrix LR-60 (L)", "key": 0, "n": "ArMatrix Extender P20 (L)", "q": "", "v": "-0.01" },
                    { "c": "ArMatrix LR-60 (L)", "key": 1, "n": "ArMatrix L-Amplifier 45B (L)", "q": "", "v": "-0.02" },
                    { "c": "CARRIED", "key": 2, "n": "ArMatrix LR-60 (L)", "q": "", "v": "-0.03" },
                    { "c": "Perseus Harness (M,L)", "key": 3, "n": "Armor Plating Mk. 5B", "q": "", "v": "-0.02" },
                    { "c": "Perseus Arm Guards (M,L)", "key": 4, "n": "Armor Plating Mk. 5B", "q": "", "v": "-0.01" },
                    { "c": "Perseus Helmet (M,L)", "key": 5, "n": "Armor Plating Mk. 5B", "q": "", "v": "-0.01" },
                    { "c": "Vigilante Harness, Adjusted (M)", "key": 6, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.05" },
                    { "c": "Vigilante Foot Guards, Adjusted (M)", "key": 7, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.02" },
                    { "c": "Vigilante Shin Guards, Adjusted (M)", "key": 8, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.02" },
                    { "c": "Vigilante Thigh Guards, Adjusted (M)", "key": 9, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.02" },
                    { "c": "Vigilante Arm Guards, Adjusted (M)", "key": 10, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "Vigilante Gloves, Adjusted (M)", "key": 11, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "Vigilante Helmet, Adjusted (M)", "key": 12, "n": "Armor Plating Mk. 6A", "q": "", "v": "-0.01" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 13, "n": "Bullseye 8", "q": "", "v": "-0.05" },
                    { "c": "Longreach 4", "key": 14, "n": "Bullseye 8", "q": "", "v": "-0.05" },
                    { "c": "CARRIED", "key": 16, "n": "Divine Intervention Chip", "q": "", "v": "-0.03" },
                    { "c": "CARRIED", "key": 17, "n": "EMT kit Ek-2600, Modified", "q": "", "v": "-0.29" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 19, "n": "Longreach 4", "q": "", "v": "-0.03" },
                    { "c": "Isis Project Zero-Eight, CDF Edition (L)", "key": 20, "n": "Mayhem B-Amplifier Alpha (L)", "q": "", "v": "-0.01" },
                    { "c": "CARRIED", "key": 23, "n": "Perseus Arm Guards (M,L)", "q": "", "v": "-0.09" },
                    { "c": "CARRIED", "key": 24, "n": "Perseus Harness (M,L)", "q": "", "v": "-0.08" },
                    { "c": "CARRIED", "key": 25, "n": "Perseus Helmet (M,L)", "q": "", "v": "-0.08" },
                    { "c": "CARRIED", "key": 26, "n": "Perseus Thigh Guards (M,L)", "q": "", "v": "-0.04" },
                    { "c": "CARRIED", "key": 27, "n": "Restoration Chip, Adjusted", "q": "", "v": "-0.04" },
                    { "c": "CARRIED", "key": 31, "n": "Vigilante Arm Guards, Adjusted (M)", "q": "", "v": "-0.03" },
                    { "c": "CARRIED", "key": 32, "n": "Vigilante Foot Guards, Adjusted (M)", "q": "", "v": "-0.06" },
                    { "c": "CARRIED", "key": 33, "n": "Vigilante Gloves, Adjusted (M)", "q": "", "v": "-0.03" },
                    { "c": "CARRIED", "key": 34, "n": "Vigilante Harness, Adjusted (M)", "q": "", "v": "-0.11" },
                    { "c": "CARRIED", "key": 35, "n": "Vigilante Helmet, Adjusted (M)", "q": "", "v": "-0.03" },
                    { "c": "CARRIED", "key": 36, "n": "Vigilante Shin Guards, Adjusted (M)", "q": "", "v": "-0.02" },
                    { "c": "CARRIED", "key": 37, "n": "Vigilante Thigh Guards, Adjusted (M)", "q": "", "v": "-0.06" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769327968708,
                "type": "unknown",
                "value": -1.37
            },
            {
                "id": "1769328273805-unknown-Hoverboard Alien Lame Edition (C,L)",
                "item": "Hoverboard Alien Lame Edition (C,L)",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Hoverboard Alien Lame Edition (C,L)", "q": "-1", "v": "-15.03" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769328273805,
                "type": "unknown",
                "value": -15.03
            },
            {
                "amount": 1,
                "id": "1769328396823-refine-Hoverboard Alien Lame Edition (C,L)",
                "item": "Hoverboard Alien Lame Edition (C,L)",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "H-DNA", "q": "-1", "v": "" },
                    { "c": "CARRIED", "key": 1, "n": "Hoverboard Alien Lame Edition (C,L)", "q": "1", "v": "15.03" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769328396823,
                "type": "refine",
                "value": 15.03
            },
            {
                "id": "1769328518706-unknown-Shrapnel",
                "item": "Shrapnel",
                "relatedItems": [
                    { "c": "STORAGE (ARIS)", "key": 0, "n": "Shrapnel", "q": "194", "v": "0.01" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769328518706,
                "type": "unknown",
                "value": 0.01
            },
            {
                "id": "1769328762734-unknown-Mind Essence, Restoration Chip, Adjusted",
                "item": "Mind Essence, Restoration Chip, Adjusted",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Mind Essence", "q": "-38", "v": "" },
                    { "c": "CARRIED", "key": 1, "n": "Restoration Chip, Adjusted", "q": "", "v": "-0.01" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769328762734,
                "type": "unknown",
                "value": -0.01
            },
            {
                "id": "1769328947647-unknown-Hoverboard Alien Lame Edition (C,L)",
                "item": "Hoverboard Alien Lame Edition (C,L)",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Hoverboard Alien Lame Edition (C,L)", "q": "-1", "v": "-15.03" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769328947647,
                "type": "unknown",
                "value": -15.03
            },
            {
                "id": "1769329070023-unknown-Hyperion Daily Voucher, Shrapnel",
                "item": "Hyperion Daily Voucher, Shrapnel",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Hyperion Daily Voucher", "q": "1", "v": "" },
                    { "c": "STORAGE (ARIS)", "key": 1, "n": "Shrapnel", "q": "49", "v": "" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769329070023,
                "type": "unknown",
                "value": 0
            },
            {
                "id": "1769329132094-unknown-Hoverboard Alien Lame Edition (C,L)",
                "item": "Hoverboard Alien Lame Edition (C,L)",
                "relatedItems": [
                    { "c": "CARRIED", "key": 0, "n": "Hoverboard Alien Lame Edition (C,L)", "q": "1", "v": "15.03" }
                ],
                "sources": ["inventory"],
                "timestamp": 1769329132094,
                "type": "unknown",
                "value": 15.03
            }
        ] as any[]

        const result = reverseInferActions(actions)

        // Helper to find item by name and container
        const findItem = (name: string, container: string) =>
            result.find(r => r.n === name && r.c === container)

        // Verify key aggregated items
        expect(findItem('PED Card', 'CARRIED')?.v).toBe('118.95')
        expect(findItem('Mind Essence', 'AUCTION')?.q).toBe('-1001052')
        expect(findItem('Mind Essence', 'AUCTION')?.v).toBe('-100.10')
        expect(findItem('Mind Essence', 'CARRIED')?.q).toBe('-1732')
        expect(findItem('Robot Weapon Sight', 'Isis Project Zero-Eight, CDF Edition (L)')?.q).toBe('11')
        expect(findItem('Derelict Robot Component', 'CARRIED')?.q).toBe('6')
        expect(findItem('Rusty Optics', 'CARRIED')?.q).toBe('7')
        expect(findItem('Worn Circuit Board', 'CARRIED')?.q).toBe('6')
        expect(findItem('Wasp HC (L)', 'Vigilante Arm Guards, Adjusted (M)')?.q).toBe('1')
        expect(findItem('Adjusted Hyperion Armor Catalyst', 'CARRIED')?.q).toBe('2')
        expect(findItem('Fractured Servo', 'Vigilante Thigh Guards, Adjusted (M)')?.q).toBe('7')
        expect(findItem('H-DNA', 'CARRIED')?.q).toBe('-1')

        // Verify Shrapnel aggregation by container
        expect(findItem('Shrapnel', 'CARRIED')?.q).toBe('55449')
        expect(findItem('Shrapnel', 'Vigilante Thigh Guards, Adjusted (M)')?.q).toBe('55834')
        expect(findItem('Shrapnel', 'STORAGE (ARIS)')?.q).toBe('806')

        // Verify Universal Ammo aggregation
        expect(findItem('Universal Ammo', 'Isis Project Zero-Eight, CDF Edition (L)')?.q).toBe('-15526')
        expect(findItem('Universal Ammo', 'CARRIED')?.q).toBe('-86254')
    })

    describe('matchLootWithInventory', () => {
        it('should match inventory items to existing loot actions by item name', () => {
            // Existing loot actions from client (game log)
            const lootActions: StoredAction[] = [
                {
                    id: 'loot-1',
                    type: 'loot',
                    item: 'Shrapnel',
                    value: 2.22,
                    timestamp: 1000043000, // 16:51:43
                    sources: ['client'],
                    relatedItems: [
                        { key: 1, n: 'Shrapnel', q: '22241', v: '2.22', c: 'LOOT' }
                    ]
                },
                {
                    id: 'loot-2',
                    type: 'loot',
                    item: 'Animal Thyroid Oil, Shrapnel',
                    value: 1.34,
                    timestamp: 1000003000, // 16:51:03
                    sources: ['client'],
                    relatedItems: [
                        { key: 2, n: 'Animal Thyroid Oil', q: '9', v: '0.90', c: 'LOOT' },
                        { key: 3, n: 'Shrapnel', q: '4441', v: '0.44', c: 'LOOT' }
                    ]
                }
            ]

            // Inventory diff items (comes later)
            const inventoryItems: ViewItemData[] = [
                { key: 10, n: 'Universal Ammo', q: '-57668', v: '-5.77', c: 'CARRIED' },
                { key: 11, n: 'Shrapnel', q: '26682', v: '2.67', c: 'CARRIED' },
                { key: 12, n: 'Mind Essence', q: '-76', v: '-0.01', c: 'CARRIED' },
                { key: 13, n: 'Animal Thyroid Oil', q: '9', v: '0.90', c: 'CARRIED' },
                { key: 14, n: 'ArMatrix Extender P20 (L)', q: '0', v: '-0.05', c: 'Hyperion Aurora OC-40 (L)' },
                { key: 15, n: 'Hyperion Aurora OC-40 (L)', q: '0', v: '-0.19', c: 'CARRIED' },
                { key: 16, n: 'Mayhem M-Matrix Beta (L)', q: '0', v: '-0.01', c: 'Hyperion Aurora OC-40 (L)' },
                { key: 17, n: 'Melee Trauma Amplifier 4', q: '0', v: '-2.31', c: 'Hyperion Aurora OC-40 (L)' },
                { key: 18, n: 'Restoration Chip, Adjusted', q: '0', v: '-0.02', c: 'CARRIED' }
            ]

            const inventoryTimestamp = 1000060000 // ~17 seconds after last loot

            const result = matchLootWithInventory(inventoryItems, lootActions, inventoryTimestamp)

            // Shrapnel and Animal Thyroid Oil should be matched
            expect(result.matches.length).toBe(2)

            // Check Shrapnel match
            const shrapnelMatch = result.matches.find(m => m.itemName === 'Shrapnel')
            expect(shrapnelMatch).toBeDefined()
            expect(shrapnelMatch!.lootActionIds).toContain('loot-1')
            expect(shrapnelMatch!.lootActionIds).toContain('loot-2')

            // Check Animal Thyroid Oil match
            const oilMatch = result.matches.find(m => m.itemName === 'Animal Thyroid Oil')
            expect(oilMatch).toBeDefined()
            expect(oilMatch!.lootActionIds).toContain('loot-2')

            // Universal Ammo, Mind Essence, and decay items should be unmatched
            expect(result.unmatched.length).toBe(7)
            expect(result.unmatched.find(i => i.n === 'Universal Ammo')).toBeDefined()
            expect(result.unmatched.find(i => i.n === 'Mind Essence')).toBeDefined()
            expect(result.unmatched.find(i => i.n === 'ArMatrix Extender P20 (L)')).toBeDefined()
        })

        it('should not match items outside the time window', () => {
            const lootActions: StoredAction[] = [
                {
                    id: 'loot-1',
                    type: 'loot',
                    item: 'Shrapnel',
                    value: 2.22,
                    timestamp: 1000000000,
                    sources: ['client'],
                    relatedItems: [
                        { key: 1, n: 'Shrapnel', q: '22241', v: '2.22', c: 'LOOT' }
                    ]
                }
            ]

            const inventoryItems: ViewItemData[] = [
                { key: 10, n: 'Shrapnel', q: '22241', v: '2.22', c: 'CARRIED' }
            ]

            // Inventory timestamp is 2 minutes later - outside default 60s window
            const inventoryTimestamp = 1000120000

            const result = matchLootWithInventory(inventoryItems, lootActions, inventoryTimestamp)

            expect(result.matches.length).toBe(0)
            expect(result.unmatched.length).toBe(1)
        })

        it('should only match positive quantity items (gained)', () => {
            const lootActions: StoredAction[] = [
                {
                    id: 'loot-1',
                    type: 'loot',
                    item: 'Universal Ammo',
                    value: 5.77,
                    timestamp: 1000000000,
                    sources: ['client'],
                    relatedItems: [
                        { key: 1, n: 'Universal Ammo', q: '57668', v: '5.77', c: 'LOOT' }
                    ]
                }
            ]

            const inventoryItems: ViewItemData[] = [
                // Negative quantity - consumed, not gained
                { key: 10, n: 'Universal Ammo', q: '-57668', v: '-5.77', c: 'CARRIED' }
            ]

            const inventoryTimestamp = 1000030000

            const result = matchLootWithInventory(inventoryItems, lootActions, inventoryTimestamp)

            // Should not match because the inventory item is negative (consumed)
            expect(result.matches.length).toBe(0)
            expect(result.unmatched.length).toBe(1)
        })

        it('should not match loot actions that already have inventory source', () => {
            const lootActions: StoredAction[] = [
                {
                    id: 'loot-1',
                    type: 'loot',
                    item: 'Shrapnel',
                    value: 2.22,
                    timestamp: 1000000000,
                    sources: ['client', 'inventory'], // Already merged
                    relatedItems: [
                        { key: 1, n: 'Shrapnel', q: '22241', v: '2.22', c: 'LOOT' }
                    ]
                }
            ]

            const inventoryItems: ViewItemData[] = [
                { key: 10, n: 'Shrapnel', q: '22241', v: '2.22', c: 'CARRIED' }
            ]

            const inventoryTimestamp = 1000030000

            const result = matchLootWithInventory(inventoryItems, lootActions, inventoryTimestamp)

            expect(result.matches.length).toBe(0)
            expect(result.unmatched.length).toBe(1)
        })
    })
})
