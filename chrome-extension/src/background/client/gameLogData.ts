import { TemporalValue } from "../../common/state"

interface GameLogData {
    raw: Array<GameLogLine>
    loot: Array<GameLogLoot>
    team: Array<GameLogTeam>
    tier: Array<GameLogTier>
    skill: Array<GameLogSkill>
    global: Array<GameLogGlobal>
    trade: Array<GameLogTrade>
    event: Array<GameLogEvent>
    enhancerBroken: Array<GameLogEnhancerBroken>
    stats: GameLogStats<TemporalValue>
}

const emptyGameLogData = (): GameLogData => ({
    raw: [],
    loot: [],
    team: [],
    tier: [],
    skill: [],
    global: [],
    trade: [],
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
    "energyMatterResource",
    "kills",
    "lootStats",
    "mineralResource",
    "pickUp",
    "playerWasKilled",
    "reducedCritical",
    "reducedPiercingDamage",
    "selfHeal",
    "targetDodgedAttack",
    "targetEvadedAttack",
    "targetJammedAttack",
    "targetOutOfRange",
    "universalAmmo",
    "vehicleDamage",
    "vehicleRepaired",
    "youDodgedAttack",
    "youEvadedAttack",
    "youHealed",
    "youMissed",
    "youRepaired",
    "youRevived",
    "youWereHealed",
    "youWereKilled",
] as const;
type GameLogStats<T> = {
    [Key in typeof gameLogStatsKeys[number]]?: T
}

const gameLogStatsDecimals: GameLogStats<number> = {
    damageInflicted: 1,
    damageTaken: 1,
    selfHeal: 1,
    universalAmmo: 2,
    vehicleDamage: 1,
    vehicleRepaired: 1,
    youRepaired: 1,
}

interface GameLogGlobal {
    time: number
    player: string
    name: string
    type: string
    value: number
    location?: string
    isHoF: boolean
    isATH: boolean
}

interface GameLogLine {
    serial: number
    time: number
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
        trade?: GameLogTrade
    }
}

interface GameLogTrade {
    serial: number
    time: number
    channel: string
    player: string
    message: string
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
    time: number
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
    time: number
    action: string
    data: string[]
    message: string
}

export {
    GameLogData,
    GameLogLoot,
    GameLogTier,
    GameLogGlobal,
    GameLogPosition,
    GameLogTrade,
    GameLogSkill,
    GameLogEnhancerBroken,
    GameLogStats,
    gameLogStatsKeys,
    gameLogStatsDecimals,
    GameLogLine,
    GameLogEvent,
    emptyGameLogData,
}
