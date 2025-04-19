import { MODE_PIN_MENU, MODE_PIN_STREAM_VIEW, MODE_SHOW_SUBTITLES, MODE_SHOW_VISIBLE_TOGGLE, SET_MODE_STATE } from "../actions/mode"
import { initialState, reduceSetMenuPinned, reduceSetModeState, reduceSetShowSubtitles, reduceSetShowVisibleToggle, reduceSetStreamViewPinned } from "../helpers/mode"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MODE_STATE: return reduceSetModeState(state, action.payload.state)
        case MODE_SHOW_SUBTITLES: return reduceSetShowSubtitles(state, action.payload.showSubtitles)
        case MODE_SHOW_VISIBLE_TOGGLE: return reduceSetShowVisibleToggle(state, action.payload.showVisibleToggle)
        case MODE_PIN_MENU: return reduceSetMenuPinned(state, action.payload.pinned)
        case MODE_PIN_STREAM_VIEW: return reduceSetStreamViewPinned(state, action.payload.pinned)
        default: return state
    }
}
