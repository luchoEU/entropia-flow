import { SET_FRUIT_STATE, FRUIT_AMOUNT_CHANGED, FRUIT_PRICE_CHANGED } from "../actions/fruit"
import { initialState, setState, fruitAmountChanged, fruitPriceChanged } from "../helpers/fruit"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_FRUIT_STATE: return setState(state, action.payload.state)
        case FRUIT_PRICE_CHANGED: return fruitPriceChanged(state, action.payload.price)
        case FRUIT_AMOUNT_CHANGED: return fruitAmountChanged(state, action.payload.amount)
        default: return state
    }
}