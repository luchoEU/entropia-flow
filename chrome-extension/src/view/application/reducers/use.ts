import { USE_AMOUNT_CHANGED, SET_USE_STATE } from "../actions/use"
import { initialState, useAmountChanged, setState } from "../helpers/use"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_USE_STATE: return setState(state, action.payload.state)
        case USE_AMOUNT_CHANGED: return useAmountChanged(state, action.payload.material, action.payload.amount)
        default: return state
    }
}
