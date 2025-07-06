import { BUY_BUDGET_PAGE_MATERIAL, BUY_BUDGET_PAGE_MATERIAL_CLEAR, BUY_BUDGET_PAGE_MATERIAL_DONE, CHANGE_BUDGET_PAGE_BUY_COST, CHANGE_BUDGET_PAGE_BUY_FEE, CLEAR_CRAFT_SESSION, DONE_CRAFT_SESSION, END_BUDGET_PAGE_LOADING, END_CRAFT_SESSION, ERROR_BUDGET_PAGE_LOADING, ERROR_CRAFT_SESSION, MOVE_ALL_BUDGET_PAGE_MATERIAL, READY_CRAFT_SESSION, SAVE_CRAFT_SESSION, SET_STARED_BLUEPRINTS_FILTER, SET_BLUEPRINT_QUANTITY, SET_BUDGET_PAGE_INFO, SET_BUDGET_PAGE_LOADING_STAGE, SET_CRAFT_SAVE_STAGE, SET_CRAFT_STATE, SET_NEW_CRAFT_SESSION_DIFF, SHOW_BLUEPRINT_MATERIAL_DATA, SORT_BLUEPRINTS_BY, START_BUDGET_PAGE_LOADING, START_CRAFT_SESSION, SET_BLUEPRINT_STARED, REMOVE_BLUEPRINT, SET_CRAFT_ACTIVE_PLANET, SET_BLUEPRINT_PARTIAL_WEB_DATA, ADD_BLUEPRINT, SET_BLUEPRINT_MATERIAL_TYPE_AND_VALUE, SET_CRAFTING_PARTIAL_WEB_DATA, SET_CRAFT_OPTIONS, START_BLUEPRINT_EDIT_MODE, END_BLUEPRINT_EDIT_MODE, ADD_BLUEPRINT_MATERIAL, REMOVE_BLUEPRINT_MATERIAL, CHANGE_BLUEPRINT_MATERIAL_QUANTITY, CHANGE_BLUEPRINT_MATERIAL_NAME, MOVE_BLUEPRINT_MATERIAL, SET_BLUEPRINT_SUGGESTED_MATERIALS } from "../actions/craft"
import { initialState, reduceAddBlueprint, reduceAddBlueprintMaterial, reduceBuyBudgetMaterial, reduceBuyBudgetMaterialClear, reduceBuyBudgetMaterialDone, reduceChangeBlueprintMaterialName, reduceChangeBlueprintMaterialQuantity, reduceChangeBudgetBuyCost, reduceChangeBudgetBuyFee, reduceClearCraftSession, reduceDoneCraftSession, reduceEndBudgetLoading, reduceEndCraftSession, reduceErrorBudgetLoading, reduceErrorCraftSession, reduceMoveBlueprintMaterial, reduceReadyCraftSession, reduceRemoveBlueprint, reduceRemoveBlueprintMaterial, reduceSaveCraftSession, reduceStartBlueprintEditMode, reduceEndBlueprintEditMode, reduceSetBlueprintMaterialTypeAndValue, reduceSetBlueprintPartialWebData, reduceSetBlueprintQuantity, reduceSetBlueprintStared, reduceSetBudgetInfo, reduceSetBudgetState, reduceSetCraftActivePlanet, reduceSetCraftingPartialWebData, reduceSetCraftOptions, reduceSetCraftSaveStage, reduceSetCraftSessionDiff, reduceSetStaredBlueprintsFilter, reduceSetState, reduceShowBlueprintMaterialData, reduceSortBlueprintsByPart, reduceStartBudgetLoading, reduceStartCraftSession, reduceSetBlueprintSuggestedMaterials } from "../helpers/craft"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CRAFT_STATE: return reduceSetState(state, action.payload.state)
        case REMOVE_BLUEPRINT: return reduceRemoveBlueprint(state, action.payload.name)
        case SORT_BLUEPRINTS_BY: return reduceSortBlueprintsByPart(state, action.payload.part)
        case SET_STARED_BLUEPRINTS_FILTER: return reduceSetStaredBlueprintsFilter(state, action.payload.filter)
        case ADD_BLUEPRINT: return reduceAddBlueprint(state, action.payload.name)
        case SET_BLUEPRINT_PARTIAL_WEB_DATA: return reduceSetBlueprintPartialWebData(state, action.payload.name, action.payload.change)
        case SET_CRAFTING_PARTIAL_WEB_DATA: return reduceSetCraftingPartialWebData(state, action.payload.change)
        case SET_BLUEPRINT_QUANTITY: return reduceSetBlueprintQuantity(state, action.payload.dictionary)
        case SET_BLUEPRINT_MATERIAL_TYPE_AND_VALUE: return reduceSetBlueprintMaterialTypeAndValue(state, action.payload.list)
        case SET_BLUEPRINT_SUGGESTED_MATERIALS: return reduceSetBlueprintSuggestedMaterials(state, action.payload.name, action.payload.list)
        case SET_BLUEPRINT_STARED: return reduceSetBlueprintStared(state, action.payload.name, action.payload.stared)
        case SHOW_BLUEPRINT_MATERIAL_DATA: return reduceShowBlueprintMaterialData(state, action.payload.name, action.payload.materialName)
        case START_BUDGET_PAGE_LOADING: return reduceStartBudgetLoading(state, action.payload.name)
        case SET_BUDGET_PAGE_LOADING_STAGE: return reduceSetBudgetState(state, action.payload.name, action.payload.stage)
        case SET_BUDGET_PAGE_INFO: return reduceSetBudgetInfo(state, action.payload.name, action.payload.info)
        case END_BUDGET_PAGE_LOADING: return reduceEndBudgetLoading(state, action.payload.name)
        case ERROR_BUDGET_PAGE_LOADING: return reduceErrorBudgetLoading(state, action.payload.name, action.payload.text)
        case BUY_BUDGET_PAGE_MATERIAL: return reduceBuyBudgetMaterial(state, action.payload.name)
        case BUY_BUDGET_PAGE_MATERIAL_DONE: return reduceBuyBudgetMaterialDone(state, action.payload.name, action.payload.materialName, action.payload.quantity)
        case BUY_BUDGET_PAGE_MATERIAL_CLEAR: return reduceBuyBudgetMaterialClear(state)
        case CHANGE_BUDGET_PAGE_BUY_COST: return reduceChangeBudgetBuyCost(state, action.payload.name, action.payload.materialName, action.payload.cost)
        case CHANGE_BUDGET_PAGE_BUY_FEE: return reduceChangeBudgetBuyFee(state, action.payload.name, action.payload.materialName, action.payload.withFee)
        case MOVE_ALL_BUDGET_PAGE_MATERIAL: return state // not implemented
        case START_CRAFT_SESSION: return reduceStartCraftSession(state, action.payload.name)
        case END_CRAFT_SESSION: return reduceEndCraftSession(state, action.payload.name)
        case ERROR_CRAFT_SESSION: return reduceErrorCraftSession(state, action.payload.name, action.payload.errorText)
        case READY_CRAFT_SESSION: return reduceReadyCraftSession(state, action.payload.name)
        case SET_NEW_CRAFT_SESSION_DIFF: return reduceSetCraftSessionDiff(state, action.payload.name, action.payload.diff)
        case SAVE_CRAFT_SESSION: return reduceSaveCraftSession(state, action.payload.name)
        case SET_CRAFT_SAVE_STAGE: return reduceSetCraftSaveStage(state, action.payload.name, action.payload.stage)
        case DONE_CRAFT_SESSION: return reduceDoneCraftSession(state, action.payload.name)
        case CLEAR_CRAFT_SESSION: return reduceClearCraftSession(state, action.payload.name)
        case SET_CRAFT_ACTIVE_PLANET: return reduceSetCraftActivePlanet(state, action.payload.name)
        case SET_CRAFT_OPTIONS: return reduceSetCraftOptions(state, action.payload.change)
        case START_BLUEPRINT_EDIT_MODE: return reduceStartBlueprintEditMode(state, action.payload.name)
        case END_BLUEPRINT_EDIT_MODE: return reduceEndBlueprintEditMode(state)
        case ADD_BLUEPRINT_MATERIAL: return reduceAddBlueprintMaterial(state, action.payload.name)
        case MOVE_BLUEPRINT_MATERIAL: return reduceMoveBlueprintMaterial(state, action.payload.name, action.payload.materialIndex, action.payload.newIndex)
        case REMOVE_BLUEPRINT_MATERIAL: return reduceRemoveBlueprintMaterial(state, action.payload.name, action.payload.materialIndex)
        case CHANGE_BLUEPRINT_MATERIAL_QUANTITY: return reduceChangeBlueprintMaterialQuantity(state, action.payload.name, action.payload.materialIndex, action.payload.quantity)
        case CHANGE_BLUEPRINT_MATERIAL_NAME: return reduceChangeBlueprintMaterialName(state, action.payload.name, action.payload.materialIndex, action.payload.materialName)
        default: return state
    }
}
