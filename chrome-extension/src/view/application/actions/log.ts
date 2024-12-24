import { GameLogData } from "../../../background/client/gameLogData"
import { GameLogState } from "../state/log"

const SET_GAME_LOG_STATE = "[log] set state"
const SET_CURRENT_GAME_LOG = "[log] set current log"
const SET_GAME_LOOT_EXPANDED = "[log] loot expanded"
const SET_GAME_SKILL_EXPANDED = "[log] skill expanded"
const SET_GAME_GLOBAL_EXPANDED = "[log] global expanded"
const SET_GAME_STATS_EXPANDED = "[log] stats expanded"
const SET_GAME_LOG_EXPANDED = "[log] full log expanded"
const SORT_LOOT_BY = "[log] sort"

const setGameLogState = (gameLog: GameLogState) => ({
    type: SET_GAME_LOG_STATE,
    payload: {
        gameLog
    }
})

const setCurrentGameLog = (gameLog: GameLogData) => ({
    type: SET_CURRENT_GAME_LOG,
    payload: {
        gameLog
    }
})

const setGameLogLootExpanded = (expanded: boolean) => ({
    type: SET_GAME_LOOT_EXPANDED,
    payload: {
        expanded
    }
})

const setGameLogSkillExpanded = (expanded: boolean) => ({
    type: SET_GAME_SKILL_EXPANDED,
    payload: {
        expanded
    }
})

const setGameLogGlobalExpanded = (expanded: boolean) => ({
    type: SET_GAME_GLOBAL_EXPANDED,
    payload: {
        expanded
    }
})

const setGameLogStatsExpanded = (expanded: boolean) => ({
    type: SET_GAME_STATS_EXPANDED,
    payload: {
        expanded
    }
})

const setGameFullLogExpanded = (expanded: boolean) => ({
    type: SET_GAME_LOG_EXPANDED,
    payload: {
        expanded
    }
})

const sortLootBy = (part: number) => ({
    type: SORT_LOOT_BY,
    payload: {
        part
    }
})

export {
    SET_GAME_LOG_STATE,
    SET_CURRENT_GAME_LOG,
    SET_GAME_LOOT_EXPANDED,
    SET_GAME_SKILL_EXPANDED,
    SET_GAME_GLOBAL_EXPANDED,
    SET_GAME_STATS_EXPANDED,
    SET_GAME_LOG_EXPANDED,
    SORT_LOOT_BY,
    setGameLogState,
    setCurrentGameLog,
    setGameFullLogExpanded,
    setGameLogStatsExpanded,
    setGameLogLootExpanded,
    setGameLogSkillExpanded,
    setGameLogGlobalExpanded,
    sortLootBy
}
