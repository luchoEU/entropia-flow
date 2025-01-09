import { GameLogData, GameLogEvent, GameLogGlobal, GameLogLine, GameLogLoot, GameLogSkill, GameLogStats, GameLogTier } from "../../../background/client/gameLogData"
import { mergeDeep } from "../../../common/merge"
import { SET_CURRENT_GAME_LOG, setGameLogState } from "../actions/log"
import { setStreamVariables } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/log"
import { setTabularDefinitions } from "../helpers/tabular"
import { getGameLog } from "../selectors/log"
import { GAME_LOG_TABULAR_EVENT, GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GAME_LOG_TABULAR_TIER, GameLogState } from "../state/log"
import { TabularDefinitions } from "../state/tabular"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            setTabularDefinitions(_tabularDefinitions)
            const state: GameLogState = await api.storage.loadGameLog()
            if (state)
                dispatch(setGameLogState(mergeDeep(initialState, state)))
            break
        }
        case SET_CURRENT_GAME_LOG: {
            const state: GameLogState = getGameLog(getState())
            await api.storage.saveGameLog(state)

            const gameLog: GameLogData = action.payload.gameLog

            const statsDecimals: GameLogStats = {
                selfHeal: 1,
                damageInflicted: 1,
                damageTaken: 1,
            }
            const statsTabular = Object.entries(gameLog.stats).map(([k, v]) => [k, v.toFixed(statsDecimals[k] ?? 0)])

            dispatch(setTabularData(GAME_LOG_TABULAR_LOOT, gameLog.loot))
            dispatch(setTabularData(GAME_LOG_TABULAR_TIER, gameLog.tier))
            dispatch(setTabularData(GAME_LOG_TABULAR_SKILL, gameLog.skill))
            dispatch(setTabularData(GAME_LOG_TABULAR_GLOBAL, gameLog.global))
            dispatch(setTabularData(GAME_LOG_TABULAR_EVENT, gameLog.event))
            dispatch(setTabularData(GAME_LOG_TABULAR_STATISTICS, statsTabular))
            dispatch(setTabularData(GAME_LOG_TABULAR_MISSING, gameLog.raw.filter(d => !d.player && Object.keys(d.data).length === 0)))
            dispatch(setTabularData(GAME_LOG_TABULAR_RAW, gameLog.raw))

            gameLog.team = [{
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

            const teamPlayers = Array.from(new Set(gameLog.team.map(d => d.player))).sort()
            const teamLoot = Object.entries(gameLog.team.reduce((acc, t) => {
                acc[t.name] = acc[t.name] || new Array(teamPlayers.length).fill(0);
                acc[t.name][teamPlayers.indexOf(t.player)] += t.quantity;
                return acc;
            }, { } as {[name: string]: number[]}))
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => ({ name: k, quantity: v }))

            const statsVariables = Object.entries(statsDecimals).map(([k, decimals]) => ({ name: k, value: (gameLog.stats[k] || 0).toFixed(decimals)}))
            statsVariables.push({ name: 'team', value: { players: teamPlayers, loot: teamLoot } })
            dispatch(setStreamVariables('gameLog', statsVariables))
            break
        }
    }
}

const _tabularDefinitions: TabularDefinitions = {
    [GAME_LOG_TABULAR_LOOT]: {
        title: 'Loot',
        columns: ['Name', 'Quantity', 'Value'],
        getRow: (d: GameLogLoot) => [d.name, d.quantity.toString(), d.value.toFixed(2) + ' PED'],
        getRowForSort: (g: GameLogLoot) => [, g.quantity, g.value],
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
    [GAME_LOG_TABULAR_GLOBAL]: {
        title: 'Global',
        columns: ['Time', 'Player', 'Name', 'Type', 'Value'],
        getRow: (g: GameLogGlobal) => [g.time, g.player, g.name, g.type, g.value + (g.isHoF ? ' [HoF]' : '')],
    },
    [GAME_LOG_TABULAR_EVENT]: {
        title: 'Events',
        columns: ['Time', 'Name', 'Action'],
        getRow: (g: GameLogEvent) => [g.time, g.name, g.action],
    },
    [GAME_LOG_TABULAR_STATISTICS]: {
        title: 'Statistics',
        columns: ['Name', 'Value'],
        getRow: (g: string[]) => g,
    },
    [GAME_LOG_TABULAR_MISSING]: {
        title: 'Missing',
        columns: ['Time', 'Channel', 'Message'],
        getRow: (g: GameLogLine) => [g.time, g.channel, g.message],
    },
    [GAME_LOG_TABULAR_RAW]: {
        title: 'Full log',
        columns: ['Time', 'Channel', 'Player', 'Message', 'Data'],
        getRow: (g: GameLogLine) => [g.time, g.channel, g.player, g.message, JSON.stringify(g.data)]
    },
}

export default [
    requests
]