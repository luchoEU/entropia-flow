import { MODE_SHOW_SUBTITLES, SET_MODE_STATE } from "../actions/mode"
import { initialState, reduceSetModeState, reduceSetShowSubtitles } from "../helpers/mode"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MODE_STATE: return reduceSetModeState(state, action.payload.state)
        case MODE_SHOW_SUBTITLES: return reduceSetShowSubtitles(state, action.payload.showSubtitles)
        default: return state
    }
}
