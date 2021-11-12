import { SET_SWEAT_STATE, SWEAT_AMOUNT_CHANGED, SWEAT_PRICE_CHANGED } from "../actions/sweat"
import { initialState, setState, sweatAmountChanged, sweatPriceChanged } from "../helpers/sweat"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_SWEAT_STATE: return setState(state, action.payload.state)
        case SWEAT_PRICE_CHANGED: return sweatPriceChanged(state, action.payload.price)
        case SWEAT_AMOUNT_CHANGED: return sweatAmountChanged(state, action.payload.amount)
        default: return state
    }
}