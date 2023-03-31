import { ADD_PENDING_CHANGE, CLEAR_PENDING_CHANGES, DONE_PENDING_CHANGES, SET_TIMEOUT_ID } from "../actions/sheets"
import { addPendingChange, clearPendingChanges, clearPendingChangeAndTimeoutId, initialState, setTimeoutId } from "../helpers/sheets"

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_PENDING_CHANGE: return addPendingChange(state, action.payload.operationType, action.payload.date, action.payload.material, action.payload.parameters)
        case CLEAR_PENDING_CHANGES: return clearPendingChanges(state)
        case SET_TIMEOUT_ID: return setTimeoutId(state, action.payload.timeoutId)
        case DONE_PENDING_CHANGES: return clearPendingChangeAndTimeoutId(state)
        default: return state
    }
}
