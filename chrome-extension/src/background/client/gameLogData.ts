interface GameLogData {
    raw: Array<GameLogLine>
    loot: Array<GameLogLoot>
    team: Array<GameLogTeam>
    skill: Array<GameLogSkill>
    global: Array<GameLogGlobal>
    stats: GameLogStats
}

const emptyGameLogData: GameLogData = {
    raw: [],
    loot: [],
    team: [],
    skill: [],
    global: [],
    stats: {}
}

interface GameLogStats {
    kills?: number
    selfHeal?: number
    damageInflicted?: number
    damageTaken?: number
}

interface GameLogGlobal {
    time: string
    player: string
    name: string
    type: string
    value: string
    isHoF: boolean
}

interface GameLogLine {
    time: string
    channel: string
    player: string
    message: string
    data: {
        loot?: GameLogLoot
        team?: GameLogTeam
        global?: GameLogGlobal
        skill?: GameLogSkill
        stats?: GameLogStats
        positions?: GameLogPosition[]
        items?: string[]
        login?: string
        logout?: string
    }
}

interface GameLogLoot {
    name: string
    quantity: number
    value: number
}

interface GameLogTeam {
    player: string
    name: string
    quantity: number
}

interface GameLogSkill {
    name: string
    value: number
}

interface GameLogPosition {
    planet: string
    x: number
    y: number
    z: number
    name: string
}

export {
    GameLogData,
    GameLogLoot,
    GameLogGlobal,
    GameLogSkill,
    GameLogStats,
    GameLogLine,
    emptyGameLogData,
}
