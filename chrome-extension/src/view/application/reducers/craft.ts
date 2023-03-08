import { ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, REMOVE_BLUEPRINT, SET_BLUEPRINT_QUANTITY, SET_CRAFT_STATE } from "../actions/craft"
import { addBlueprint, addBlueprintData, initialState, removeBlueprint, setBlueprintQuantity, setState } from "../helpers/craft"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CRAFT_STATE: return setState(state, action.payload.state)
        case ADD_BLUEPRINT: return addBlueprint(state, action.payload.name)
        case REMOVE_BLUEPRINT: return removeBlueprint(state, action.payload.name)
        case ADD_BLUEPRINT_DATA: return addBlueprintData(state, action.payload.data)
        case SET_BLUEPRINT_QUANTITY: return setBlueprintQuantity(state, action.payload.dictionary)
        default: return state
    }
}
