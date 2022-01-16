import { SET_STREAM_ENABLED, SET_STREAM_STATE } from "../actions/stream"
import { initialState, setEnabled, setState } from "../helpers/stream"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STREAM_STATE: return setState(state, action.payload.state)
        case SET_STREAM_ENABLED: return setEnabled(state, action.payload.enabled)
        default: return state
    }
}