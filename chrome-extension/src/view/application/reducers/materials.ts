import { MATERIAL_MARKUP_CHANGED, SET_MATERIALS_STATE } from "../actions/materials"
import { initialState, materialMarkupChanged, setState } from "../helpers/materials"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_MATERIALS_STATE: return setState(state, action.payload.state)
        case MATERIAL_MARKUP_CHANGED: return materialMarkupChanged(state, action.payload.material, action.payload.value)
        default: return state
    }
}
