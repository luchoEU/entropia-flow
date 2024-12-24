interface GameLogData {
    raw: Array<GameLogLine>
    loot: Array<GameLogLoot>
    skill: Array<GameLogSkill>
    global: Array<GameLogGlobal>
    stats: GameLogStats
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
        global?: GameLogGlobal
        skill?: GameLogSkill
        stats?: GameLogStats
    }
}

interface GameLogLoot {
    player?: string
    name: string
    quantity: number
    value?: number
}

interface GameLogSkill {
    name: string
    value: number
}

export {
    GameLogData,
    GameLogGlobal,
    GameLogSkill,
    GameLogLine
}