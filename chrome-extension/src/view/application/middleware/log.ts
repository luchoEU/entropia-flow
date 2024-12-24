import { mergeDeep } from "../../../common/merge"
import { SET_CURRENT_GAME_LOG, SET_GAME_GLOBAL_EXPANDED, SET_GAME_LOG_EXPANDED, SET_GAME_LOOT_EXPANDED, SET_GAME_SKILL_EXPANDED, SET_GAME_STATS_EXPANDED, SORT_LOOT_BY, setGameLogState } from "../actions/log"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/log"
import { getGameLog } from "../selectors/log"
import { GameLogState } from "../state/log"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: GameLogState = await api.storage.loadGameLog()
            if (state)
                dispatch(setGameLogState(mergeDeep(initialState, state)))
            break
        }
        case SET_CURRENT_GAME_LOG:
        case SET_GAME_LOOT_EXPANDED:
        case SET_GAME_GLOBAL_EXPANDED:
        case SET_GAME_SKILL_EXPANDED:
        case SET_GAME_STATS_EXPANDED:
        case SET_GAME_LOG_EXPANDED:
        case SORT_LOOT_BY: {
            const state: Array<string> = getGameLog(getState())
            await api.storage.saveGameLog(state)
            break
        }
    }
}

export default [
    requests
]