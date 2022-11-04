import { ADD_FRUIT_TO_SHEET, ADD_FRUIT_TO_SHEET_DONE, SET_FRUIT_STATE, FRUIT_AMOUNT_CHANGED, FRUIT_PRICE_CHANGED } from "../actions/fruit"
import { addFruitChanged, initialState, setState, fruitAmountChanged, fruitPriceChanged } from "../helpers/fruit"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_FRUIT_STATE: return setState(state, action.payload.state)
        case FRUIT_PRICE_CHANGED: return fruitPriceChanged(state, action.payload.price)
        case FRUIT_AMOUNT_CHANGED: return fruitAmountChanged(state, action.payload.amount)
        case ADD_FRUIT_TO_SHEET: return addFruitChanged(state, true)
        case ADD_FRUIT_TO_SHEET_DONE: return addFruitChanged(state, false)
        default: return state
    }
}