import { GameLogData, GameLogStats } from "../../../background/client/gameLogData"
import { mergeDeep } from "../../../common/merge"
import { SET_CURRENT_GAME_LOG, setGameLogState } from "../actions/log"
import { setStreamVariables } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/log"
import { getGameLog } from "../selectors/log"
import { GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GameLogState } from "../state/log"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: GameLogState = await api.storage.loadGameLog()
            if (state)
                dispatch(setGameLogState(mergeDeep(initialState, state)))
            break
        }
        case SET_CURRENT_GAME_LOG: {
            const state: GameLogState = getGameLog(getState())
            await api.storage.saveGameLog(state)
            break
        }
    }
    if (action.type === SET_CURRENT_GAME_LOG) {
        const gameLog: GameLogData = action.payload.gameLog
        
        const statsDecimals: GameLogStats = {
            kills: 0,
            selfHeal: 1,
            damageInflicted: 1,
            damageTaken: 1
        }
        const statsVariables = Object.entries(statsDecimals).map(([k, decimals]) => ({ name: k, value: (gameLog.stats[k] || 0).toFixed(decimals)}))
        const statsTabular = Object.entries(gameLog.stats).map(([k, v]) => [k, v.toFixed(statsDecimals[k])])

        dispatch(setTabularData(GAME_LOG_TABULAR_LOOT, gameLog.loot))
        dispatch(setTabularData(GAME_LOG_TABULAR_SKILL, gameLog.skill))
        dispatch(setTabularData(GAME_LOG_TABULAR_GLOBAL, gameLog.global))
        dispatch(setTabularData(GAME_LOG_TABULAR_STATISTICS, statsTabular))
        dispatch(setTabularData(GAME_LOG_TABULAR_MISSING, gameLog.raw.filter(d => !d.player && Object.keys(d.data).length === 0)))
        dispatch(setTabularData(GAME_LOG_TABULAR_RAW, gameLog.raw))

        dispatch(setStreamVariables('gameLog', statsVariables))
    }
}

export default [
    requests
]