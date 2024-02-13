import { LootLogData } from "../../../background/client/logData"
import { GameLogState } from "../state/log"

const SET_GAME_LOG_STATE = "[log] set state"
const SET_CURRENT_GAME_LOG = "[log] set current"
const SET_GAME_LOG_EXPANDED = "[log] loot expanded"
const SORT_LOOT_BY = "[log] sort"

const setGameLogState = (gameLog: GameLogState) => ({
    type: SET_GAME_LOG_STATE,
    payload: {
        gameLog
    }
})

const setCurrentGameLog = (gameLog: Array<LootLogData>) => ({
    type: SET_CURRENT_GAME_LOG,
    payload: {
        gameLog
    }
})

const setGameLogLootExpanded = (expanded: boolean) => ({
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
    SET_GAME_LOG_EXPANDED,
    SORT_LOOT_BY,
    setGameLogState,
    setCurrentGameLog,
    setGameLogLootExpanded,
    sortLootBy
}
