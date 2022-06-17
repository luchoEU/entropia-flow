import { ADD_PENDING_CHANGE, PERFORM_CHANGE, SET_TIMEOUT_ID } from "../actions/sheets"
import { addPendingChange, clearPendingChangeAndTimeoutId, initialState, setTimeoutId } from "../helpers/sheets"

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_PENDING_CHANGE: return addPendingChange(state, action.payload.operation, action.payload.changeFunc, action.payload.doneFunc)
        case SET_TIMEOUT_ID: return setTimeoutId(state, action.payload.timeoutId)
        case PERFORM_CHANGE: return clearPendingChangeAndTimeoutId(state)
        default: return state
    }
}
