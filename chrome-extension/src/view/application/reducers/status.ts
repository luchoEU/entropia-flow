import { SET_STATUS, TICK_STATUS } from '../actions/status';
import { initialState, setStatus, tickStatus } from '../helpers/status';

export default (state = initialState, action) => {
    switch (action.type) {
        case TICK_STATUS: return tickStatus(state)
        case SET_STATUS: return setStatus(state, action.payload.status)
        default: return state;
    }
}