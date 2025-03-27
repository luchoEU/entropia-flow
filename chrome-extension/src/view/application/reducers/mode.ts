import { MODE_SHOW_SUBTITLES, MODE_SHOW_VISIBLE_TOGGLE, SET_MODE_STATE } from "../actions/mode"
import { initialState, reduceSetModeState, reduceSetShowSubtitles, reduceSetShowVisibleToggle } from "../helpers/mode"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MODE_STATE: return reduceSetModeState(state, action.payload.state)
        case MODE_SHOW_SUBTITLES: return reduceSetShowSubtitles(state, action.payload.showSubtitles)
        case MODE_SHOW_VISIBLE_TOGGLE: return reduceSetShowVisibleToggle(state, action.payload.showVisibleToggle)
        default: return state
    }
}
