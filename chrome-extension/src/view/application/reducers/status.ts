import { SET_STATUS } from '../actions/status';
import { initialState, reduceSetStatus } from '../helpers/status';

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STATUS: return reduceSetStatus(state, action.payload.status)
        default: return state;
    }
}
