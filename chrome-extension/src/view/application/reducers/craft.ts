import { ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, END_BUDGET_PAGE_LOADING, ERROR_BUDGET_PAGE_LOADING, REMOVE_BLUEPRINT, SET_BLUEPRINT_QUANTITY, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_STATE, START_BUDGET_PAGE_LOADING } from "../actions/craft"
import { addBlueprint, addBlueprintData, endBudgetLoading, errorBudgetLoading, initialState, removeBlueprint, setBlueprintQuantity, setBudgetInfo, setBudgetState, setState, startBudgetLoading } from "../helpers/craft"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CRAFT_STATE: return setState(state, action.payload.state)
        case ADD_BLUEPRINT: return addBlueprint(state, action.payload.name)
        case REMOVE_BLUEPRINT: return removeBlueprint(state, action.payload.name)
        case ADD_BLUEPRINT_DATA: return addBlueprintData(state, action.payload.data)
        case SET_BLUEPRINT_QUANTITY: return setBlueprintQuantity(state, action.payload.dictionary)
        case START_BUDGET_PAGE_LOADING: return startBudgetLoading(state, action.payload.name)
        case SET_BUDGET_PAGE_LOADING_STAGE: return setBudgetState(state, action.payload.name, action.payload.stage)
        case SET_BUDGET_PAGE_INFO: return setBudgetInfo(state, action.payload.name, action.payload.info)
        case END_BUDGET_PAGE_LOADING: return endBudgetLoading(state, action.payload.name)
        case ERROR_BUDGET_PAGE_LOADING: return errorBudgetLoading(state, action.payload.name, action.payload.text)
        default: return state
    }
}
