import { LOAD_ENTROPIA_NEXUS_ACQUISITION, SET_ENTROPIA_NEXUS_STATE } from "../actions/nexus"
import { initialState, reduceLoadEntropiaNexusAcquisition, reduceSetEntropiaNexusState } from "../helpers/nexus"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ENTROPIA_NEXUS_STATE: return reduceSetEntropiaNexusState(state, action.payload.state)
        case LOAD_ENTROPIA_NEXUS_ACQUISITION: return reduceLoadEntropiaNexusAcquisition(state, action.payload.item)
        default: return state
    }
}
