import { GameLogData, GameLogEnhancerBroken, GameLogEvent, GameLogGlobal, GameLogLine, GameLogLoot, GameLogSkill, GameLogStats, gameLogStatsDecimals, gameLogStatsKeys, GameLogTier } from "../../../background/client/gameLogData";
import { GAME_LOG_TABULAR_ENHANCER_BROKEN, GAME_LOG_TABULAR_EVENT, GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GAME_LOG_TABULAR_TIER, GameLogState } from "../state/log"
import { TabularDefinitions, TabularRawData } from "../state/tabular";
import { StreamVariable } from "../state/stream";

function _separateCamelCase(s: string): string {
    return s
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
        .replace(/^./, char => char.toUpperCase()); // Capitalize the first character
}

const gameLogTabularDefinitions: TabularDefinitions = {
    [GAME_LOG_TABULAR_LOOT]: {
        title: 'Loot',
        columns: ['Name', 'Quantity', 'Value'],
        getRow: (d: GameLogLoot) => [d.name, d.quantity.toString(), d.value.toFixed(2) + ' PED'],
        getRowForSort: (g: GameLogLoot) => [, g.quantity, g.value],
        getPedValue: (g: GameLogLoot) => g.value
    },
    [GAME_LOG_TABULAR_TIER]: {
        title: 'Tier',
        columns: ['Name', 'Tier'],
        getRow: (d: GameLogTier) => [d.name, d.tier.toFixed(2)],
        getRowForSort: (d: GameLogTier) => [, d.tier],
    },
    [GAME_LOG_TABULAR_SKILL]: {
        title: 'Skill',
        columns: ['Name', 'Value'],
        getRow: (d: GameLogSkill) => [d.name, d.value.toFixed(4)],
        getRowForSort: (d: GameLogSkill) => [, d.value],
    },
    [GAME_LOG_TABULAR_ENHANCER_BROKEN]: {
        title: 'Enhancer Broken',
        columns: ['Name', 'Quantity'],
        getRow: (d: GameLogEnhancerBroken) => [d.time, d.enhancer, d.item, d.remaining.toString(), d.received.toFixed(2)],
        getRowForSort: (d: GameLogEnhancerBroken) => [,,, d.remaining, d.received],
    },
    [GAME_LOG_TABULAR_GLOBAL]: {
        title: 'Global',
        columns: ['Time', 'Player', 'Name', 'Type', 'Value', 'Location', 'HOF'],
        getRow: (g: GameLogGlobal) => [g.time, g.player, g.name, g.type, g.value.toFixed(0), g.location , g.isHoF ? '[HoF]' : ''],
        getRowForSort: (g: GameLogGlobal) => [,,,,g.value,,],
    },
    [GAME_LOG_TABULAR_EVENT]: {
        title: 'Events',
        columns: ['Time', 'Name', 'Action'],
        getRow: (g: GameLogEvent) => [g.time, g.name, _separateCamelCase(g.action)],
    },
    [GAME_LOG_TABULAR_STATISTICS]: {
        title: 'Statistics',
        columns: ['Name', 'Value'],
        getRow: (g: [string, number]) => [_separateCamelCase(g[0]), g[1].toFixed(gameLogStatsDecimals[g[0]] ?? 0)],
        getRowForSort: (g: [string, number]) => [, g[1]],
    },
    [GAME_LOG_TABULAR_MISSING]: {
        title: 'Missing',
        columns: ['Time', 'Channel', 'Message'],
        getRow: (g: GameLogLine) => [g.time, g.channel, g.message],
    },
    [GAME_LOG_TABULAR_RAW]: {
        title: 'Full log',
        columns: ['Serial', 'Time', 'Channel', 'Player', 'Message', 'Data'],
        getRow: (g: GameLogLine) => [g.serial.toString(), g.time, g.channel, g.player, g.message, JSON.stringify(g.data)],
        getRowForSort: (g: GameLogLine) => [g.serial],
    },
}

const gameLogTabularData = (gameLog: GameLogData): TabularRawData => ({
    [GAME_LOG_TABULAR_LOOT]: gameLog.loot,
    [GAME_LOG_TABULAR_TIER]: gameLog.tier,
    [GAME_LOG_TABULAR_SKILL]: gameLog.skill,
    [GAME_LOG_TABULAR_ENHANCER_BROKEN]: gameLog.enhancerBroken,
    [GAME_LOG_TABULAR_GLOBAL]: gameLog.global,
    [GAME_LOG_TABULAR_EVENT]: gameLog.event,
    [GAME_LOG_TABULAR_STATISTICS]: Object.entries(gameLog.stats),
    [GAME_LOG_TABULAR_MISSING]: gameLog.raw.filter(d => !d.player && Object.keys(d.data).length === 0),
    [GAME_LOG_TABULAR_RAW]: gameLog.raw
})

const gameLogVariables = (gameLog: GameLogData): StreamVariable[] => {    
    const teamPlayers = Array.from(new Set(gameLog.team.map(d => d.player))).sort()
    const teamLoot = Object.entries(gameLog.team.reduce((acc, t) => {
        acc[t.name] = acc[t.name] || new Array(teamPlayers.length).fill(0);
        acc[t.name][teamPlayers.indexOf(t.player)] += t.quantity;
        return acc;
    }, { } as {[name: string]: number[]}))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => ({ name: k, quantity: v }))

    const variables: StreamVariable[] = gameLogStatsKeys
        .map(k => ({ name: k.toString(), value: (gameLog.stats?.[k] ?? 0).toFixed(gameLogStatsDecimals[k] ?? 0)}));
    variables.push({ name: 'team', value: { players: teamPlayers, loot: teamLoot } })
    return variables
}

export {
    gameLogTabularDefinitions,
    gameLogVariables,
    gameLogTabularData,
}
