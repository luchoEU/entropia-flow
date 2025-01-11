import { emptyGameLogData, GameLogData } from "./gameLogData"
import GameLogHistory from "./gameLogHistory"
import GameLogParser from "./gameLogParser"

describe('formula parser', () => {
    let gameLogParser: GameLogParser
    let gameLogHistory: GameLogHistory

    beforeEach(async () => {
        gameLogParser = new GameLogParser()
        gameLogHistory = new GameLogHistory()
        gameLogParser.onLine = (s) => gameLogHistory.onLine(s)
    })

    test('team', async () => {
        const log =
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
2024-12-23 17:09:18 [Team] [] Lucho received Animal Adrenal Oil (9)`

        for (var line of log.split('\n')) {
            await gameLogParser.onMessage(line)
        }

        const expected: GameLogData = {
            ...emptyGameLogData(),
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
            }]
        }
        expect({ ...gameLogHistory.getGameLog(), raw: [] }).toEqual(expected)
    })

    test('global', async () => {
        const line = '2025-01-11 12:38:08 [Globals] [] Lucho MUCHO Ireton killed a creature (Merry Annihilation Daikiba 08) with a value of 57 PED!'
        await gameLogParser.onMessage(line)

        const expected: GameLogData = {
            ...emptyGameLogData(),
            global: [{
                time: '2025-01-11 12:38:08',
                player: 'Lucho MUCHO Ireton',
                name: 'Merry Annihilation Daikiba 08',
                type: 'hunt',
                value: 57,
                isHoF: false
            }]
        }
        expect({ ...gameLogHistory.getGameLog(), raw: [] }).toEqual(expected)
    })
})
