import { GameLogData } from "../../../background/client/gameLogData"
import { mergeDeep } from "../../../common/merge"
import { SET_CURRENT_GAME_LOG, setGameLogState } from "../actions/log"
import { setStreamVariables } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/log"
import { setTabularDefinitions } from "../helpers/tabular"
import { getGameLog } from "../selectors/log"
import { GAME_LOG_TABULAR_ENHANCER_BRAKE, GAME_LOG_TABULAR_EVENT, GAME_LOG_TABULAR_GLOBAL, GAME_LOG_TABULAR_LOOT, GAME_LOG_TABULAR_MISSING, GAME_LOG_TABULAR_RAW, GAME_LOG_TABULAR_SKILL, GAME_LOG_TABULAR_STATISTICS, GAME_LOG_TABULAR_TIER, GameLogState } from "../state/log"
import { gameLogTabularDefinitions, gameLogVariables } from "../tabular/log"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            setTabularDefinitions(gameLogTabularDefinitions)
            const state: GameLogState = await api.storage.loadGameLog()
            if (state)
                dispatch(setGameLogState(mergeDeep(initialState, state)))
            break
        }
        case SET_CURRENT_GAME_LOG: {
            const state: GameLogState = getGameLog(getState())
            await api.storage.saveGameLog(state)

            const gameLog: GameLogData = action.payload.gameLog

            dispatch(setTabularData(GAME_LOG_TABULAR_LOOT, gameLog.loot))
            dispatch(setTabularData(GAME_LOG_TABULAR_TIER, gameLog.tier))
            dispatch(setTabularData(GAME_LOG_TABULAR_SKILL, gameLog.skill))
            dispatch(setTabularData(GAME_LOG_TABULAR_ENHANCER_BRAKE, gameLog.enhancerBrake))
            dispatch(setTabularData(GAME_LOG_TABULAR_GLOBAL, gameLog.global))
            dispatch(setTabularData(GAME_LOG_TABULAR_EVENT, gameLog.event))
            dispatch(setTabularData(GAME_LOG_TABULAR_STATISTICS, Object.entries(gameLog.stats)))
            dispatch(setTabularData(GAME_LOG_TABULAR_MISSING, gameLog.raw.filter(d => !d.player && Object.keys(d.data).length === 0)))
            dispatch(setTabularData(GAME_LOG_TABULAR_RAW, gameLog.raw))

            dispatch(setStreamVariables('gameLog', gameLogVariables(gameLog)))
            break
        }
    }
}

export default [
    requests
]
