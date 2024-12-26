import { SET_CURRENT_GAME_LOG, SET_GAME_LOG_STATE } from "../actions/log"
import { initialState, reduceSetCurrentGameLog, reduceSetGameLogState } from "../helpers/log"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_GAME_LOG_STATE: return reduceSetGameLogState(state, action.payload.gameLog)
        case SET_CURRENT_GAME_LOG: return reduceSetCurrentGameLog(state, action.payload.gameLog)
        default: return state
    }
}
