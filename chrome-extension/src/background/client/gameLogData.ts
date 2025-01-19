interface GameLogData {
    raw: Array<GameLogLine>
    loot: Array<GameLogLoot>
    team: Array<GameLogTeam>
    tier: Array<GameLogTier>
    skill: Array<GameLogSkill>
    global: Array<GameLogGlobal>
    event: Array<GameLogEvent>
    enhancerBroken: Array<GameLogEnhancerBroken>
    stats: GameLogStats<number>
}

const emptyGameLogData = (): GameLogData => ({
    raw: [],
    loot: [],
    team: [],
    tier: [],
    skill: [],
    global: [],
    event: [],
    enhancerBroken: [],
    stats: {}
})

const gameLogStatsKeys = [
    "attackMissesYou",
    "criticalInflicted",
    "criticalTaken",
    "damageDeflected",
    "damageInflicted",
    "damageTaken",
    "hitsInflicted",
    "hitsTaken",
    "lootCount",
    "reducedCritical",
    "reducedPiercingDamage",
    "selfHeal",
    "targetDodgedAttack",
    "targetEvadedAttack",
    "universalAmmo",
    "youDodgedAttack",
    "youEvadedAttack",
    "youRevived",
    "youWereKilled",
] as const;
type GameLogStats<T> = {
    [Key in typeof gameLogStatsKeys[number]]?: T
}

interface GameLogGlobal {
    time: string
    player: string
    name: string
    type: string
    value: number
    location?: string
    isHoF: boolean
}

interface GameLogLine {
    serial: number
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
        stats?: GameLogStats<number>
        positions?: GameLogPosition[]
        event?: GameLogEvent
        enhancerBroken?: GameLogEnhancerBroken
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

interface GameLogEnhancerBroken {
    time: string
    enhancer: string
    item: string
    remaining: number,
    received: number,
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
    GameLogEnhancerBroken,
    GameLogStats,
    gameLogStatsKeys,
    GameLogLine,
    GameLogEvent,
    emptyGameLogData,
}
