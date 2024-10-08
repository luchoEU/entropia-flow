import { SET_STACKABLE_STATE, STACKABLE_MARKUP_CHANGED, STACKABLE_TT_VALUE_CHANGED } from "../actions/stackable"
import { initialState, setState, stackableMarkupChanged, stackableTTValueChanged } from "../helpers/stackable"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STACKABLE_STATE: return setState(state, action.payload.state)
        case STACKABLE_TT_VALUE_CHANGED: return stackableTTValueChanged(state, action.payload.material, action.payload.ttValue)
        case STACKABLE_MARKUP_CHANGED: return stackableMarkupChanged(state, action.payload.material, action.payload.markup)
        default: return state
    }
}
