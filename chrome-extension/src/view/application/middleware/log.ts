import { GameLogData } from "../../../background/client/gameLogData"
import { mergeDeep } from "../../../common/merge"
import { SET_CURRENT_GAME_LOG, setGameLogState } from "../actions/log"
import { setStreamVariables } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/log"
import { setTabularDefinitions } from "../helpers/tabular"
import { getGameLog } from "../selectors/log"
import { GameLogState } from "../state/log"
import { gameLogStatsVariables, gameLogTabularData, gameLogTabularDefinitions, gameLogVariables } from "../tabular/log"

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
            dispatch(setTabularData(gameLogTabularData(gameLog)))
            dispatch(setStreamVariables('gameLog', gameLogVariables(gameLog)))
            dispatch(setStreamVariables('gameLogStats', gameLogStatsVariables(gameLog)))
            break
        }
    }
}

export default [
    requests
]
