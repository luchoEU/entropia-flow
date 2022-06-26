import { ADD_SWEAT_TO_SHEET, ADD_SWEAT_TO_SHEET_DONE, SET_SWEAT_STATE, SWEAT_AMOUNT_CHANGED, SWEAT_PRICE_CHANGED } from "../actions/sweat"
import { addSweatChanged, initialState, setState, sweatAmountChanged, sweatPriceChanged } from "../helpers/sweat"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_SWEAT_STATE: return setState(state, action.payload.state)
        case SWEAT_PRICE_CHANGED: return sweatPriceChanged(state, action.payload.price)
        case SWEAT_AMOUNT_CHANGED: return sweatAmountChanged(state, action.payload.amount)
        case ADD_SWEAT_TO_SHEET: return addSweatChanged(state, true)
        case ADD_SWEAT_TO_SHEET_DONE: return addSweatChanged(state, false)
        default: return state
    }
}