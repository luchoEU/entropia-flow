import { ViewItemData } from '../state/history'
import { inferActions } from './actionInference'

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
})
