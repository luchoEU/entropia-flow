import { GameLogData, GameLogEnhancerBroken, GameLogEvent, GameLogGlobal, GameLogLine, GameLogLoot, GameLogSkill, GameLogStats, gameLogStatsDecimals, gameLogStatsKeys, GameLogTier, GameLogTrade } from "../../../background/client/gameLogData";
import { GAME_LOG_TABULAR_ENHANCER_BROKEN, GAME_LOG_TABULAR_EVENT, GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GAME_LOG_TABULAR_TIER, GAME_LOG_TABULAR_TRADE, GameLogState } from "../state/log"
import { TabularDefinitions, TabularRawData } from "../state/tabular";
import { TemporalValue } from "../../../common/state";
import { setTabularFilter } from "../actions/tabular";
import { filterExact } from "../../../common/filter";
import { dateToString } from "../../../common/date";

function _separateCamelCase(s: string): string {
    return s
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
        .replace(/^./, char => char.toUpperCase()); // Capitalize the first character
}

const gameLogTabularDefinitions: TabularDefinitions = {
    [GAME_LOG_TABULAR_LOOT]: {
        title: 'Loot',
        subtitle: 'List with your looted items',
        columns: ['Name', 'Quantity', 'Value'],
        getRow: (d: GameLogLoot) => [d.name, d.quantity.toString(), d.value.toFixed(2) + ' PED'],
        getRowForSort: (g: GameLogLoot) => [, g.quantity, g.value],
        getPedValue: (g: GameLogLoot) => g.value
    },
    [GAME_LOG_TABULAR_TIER]: {
        title: 'Tier',
        subtitle: 'List with your tiers reached',
        columns: ['Name', 'Tier'],
        getRow: (d: GameLogTier) => [d.name, d.tier.toFixed(2)],
        getRowForSort: (d: GameLogTier) => [, d.tier],
    },
    [GAME_LOG_TABULAR_SKILL]: {
        title: 'Skill',
        subtitle: 'List with your skills gained',
        columns: ['Name', 'Value'],
        getRow: (d: GameLogSkill) => [d.name, d.value.toFixed(4)],
        getRowForSort: (d: GameLogSkill) => [, d.value],
    },
    [GAME_LOG_TABULAR_ENHANCER_BROKEN]: {
        title: 'Enhancer Broken',
        subtitle: 'List with the Enhancers Broken',
        columns: ['Name', 'Quantity'],
        getRow: (d: GameLogEnhancerBroken) => [dateToString(d.time), d.enhancer, d.item, d.remaining.toString(), d.received.toFixed(2)],
        getRowForSort: (d: GameLogEnhancerBroken) => [,,, d.remaining, d.received],
    },
    [GAME_LOG_TABULAR_GLOBAL]: {
        title: 'Global',
        subtitle: 'List of all globals',
        columns: ['Time', 'Player', 'Name', 'Type', 'Value', 'Location', 'HOF'],
        getRow: (g: GameLogGlobal) => [dateToString(g.time), g.player, g.name, g.type, g.value?.toFixed(0) ?? '0', g.location ?? '', g.isHoF ? '[HoF]' : ''],
        getRowForSort: (g: GameLogGlobal) => [,,,,g.value ?? 0],
    },
    [GAME_LOG_TABULAR_EVENT]: {
        title: 'Events',
        subtitle: 'List of other messages',
        columns: ['Time', 'Action', 'Data'],
        getRow: (g: GameLogEvent) => [dateToString(g.time), { text: _separateCamelCase(g.action), title: g.message }, g.data.toString()],
        getRowForSort: (g: GameLogEvent) => [,_separateCamelCase(g.action)],
    },
    [GAME_LOG_TABULAR_STATISTICS]: {
        title: 'Statistics',
        subtitle: 'List with counters for your game actions',
        columns: ['Name', 'Total', 'Count'],
        getRow: (g: [string, TemporalValue]) => [_separateCamelCase(g[0]), g[1].total.toFixed(gameLogStatsDecimals[g[0]] ?? 0), g[1].count.toString()],
        getRowForSort: (g: [string, TemporalValue]) => [, g[1]],
    },
    [GAME_LOG_TABULAR_MISSING]: {
        title: 'Missing',
        subtitle: 'Messages not recognized, please report them',
        columns: ['Time', 'Channel', 'Message'],
        getRow: (g: GameLogLine) => [dateToString(g.time), g.channel, g.message],
    },
    [GAME_LOG_TABULAR_TRADE]: {
        title: 'Trade',
        subtitle: 'List of trade related messages on chat',
        columns: ['Time', 'Channel', 'Player', 'Message'],
        getRow: (g: GameLogTrade) => [ dateToString(g.time),
            [ g.channel,
                { img: 'img/find.png', title: 'Search by this channel', dispatch: () => setTabularFilter(GAME_LOG_TABULAR_TRADE)(filterExact(g.channel)) } ],
            { maxWidth: 180, sub: [ g.player,
                { img: 'img/find.png', title: 'Search by this player', dispatch: () => setTabularFilter(GAME_LOG_TABULAR_TRADE)(filterExact(g.player)) }] },
            { class: 'trade-item', maxWidth: 400, sub:
                (g.message.match(/\[[^\]]+\]|\s+|[^\[\]\s]+/g) || []).map(t => t.startsWith('[') && t.endsWith(']') ?
                [ t, { img: 'img/find.png', title: 'Search by this item', dispatch: () => setTabularFilter(GAME_LOG_TABULAR_TRADE)(t) } ] : t)}
        ],
        getRowForSort: (g: GameLogTrade) => [, g.channel, g.player, g.message],
    },
    [GAME_LOG_TABULAR_RAW]: {
        title: 'Full log',
        subtitle: 'Raw log, all the entries',
        columns: ['Serial', 'Time', 'Channel', 'Player', 'Message', 'Data'],
        getRow: (g: GameLogLine) => [g.serial.toString(), dateToString(g.time, true), g.channel, g.player, g.message, JSON.stringify(g.data)],
        getRowForSort: (g: GameLogLine) => [g.serial],
    },
}

const gameLogTabularData = (gameLog: GameLogData): TabularRawData => ({
    [GAME_LOG_TABULAR_LOOT]: { items: gameLog.loot },
    [GAME_LOG_TABULAR_TIER]: { items: gameLog.tier },
    [GAME_LOG_TABULAR_SKILL]: { items: gameLog.skill },
    [GAME_LOG_TABULAR_ENHANCER_BROKEN]: { items: gameLog.enhancerBroken },
    [GAME_LOG_TABULAR_GLOBAL]: { items: gameLog.global },
    [GAME_LOG_TABULAR_TRADE]: { items: gameLog.trade },
    [GAME_LOG_TABULAR_EVENT]: { items: gameLog.event },
    [GAME_LOG_TABULAR_STATISTICS]: { items: Object.entries(gameLog.stats) },
    [GAME_LOG_TABULAR_MISSING]: { items: gameLog.raw.filter(d => !d.player && Object.keys(d.data).length === 0) },
    [GAME_LOG_TABULAR_RAW]: { items: gameLog.raw }
})

export {
    gameLogTabularDefinitions,
    gameLogTabularData,
}
