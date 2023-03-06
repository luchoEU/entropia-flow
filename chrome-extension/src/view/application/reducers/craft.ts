import { ADD_BLUEPRINT, ADD_BLUEPRINT_DATA } from "../actions/craft"
import { addBlueprint, addBlueprintData, initialState } from "../helpers/craft"

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_BLUEPRINT: return addBlueprint(state, action.payload.name)
        case ADD_BLUEPRINT_DATA: return addBlueprintData(state, action.payload.data)
        default: return state
    }
}
