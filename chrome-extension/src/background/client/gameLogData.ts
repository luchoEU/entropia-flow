import { keys } from "ts-transformer-keys"

interface GameLogData {
    raw: Array<GameLogLine>
    loot: Array<GameLogLoot>
    team: Array<GameLogTeam>
    tier: Array<GameLogTier>
    skill: Array<GameLogSkill>
    global: Array<GameLogGlobal>
    event: Array<GameLogEvent>
    enhancerBroken: Array<GameLogEnhancerBroken>
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
    enhancerBroken: [],
    stats: {}
})

interface GameLogStats {
    kills?: number
    selfHeal?: number
    damageInflicted?: number
    damageTaken?: number
    reducedCritical?: number
    reducedPiercingDamage?: number
    hitsInflicted?: number
    hitsTaken?: number
    targetEvadedAttack?: number
    targetDodgedAttack?: number
    youEvadedAttack?: number
    youDodgedAttack?: number
    attackMissesYou?: number
}

const gameLogStatsKeys = [
    'kills',
    'selfHeal',
    'damageInflicted',
    'damageTaken',
    'reducedCritical',
    'reducedPiercingDamage',
    'hitsInflicted',
    'hitsTaken',
    'targetEvadedAttack',
    'targetDodgedAttack',
    'youEvadedAttack',
    'youDodgedAttack',
    'attackMissesYou',
];

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
        stats?: GameLogStats
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
