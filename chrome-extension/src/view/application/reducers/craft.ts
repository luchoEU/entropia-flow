import { ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, SET_BLUEPRINT_QUANTITY } from "../actions/craft"
import { addBlueprint, addBlueprintData, initialState, setBlueprintQuantity } from "../helpers/craft"

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_BLUEPRINT: return addBlueprint(state, action.payload.name)
        case ADD_BLUEPRINT_DATA: return addBlueprintData(state, action.payload.data)
        case SET_BLUEPRINT_QUANTITY: return setBlueprintQuantity(state, action.payload.dictionary)
        default: return state
    }
}
