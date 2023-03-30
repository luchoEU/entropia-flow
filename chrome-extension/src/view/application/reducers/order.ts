import { ORDER_MARKUP_CHANGED, ORDER_VALUE_CHANGED, SET_ORDER_STATE } from "../actions/order"
import { initialState, markupChanged, setState, valueChanged } from "../helpers/order"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ORDER_STATE: return setState(state, action.payload.state)
        case ORDER_MARKUP_CHANGED: return markupChanged(state, action.payload.markup)
        case ORDER_VALUE_CHANGED: return valueChanged(state, action.payload.value)
        default: return state
    }
}
