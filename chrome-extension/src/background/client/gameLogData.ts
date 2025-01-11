interface GameLogData {
    raw: Array<GameLogLine>
    loot: Array<GameLogLoot>
    team: Array<GameLogTeam>
    tier: Array<GameLogTier>
    skill: Array<GameLogSkill>
    global: Array<GameLogGlobal>
    event: Array<GameLogEvent>
    stats: GameLogStats
}

const emptyGameLogData = (): GameLogData => ({
    raw: [],
    loot: [],
    team: [],
    tier: [],
    skill: [],
    global: [],
    event: [],
    stats: {}
})

interface GameLogStats {
    kills?: number
    selfHeal?: number
    damageInflicted?: number
    damageTaken?: number
    targetEvadedAttack?: number
    targetDodgedAttack?: number
    youEvadedAttack?: number
    youDodgedAttack?: number
    attackMissesYou?: number
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
        tier?: GameLogTier
        skill?: GameLogSkill
        stats?: GameLogStats
        positions?: GameLogPosition[]
        event?: GameLogEvent
        items?: string[]
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


interface GameLogTier {
    name: string
    tier: number
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

interface GameLogEvent {
    time: string
    name: string
    action: string
}

export {
    GameLogData,
    GameLogLoot,
    GameLogTier,
    GameLogGlobal,
    GameLogSkill,
    GameLogStats,
    GameLogLine,
    GameLogEvent,
    emptyGameLogData,
}
