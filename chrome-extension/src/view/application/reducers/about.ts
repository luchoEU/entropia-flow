import { SET_EXPANDED, SET_STATE } from "../actions/about"
import { initialState, setExpanded, setState } from "../helpers/about"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STATE: return setState(state, action.payload.state)
        case SET_EXPANDED: return setExpanded(state, action.payload.part, action.payload.expanded)
        default: return state
    }
}
