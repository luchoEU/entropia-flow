import { ADD_ORDER_TO_SHEET, ADD_ORDER_TO_SHEET_DONE, ORDER_MARKUP_CHANGED, ORDER_VALUE_CHANGED, SET_ORDER_STATE } from "../actions/order"
import { addOrderChanged, initialState, markupChanged, setState, valueChanged } from "../helpers/order"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ORDER_STATE: return setState(state, action.payload.state)
        case ORDER_MARKUP_CHANGED: return markupChanged(state, action.payload.markup)
        case ORDER_VALUE_CHANGED: return valueChanged(state, action.payload.value)
        case ADD_ORDER_TO_SHEET: return addOrderChanged(state, true)
        case ADD_ORDER_TO_SHEET_DONE: return addOrderChanged(state, false)
        default: return state
    }
}
