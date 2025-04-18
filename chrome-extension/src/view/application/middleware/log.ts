import { GameLogData } from "../../../background/client/gameLogData"
import { mergeDeep } from "../../../common/merge"
import { SET_CURRENT_GAME_LOG, setGameLogState } from "../actions/log"
import { setStreamTemporalVariables, setStreamVariables } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { AppAction } from "../slice/app"
import { initialState } from "../helpers/log"
import { setTabularDefinitions } from "../helpers/tabular"
import { getGameLog } from "../selectors/log"
import { getSettings } from "../selectors/settings"
import { GameLogState } from "../state/log"
import { FEATURE_CLIENT_VARIABLES, isFeatureEnabled, SettingsState } from "../state/settings"
import { gameLogStatsTemporalVariables, gameLogTabularData, gameLogTabularDefinitions, gameLogVariables } from "../tabular/log"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            setTabularDefinitions(gameLogTabularDefinitions)
            const state: GameLogState = await api.storage.loadGameLog()
            if (state)
                dispatch(setGameLogState(mergeDeep(initialState, state)))
            break
        }
        case SET_CURRENT_GAME_LOG: {
            const settings: SettingsState = getSettings(getState())
            if (!isFeatureEnabled(FEATURE_CLIENT_VARIABLES, settings))
                break

            const state: GameLogState = getGameLog(getState())
            await api.storage.saveGameLog(state)

            const gameLog: GameLogData = action.payload.gameLog
            dispatch(setTabularData(gameLogTabularData(gameLog)))
            dispatch(setStreamVariables('gameLog', gameLogVariables(gameLog)))
            dispatch(setStreamTemporalVariables('gameLogStats', gameLogStatsTemporalVariables(gameLog)))
            break
        }
    }
}

export default [
    requests
]
