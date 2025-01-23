import { emptyGameLogData, GameLogData } from "./gameLogData"
import GameLogHistory from "./gameLogHistory"
import GameLogParser from "./gameLogParser"

describe('formula parser', () => {
    let gameLogParser: GameLogParser
    let gameLogHistory: GameLogHistory

    beforeEach(() => {
        gameLogParser = new GameLogParser()
        gameLogHistory = new GameLogHistory()
        gameLogParser.onLine = (s) => gameLogHistory.onLine(s)
    })

    async function parseExpect(lines: string, expected: Partial<GameLogData>) {
        for (const line of lines.split('\n')) {
            await gameLogParser.onMessage(line)
        }
        expect({ ...gameLogHistory.getGameLog(), raw: [] }).toEqual({ ...emptyGameLogData(), ...expected })
    }

    test('team', async () => await parseExpect(
`2024-12-23 17:08:58 [Team] [] Xrated La Tina received Shrapnel (15611)
2024-12-23 17:08:58 [System] [] You received Shrapnel x (23362) Value: 2.33 PED
2024-12-23 17:08:58 [Team] [] Lucho received Shrapnel (23362)
2024-12-23 17:08:58 [Team] [] wackadoodle received Shrapnel (1628)
2024-12-23 17:09:18 [Team] [] Lucho received Shrapnel (4212)
2024-12-23 17:09:18 [Team] [] wackadoodle received Shrapnel (314)
2024-12-23 17:09:18 [System] [] You received Shrapnel x (4212) Value: 0.4212 PED
2024-12-23 17:09:18 [System] [] You received Animal Adrenal Oil x (9) Value: 1.80 PED
2024-12-23 17:09:18 [Team] [] Xrated La Tina received Animal Adrenal Oil (6)
2024-12-23 17:09:18 [Team] [] Xrated La Tina received Shrapnel (3873)
2024-12-23 17:09:18 [Team] [] Lucho received Animal Adrenal Oil (9)`,
        {
            loot: [{
                name: 'Animal Adrenal Oil',
                quantity: 9,
                value: 1.8
            },
            {
                name: 'Shrapnel',
                quantity: 27574,
                value: 2.7512
            }],
            team: [{
                player: 'Lucho',
                name: 'Animal Adrenal Oil',
                quantity: 9
            }, {
                player: 'Xrated La Tina',
                name: 'Animal Adrenal Oil',
                quantity: 6
            }, {
                player: 'wackadoodle',
                name: 'Shrapnel',
                quantity: 1942
            }, {
                player: 'Lucho',
                name: 'Shrapnel',
                quantity: 27574
            }, {
                player: 'Xrated La Tina',
                name: 'Shrapnel',
                quantity: 19484
            }],
            stats: {
                lootGroup: { total: 2, count: 2, history: [{ time: new Date('2024-12-23 17:09:18'), value: 1 }, { time: new Date('2024-12-23 17:08:58'), value: 1 }] }
            }
        })
    )

    test('global', async () => await parseExpect(
`2025-01-11 12:38:08 [Globals] [] Lucho MUCHO Ireton killed a creature (Merry Annihilation Daikiba 08) with a value of 57 PED!`,
        {
            global: [{
                time: '2025-01-11 12:38:08',
                player: 'Lucho MUCHO Ireton',
                name: 'Merry Annihilation Daikiba 08',
                type: 'hunt',
                value: 57,
                isHoF: false
            }]
        })
    )

    test('hof', async () => await parseExpect(
`2025-01-11 12:38:08 [Globals] [] High Looter Elite killed a creature (Maffoid Warlord) with a value of 808 PED! A record has been added to the Hall of Fame!`,
        {
            global: [{
                time: '2025-01-11 12:38:08',
                player: 'High Looter Elite',
                name: 'Maffoid Warlord',
                type: 'hunt',
                value: 808,
                isHoF: true
            }]
        })
    )
    
    test('kills', async () => await parseExpect(
`2025-01-12 07:47:37 [#cyrene_rangers] [Rattler Llama Simpsons] omw
2025-01-12 07:47:37 [System] [] You received Mayhem Token x (1) Value: 0.0000 PED
2025-01-12 07:47:37 [System] [] You received Shrapnel x (45745) Value: 4.57 PED`,
        {
            stats: {
                lootGroup: {
                    total: 1,
                    count: 1,
                    history: [{
                        time: new Date('2025-01-12 07:47:37'),
                        value: 1
                    }]
                }
            },
            loot: [{
                name: 'Shrapnel',
                quantity: 45745,
                value: 4.57
            }, {
                name: 'Mayhem Token',
                quantity: 1,
                value: 0
            }]
        })
    )

    test('kills seconds', async () => await parseExpect(
`2025-01-15 09:41:22 [System] [] You received Christmas Strongbox x (1) Value: 0.0000 PED
2025-01-15 09:41:23 [System] [] You received Shrapnel x (38231) Value: 3.82 PED`,
        {
            stats: {
                lootGroup: {
                    total: 1,
                    count: 1,
                    history: [{
                        time: new Date('2025-01-15 09:41:22'),
                        value: 1
                    }]
                }
            },
            loot: [{
                name: 'Shrapnel',
                quantity: 38231,
                value: 3.82
            }, {
                name: 'Christmas Strongbox',
                quantity: 1,
                value: 0
            }]
        })
    )

    test('kills separate', async () => await parseExpect(
`2025-01-15 09:41:22 [System] [] You received Christmas Strongbox x (1) Value: 0.0000 PED
2025-01-15 09:42:23 [System] [] You received Shrapnel x (38231) Value: 3.82 PED`,
        {
            stats: {
                lootGroup: {
                    total: 2,
                    count: 2,
                    history: [{
                        time: new Date('2025-01-15 09:42:23'),
                        value: 1
                    }, {
                        time: new Date('2025-01-15 09:41:22'),
                        value: 1
                    }]
                },
            },
            loot: [{
                name: 'Shrapnel',
                quantity: 38231,
                value: 3.82
            }, {
                name: 'Christmas Strongbox',
                quantity: 1,
                value: 0
            }]
        })
    )

    test('repairs', async () => await parseExpect(
`2025-01-21 07:27:10 [System] [] The vehicle's Structural Integrity restored by 29.6
2025-01-21 07:27:10 [System] [] Vehicle took 64.6 points of damage
2025-01-21 07:27:12 [System] [] You restored the vehicle's Structural Integrity by 89.5`,
        {
            stats: {
                youRepaired: { total: 89.5, count: 1, history: [{ time: new Date('2025-01-21 07:27:12'), value: 89.5 }] },
                vehicleDamage: { total: 64.6, count: 1, history: [{ time: new Date('2025-01-21 07:27:10'), value: 64.6 }] },
                vehicleRepaired: { total: 29.6, count: 1, history: [{ time: new Date('2025-01-21 07:27:10'), value: 29.6 }] }
            }
        }
    ))

    test('damage', async () => await parseExpect(
`2025-01-16 07:21:41 [System] [] You inflicted 134.0 points of damage
2025-01-16 07:22:08 [System] [] You took 40.9 points of damage`,
        {
            stats: {
                damageInflicted: { total: 134.0, count: 1, history: [{ time: new Date('2025-01-16 07:21:41'), value: 134.0 }] },
                damageTaken: { total: 40.9, count: 1, history: [{ time: new Date('2025-01-16 07:22:08'), value: 40.9 }] }
            }
        }
    ))

    test('heal', async () => await parseExpect(
`2025-01-16 07:21:38 [System] [] You healed yourself 41.4 points`,
        {
            stats: {
                selfHeal: { total: 41.4, count: 1, history: [{ time: new Date('2025-01-16 07:21:38'), value: 41.4 }] }
            }
        }
    ))

    test('ammo', async () => await parseExpect(
`2025-01-16 07:21:32 [System] [] You received Universal Ammo x (6995622) Value: 699.56 PED`,
        {
            stats: {
                universalAmmo: { total: 699.56, count: 1, history: [{ time: new Date('2025-01-16 07:21:32'), value: 699.56 }] }
            }
        }
    ))

    test('enter vehicle', async () => await parseExpect(
`2025-01-21 08:56:10 [System] [] Top Right Gunner entered the vehicle`,
        {
            event: [{
                time: '2025-01-21 08:56:10',
                action: 'enteredVehicle',
                name: 'Top Right Gunner',
            }],
        }
    ))
})
