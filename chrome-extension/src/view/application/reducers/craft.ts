import { ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, DONE_CRAFT_SESSION, END_BUDGET_PAGE_LOADING, END_CRAFT_SESSION, ERROR_BUDGET_PAGE_LOADING, ERROR_CRAFT_SESSION, READY_CRAFT_SESSION, REMOVE_BLUEPRINT, SAVE_CRAFT_SESSION, SET_BLUEPRINT_QUANTITY, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_SAVE_STAGE, SET_CRAFT_STATE, START_BUDGET_PAGE_LOADING, START_CRAFT_SESSION } from "../actions/craft"
import { addBlueprint, addBlueprintData, doneCraftSession, endBudgetLoading, endCraftSession, errorBudgetLoading, errorCraftSession, initialState, readyCraftSession, removeBlueprint, saveCraftSession, setBlueprintQuantity, setBudgetInfo, setBudgetState, setCraftSaveStage, setState, startBudgetLoading, startCraftSession } from "../helpers/craft"

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
        case START_CRAFT_SESSION: return startCraftSession(state, action.payload.name)
        case END_CRAFT_SESSION: return endCraftSession(state, action.payload.name)
        case ERROR_CRAFT_SESSION: return errorCraftSession(state, action.payload.name, action.payload.errorText)
        case READY_CRAFT_SESSION: return readyCraftSession(state, action.payload.name)
        case SAVE_CRAFT_SESSION: return saveCraftSession(state, action.payload.name)
        case SET_CRAFT_SAVE_STAGE: return setCraftSaveStage(state, action.payload.name, action.payload.stage)
        case DONE_CRAFT_SESSION: return doneCraftSession(state, action.payload.name)
        default: return state
    }
}
