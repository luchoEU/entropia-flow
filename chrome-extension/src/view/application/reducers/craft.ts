import { ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, CREATE_BUDGET_PAGE, CREATE_BUDGET_PAGE_DONE, REMOVE_BLUEPRINT, SET_BLUEPRINT_QUANTITY, SET_CRAFT_STATE } from "../actions/craft"
import { addBlueprint, addBlueprintData, initialState, removeBlueprint, setBlueprintQuantity, setBudgetPageLoading, setState } from "../helpers/craft"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CRAFT_STATE: return setState(state, action.payload.state)
        case ADD_BLUEPRINT: return addBlueprint(state, action.payload.name)
        case REMOVE_BLUEPRINT: return removeBlueprint(state, action.payload.name)
        case ADD_BLUEPRINT_DATA: return addBlueprintData(state, action.payload.data)
        case SET_BLUEPRINT_QUANTITY: return setBlueprintQuantity(state, action.payload.dictionary)
        case CREATE_BUDGET_PAGE: return setBudgetPageLoading(state, action.payload.name, true)
        case CREATE_BUDGET_PAGE_DONE: return setBudgetPageLoading(state, action.payload.name, false)
        default: return state
    }
}
