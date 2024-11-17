import { SET_ENTROPIA_NEXUS_STATE } from "../actions/nexus"
import { initialState, reduceSetEntropiaNexusState } from "../helpers/nexus"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ENTROPIA_NEXUS_STATE: return reduceSetEntropiaNexusState(state, action.payload.state)
        default: return state
    }
}
