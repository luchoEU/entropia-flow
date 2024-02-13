import { SET_CURRENT_GAME_LOG, SET_GAME_LOG_EXPANDED, SET_GAME_LOG_STATE, SORT_LOOT_BY } from "../actions/log"
import { initialState, setCurrentGameLog, setGameLogExpanded, setGameLogState, sortLootBy } from "../helpers/log"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_GAME_LOG_STATE: return setGameLogState(state, action.payload.gameLog)
        case SET_CURRENT_GAME_LOG: return setCurrentGameLog(state, action.payload.gameLog)
        case SET_GAME_LOG_EXPANDED: return setGameLogExpanded(state, action.payload.expanded)
        case SORT_LOOT_BY: return sortLootBy(state, action.payload.part)
        default: return state
    }
}
