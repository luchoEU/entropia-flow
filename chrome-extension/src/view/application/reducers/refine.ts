import { REFINE_AMOUNT_CHANGED, SET_REFINE_STATE } from "../actions/refine"
import { initialState, refineAmountChanged, setState } from "../helpers/refine"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_REFINE_STATE: return setState(state, action.payload.state)
        case REFINE_AMOUNT_CHANGED: return refineAmountChanged(state, action.payload.material, action.payload.amount)
        default: return state
    }
}
