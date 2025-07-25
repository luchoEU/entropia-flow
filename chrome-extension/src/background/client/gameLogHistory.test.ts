import { gameTime } from "../../common/date"
import { emptyGameLogData, GameLogData } from "./gameLogData"
import GameLogHistory from "./gameLogHistory"
import GameLogParser from "./gameLogParser"

describe('formula parser', () => {
    let gameLogParser: GameLogParser
    let gameLogHistory: GameLogHistory

    beforeEach(() => {
        gameLogParser = new GameLogParser()
        gameLogHistory = new GameLogHistory()
        gameLogParser.onLines = (lines) => gameLogHistory.onLines(lines)
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
                kills: { total: 2, count: 2, history: [{ time: gameTime('2024-12-23 17:09:18'), value: 1 }, { time: gameTime('2024-12-23 17:08:58'), value: 1 }] }
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
                isHoF: false,
                isATH: false
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
                isHoF: true,
                isATH: false
            }]
        })
    )
    
    test('kills', async () => await parseExpect(
`2025-01-12 07:47:37 [#cyrene_rangers] [Rattler Llama Simpsons] omw
2025-01-12 07:47:37 [System] [] You received Mayhem Token x (1) Value: 0.0000 PED
2025-01-12 07:47:37 [System] [] You received Shrapnel x (45745) Value: 4.57 PED`,
        {
            stats: {
                kills: {
                    total: 1,
                    count: 1,
                    history: [{
                        time: gameTime('2025-01-12 07:47:37'),
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
                kills: {
                    total: 1,
                    count: 1,
                    history: [{
                        time: gameTime('2025-01-15 09:41:22'),
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
                kills: {
                    total: 2,
                    count: 2,
                    history: [{
                        time: gameTime('2025-01-15 09:42:23'),
                        value: 1
                    }, {
                        time: gameTime('2025-01-15 09:41:22'),
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
                youRepaired: { total: 89.5, count: 1, history: [{ time: gameTime('2025-01-21 07:27:12'), value: 89.5 }] },
                vehicleDamage: { total: 64.6, count: 1, history: [{ time: gameTime('2025-01-21 07:27:10'), value: 64.6 }] },
                vehicleRepaired: { total: 29.6, count: 1, history: [{ time: gameTime('2025-01-21 07:27:10'), value: 29.6 }] }
            }
        }
    ))

    test('damage', async () => await parseExpect(
`2025-01-16 07:21:41 [System] [] You inflicted 134.0 points of damage
2025-01-16 07:22:08 [System] [] You took 40.9 points of damage`,
        {
            stats: {
                damageInflicted: { total: 134.0, count: 1, history: [{ time: gameTime('2025-01-16 07:21:41'), value: 134.0 }] },
                damageTaken: { total: 40.9, count: 1, history: [{ time: gameTime('2025-01-16 07:22:08'), value: 40.9 }] }
            }
        }
    ))

    test('heal', async () => await parseExpect(
`2025-01-16 07:21:38 [System] [] You healed yourself 41.4 points`,
        {
            stats: {
                selfHeal: { total: 41.4, count: 1, history: [{ time: gameTime('2025-01-16 07:21:38'), value: 41.4 }] }
            }
        }
    ))

    test('ammo', async () => await parseExpect(
`2025-01-16 07:21:32 [System] [] You received Universal Ammo x (6995622) Value: 699.56 PED`,
        {
            stats: {
                universalAmmo: { total: 699.56, count: 1, history: [{ time: gameTime('2025-01-16 07:21:32'), value: 699.56 }] }
            }
        }
    ))

    test('enter vehicle', async () => await parseExpect(
`2025-01-21 08:56:10 [System] [] Top Right Gunner entered the vehicle`,
        {
            event: [{
                time: '2025-01-21 08:56:10',
                action: 'enteredVehicle',
                data: ['Top Right Gunner'],
                message: 'Top Right Gunner entered the vehicle'
            }],
        }
    ))

    test('mineral resource', async () => await parseExpect(
`2025-01-27 06:41:45 [System] [] You received Mineral Resource Deed x (1) Value: 0.0000 PED`,
        {
            stats: {
                mineralResource: { total: 0, count: 1, history: [{ time: gameTime('2025-01-27 06:41:45'), value: 0 }] }
            }
        }
    ))

    test('energy matter resource', async () => await parseExpect(
`2025-01-27 06:49:55 [System] [] You received Energy Matter Resource Deed x (1) Value: 0.0000 PED`,
        {
            stats: {
                energyMatterResource: { total: 0, count: 1, history: [{ time: gameTime('2025-01-27 06:49:55'), value: 0 }] }
            }
        }
    ))

    test('new rank', async () => await parseExpect(
`2025-01-28 19:56:15 [System] [] You have gained 0.3984 experience in your Mining Laser Operator skill
2025-01-28 19:56:15 [System] [] You have gained a new rank in Mining Laser Operator!`,
        {
            skill: [{
                name: 'Mining Laser Operator',
                value: 0.3984
            }],
            event: [{
                action: 'newRank',
                data: ['Mining Laser Operator'],
                time: '2025-01-28 19:56:15',
                message: 'You have gained a new rank in Mining Laser Operator!'
            }]
        }
    ))

    test('discovery', async () => await parseExpect(
`2025-01-28 21:20:43 [Globals] [] Nanashana Nana Itsanai is the first colonist to discover Genesis Star Ivaldi III (L) Blueprint (L)! A record has been added to the Hall of Fame!`,
        {
            global: [{
                time: '2025-01-28 21:20:43',
                type: 'discover',
                player: 'Nanashana Nana Itsanai',
                name: 'Genesis Star Ivaldi III (L) Blueprint (L)',
                value: undefined,
                isHoF: true,
                isATH: false
            }]
        }
    ))

    test('person not wounded', async () => await parseExpect(
`2025-01-29 06:55:35 [System] [] That person isn't wounded`,
        {
            event: [{
                time: '2025-01-29 06:55:35',
                action: 'personNotWounded',
                data: [],
                message: 'That person isn\'t wounded'
            }]
        }
    ))

    test('destroyed', async () => await parseExpect(
`2025-01-29 07:56:23 [System] [] Quad-Wing Interceptor (L) was destroyed by the tough Pirate Shank Outcast`,
        {
            event: [{
                time: '2025-01-29 07:56:23',
                action: 'destroyed',
                data: ['Quad-Wing Interceptor (L)', 'Pirate Shank Outcast'],
                message: 'Quad-Wing Interceptor (L) was destroyed by the tough Pirate Shank Outcast'
            }]
        }
    ))

    test ('defeated', async () => await parseExpect(
`2025-01-29 07:54:24 [Globals] [] Kathrynn Katy Simmons defeated 15 others as a Yule Daudaormur ! A record has been added to the Hall of Fame!`,
        {
            global: [{
                time: '2025-01-29 07:54:24',
                type: 'defeated',
                player: 'Kathrynn Katy Simmons',
                name: 'Yule Daudaormur',
                value: 15,
                isHoF: true,
                isATH: false
            }]
        }
    ))

    test('item damaged', async () => await parseExpect(
`2025-01-29 16:31:00 [System] [] The item is damaged`,
        {
            event: [{
                time: '2025-01-29 16:31:00',
                action: 'itemDamaged',
                data: [],
                message: 'The item is damaged'
            }]
        }
    ))

    test('new skill', async () => await parseExpect(
`2025-02-13 18:56:50 [System] [] Congratulations, you have acquired a new skill; Integrity Analysis`,
        {
            event: [{
                time: '2025-02-13 18:56:50',
                action: 'newSkill',
                data: [ 'Integrity Analysis' ],
                message: 'Congratulations, you have acquired a new skill; Integrity Analysis'
            }]
        }
    ))

    test('auction created', async () => await parseExpect(
`2025-02-15 16:13:30 [System] [] Auction successfully created`,
        {
            event: [{
                time: '2025-02-15 16:13:30',
                action: 'auctionCreated',
                data: [ ],
                message: 'Auction successfully created'
            }]
        }
    ))

    test('vehicle to storage', async () => await parseExpect(
`2025-02-15 17:18:15 [System] [] The vehicle (Scavenged Skyripper (L)) is returned to planet storage, where you can recover it`,
        {
            event: [{
                time: '2025-02-15 17:18:15',
                action: 'vehicleRecovered',
                data: [ 'Scavenged Skyripper (L)' ],
                message: 'The vehicle (Scavenged Skyripper (L)) is returned to planet storage, where you can recover it'
            }]
        }
    ))

    test('ignore complete as loot group', async () => await parseExpect(
`2025-02-18 07:53:42 [System] [] You received Blazar Fragment x (200) Value: 0.0020 PED
2025-02-18 07:53:42 [System] [] Mission completed (GenStar Mining Initiative - Asteroids)
2025-02-18 07:53:42 [System] [] You received Recycling Scrip x (1) Value: 0.0100 PED`,
        {
            loot: [
                {name:"Recycling Scrip",quantity:1,value:0.01},
                {name:"Blazar Fragment",quantity:200,value:0.002}
            ],
            event: [{
                time: '2025-02-18 07:53:42',
                action: 'missionCompleted',
                data: [ 'GenStar Mining Initiative - Asteroids' ],
                message: 'Mission completed (GenStar Mining Initiative - Asteroids)'
            }]
        }
    ))

    test('stone, no kill', async () => await parseExpect(
`2025-03-02 06:48:04 [System] [] You received Brukite x (48) Value: 0.0004 PED`,
        {
            loot: [
                {name:"Brukite",quantity:48,value:0.0004}
            ]
        }
    ))
    
    test('fruit, no kill', async () => await parseExpect(
`2025-03-02 07:08:01 [System] [] You received Caroot x (26) Value: 0.0002 PED`,
        {
            loot: [
                {name:"Caroot",quantity:26,value:0.0002}
            ]
        }
    ))

    test('enhancer broken, no kill', async () => await parseExpect(
`2025-03-02 07:20:50 [System] [] You received Shrapnel x (8000) Value: 0.8000 PED
2025-03-02 07:20:50 [System] [] Your enhancer Weapon Damage Enhancer 2 on your ArMatrix BP-65 (L) broke. You have 4 enhancers remaining on the item. You received 0.8000 PED Shrapnel.`,
        {
            enhancerBroken: [{
                enhancer: "Weapon Damage Enhancer 2",
                item: "ArMatrix BP-65 (L)",
                received: 0.8,
                remaining: 4,
                time: "2025-03-02 07:20:50",
            }],
            loot: [
                {name:"Shrapnel",quantity:8000,value:0.8}
            ]
        }
    ))

    test('healed', async () => await parseExpect(
`2025-03-04 21:16:29 [System] [] You were healed 54.0 points by .sGC) Zoka`,
        {
            stats: {
                youWereHealed: { total: 54.0, count: 1, history: [{ time: gameTime('2025-03-04 21:16:29'), value: 54.0 }] }
            }
        }
    ))

    test('request sent', async () => await parseExpect(
`2025-03-04 21:26:22 [System] [] Request sent`,
        {
            event: [{
                time: '2025-03-04 21:26:22',
                action: 'requestSent',
                data: [ ],
                message: 'Request sent'
            }]
        }
    ))

    test('healing decreased', async () => await parseExpect(
`2025-03-09 06:36:59 [System] [] Healing was decreased by 10.0% by an Effect Over Time`,
        {
            event: [{
                time: '2025-03-09 06:36:59',
                action: 'healingDecreased',
                data: [ '10.0%' ],
                message: 'Healing was decreased by 10.0% by an Effect Over Time'
            }]
        }
    ))

    test('concentration affected', async () => await parseExpect(
`2025-03-15 08:56:53 [System] [] Mindforce concentration was affected due to being hit`,
        {
            event: [{
                time: '2025-03-15 08:56:53',
                action: 'concentrationAffected',
                data: [ ],
                message: 'Mindforce concentration was affected due to being hit'
            }]
        }
    ))

    test('you are not wounded', async () => await parseExpect(
`2025-03-15 08:53:19 [System] [] You are not wounded`,
        {
            event: [{
                time: '2025-03-15 08:53:19',
                action: 'youNotWounded',
                data: [ ],
                message: 'You are not wounded'
            }]
        }
    ))

    test('you healed', async () => await parseExpect(
`2025-03-15 08:56:53 [System] [] You healed wackadoodle wackadoodle wackadoodle with 40.3 points`,
        {
            stats: {
                youHealed: { total: 40.3, count: 1, history: [{ time: gameTime('2025-03-15 08:56:53'), value: 40.3 }] }
            }
        }
    ))

    test('killed', async () => await parseExpect(
`2025-03-15 20:03:10 [System] [] Nicholas Looser EnterGate killed Lucho MUCHO Ireton using a A&P Series Mayhem LP-100, Modified
2025-03-15 20:03:07 [System] [] Nicholas Looser EnterGate destroyed Scavenged Skyripper (L)`,
        {
            event: [{
                time: '2025-03-15 20:03:07',
                action: 'playerDestroyed',
                data: ['Nicholas Looser EnterGate', 'Scavenged Skyripper (L)'],
                message: 'Nicholas Looser EnterGate destroyed Scavenged Skyripper (L)'
            }, {
                time: '2025-03-15 20:03:10',
                action: 'playerKilled',
                data: ['Nicholas Looser EnterGate', 'Lucho MUCHO Ireton', 'A&P Series Mayhem LP-100, Modified'],
                message: 'Nicholas Looser EnterGate killed Lucho MUCHO Ireton using a A&P Series Mayhem LP-100, Modified'
            }]
        }
    ))

    test('ath', async () => await parseExpect(
`2025-03-27 12:32:37 [Globals] [] Daniel Danutu07 Ionut killed a creature (Sampling: TZ-15) with a value of 67638 PED! A record has been added to the Hall of Fame ALL TIME HIGH. Congratulations!`,
        {
            global: [{
                time: '2025-03-27 12:32:37',
                player: 'Daniel Danutu07 Ionut',
                name: 'Sampling: TZ-15',
                type: 'hunt',
                value: 67638,
                isHoF: false,
                isATH: true
            }]
        }
    ))
})
