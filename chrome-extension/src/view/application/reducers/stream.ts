import { SET_STREAM_BACKGROUND_EXPANDED, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_DATA, SET_STREAM_ENABLED, SET_STREAM_STATE } from "../actions/stream"
import { initialState, setBackgroundExpanded, setBackgroundSelected, setEnabled, setState, setStreamData } from "../helpers/stream"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STREAM_STATE: return setState(state, action.payload.state)
        case SET_STREAM_ENABLED: return setEnabled(state, action.payload.enabled)
        case SET_STREAM_BACKGROUND_EXPANDED: return setBackgroundExpanded(state, action.payload.expanded)
        case SET_STREAM_BACKGROUND_SELECTED: return setBackgroundSelected(state, action.payload.selected)
        case SET_STREAM_DATA: return setStreamData(state, action.payload.data)
        default: return state
    }
}