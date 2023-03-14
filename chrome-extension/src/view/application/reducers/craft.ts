import { ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, BUY_BUDGET_PAGE_MATERIAL, BUY_BUDGET_PAGE_MATERIAL_CLEAR, BUY_BUDGET_PAGE_MATERIAL_DONE, CHNAGE_BUDGET_PAGE_BUY_COST, CLEAR_CRAFT_SESSION, DONE_CRAFT_SESSION, END_BUDGET_PAGE_LOADING, END_CRAFT_SESSION, ERROR_BUDGET_PAGE_LOADING, ERROR_CRAFT_SESSION, READY_CRAFT_SESSION, REMOVE_BLUEPRINT, SAVE_CRAFT_SESSION, SET_ACTIVE_BLUEPRINTS_EXPANDED, SET_BLUEPRINT_EXPANDED, SET_BLUEPRINT_QUANTITY, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_SAVE_STAGE, SET_CRAFT_STATE, SET_NEW_CRAFT_SESSION_DIFF, SORT_BLUEPRINTS_BY, START_BUDGET_PAGE_LOADING, START_CRAFT_SESSION } from "../actions/craft"
import { addBlueprint, addBlueprintData, buyBudgetMaterial, buyBudgetMaterialClear, buyBudgetMaterialDone, changeBudgetBuyCost, clearCraftSession, doneCraftSession, endBudgetLoading, endCraftSession, errorBudgetLoading, errorCraftSession, initialState, readyCraftSession, removeBlueprint, saveCraftSession, setActiveBlueprintsExpanded, setBlueprintExpanded, setBlueprintQuantity, setBudgetInfo, setBudgetState, setCraftSaveStage, setCraftSessionDiff, setState, sortBlueprintsByPart, startBudgetLoading, startCraftSession } from "../helpers/craft"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CRAFT_STATE: return setState(state, action.payload.state)
        case ADD_BLUEPRINT: return addBlueprint(state, action.payload.name)
        case REMOVE_BLUEPRINT: return removeBlueprint(state, action.payload.name)
        case SORT_BLUEPRINTS_BY: return sortBlueprintsByPart(state, action.payload.part)
        case SET_ACTIVE_BLUEPRINTS_EXPANDED: return setActiveBlueprintsExpanded(state, action.payload.expanded)
        case ADD_BLUEPRINT_DATA: return addBlueprintData(state, action.payload.data)
        case SET_BLUEPRINT_QUANTITY: return setBlueprintQuantity(state, action.payload.dictionary)
        case SET_BLUEPRINT_EXPANDED: return setBlueprintExpanded(state, action.payload.name, action.payload.expanded)
        case START_BUDGET_PAGE_LOADING: return startBudgetLoading(state, action.payload.name)
        case SET_BUDGET_PAGE_LOADING_STAGE: return setBudgetState(state, action.payload.name, action.payload.stage)
        case SET_BUDGET_PAGE_INFO: return setBudgetInfo(state, action.payload.name, action.payload.info)
        case END_BUDGET_PAGE_LOADING: return endBudgetLoading(state, action.payload.name)
        case ERROR_BUDGET_PAGE_LOADING: return errorBudgetLoading(state, action.payload.name, action.payload.text)
        case BUY_BUDGET_PAGE_MATERIAL: return buyBudgetMaterial(state, action.payload.name, action.payload.materialName)
        case BUY_BUDGET_PAGE_MATERIAL_DONE: return buyBudgetMaterialDone(state, action.payload.name, action.payload.materialName)
        case BUY_BUDGET_PAGE_MATERIAL_CLEAR: return buyBudgetMaterialClear(state)
        case CHNAGE_BUDGET_PAGE_BUY_COST: return changeBudgetBuyCost(state, action.payload.name, action.payload.materialName, action.payload.cost)
        case START_CRAFT_SESSION: return startCraftSession(state, action.payload.name)
        case END_CRAFT_SESSION: return endCraftSession(state, action.payload.name)
        case ERROR_CRAFT_SESSION: return errorCraftSession(state, action.payload.name, action.payload.errorText)
        case READY_CRAFT_SESSION: return readyCraftSession(state, action.payload.name)
        case SET_NEW_CRAFT_SESSION_DIFF: return setCraftSessionDiff(state, action.payload.name, action.payload.diff)
        case SAVE_CRAFT_SESSION: return saveCraftSession(state, action.payload.name)
        case SET_CRAFT_SAVE_STAGE: return setCraftSaveStage(state, action.payload.name, action.payload.stage)
        case DONE_CRAFT_SESSION: return doneCraftSession(state, action.payload.name)
        case CLEAR_CRAFT_SESSION: return clearCraftSession(state, action.payload.name)
        default: return state
    }
}
