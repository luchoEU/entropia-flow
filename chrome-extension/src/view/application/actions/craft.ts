import { BudgetSheetGetInfo } from '../../services/api/sheets/sheetsBudget'
import { BlueprintSessionDiff, BluprintWebData, CraftState } from '../state/craft'

const SET_CRAFT_STATE = '[craft] set state'
const ADD_BLUEPRINT = '[craft] add blueprint'
const REMOVE_BLUEPRINT = '[craft] remove blueprint'
const SORT_BLUEPRINTS_BY = '[craft] sort blueprints by'
const SET_ACTIVE_BLUEPRINTS_EXPANDED = '[craft] set active blueprints expanded'
const SET_CRAFT_MATERIALS_EXPANDED = '[craft] set craft materials expanded'
const ADD_BLUEPRINT_DATA = '[craft] add blueprint data'
const SET_BLUEPRINT_QUANTITY = '[craft] set blueprint quantity'
const SET_BLUEPRINT_EXPANDED = '[craft] set blueprint expanded'
const START_BUDGET_PAGE_LOADING = '[craft] start budget page loading'
const SET_BUDGET_PAGE_LOADING_STAGE = '[craft] set budget page stage'
const SET_BUDGET_PAGE_INFO = '[craft] set budget page info'
const END_BUDGET_PAGE_LOADING = '[craft] end budget page loading'
const ERROR_BUDGET_PAGE_LOADING = '[craft] error budget page loading'
const BUY_BUDGET_PAGE_MATERIAL = '[craft] buy budget page material'
const BUY_BUDGET_PAGE_MATERIAL_DONE = '[craft] buy budget page material done'
const BUY_BUDGET_PAGE_MATERIAL_CLEAR = '[craft] buy budget page material clear'
const MOVE_ALL_BUDGET_PAGE_MATERIAL = '[craft] move all budget page material'
const CHANGE_BUDGET_PAGE_BUY_COST = '[craft] change budget page buy cost'
const CHANGE_BUDGET_PAGE_BUY_FEE = '[craft] change budget page buy fee'
const START_CRAFT_SESSION = '[craft] start session'
const END_CRAFT_SESSION = '[craft] end session'
const ERROR_CRAFT_SESSION = '[craft] error session'
const READY_CRAFT_SESSION = '[craft] ready session'
const SET_NEW_CRAFT_SESSION_DIFF = '[craft] set new craft session diff'
const SAVE_CRAFT_SESSION = '[craft] save session'
const SET_CRAFT_SAVE_STAGE = '[craft] set save stage'
const DONE_CRAFT_SESSION = '[craft] done session'
const CLEAR_CRAFT_SESSION = '[craft] clear session'

const BUDGET_BUY = 'Buy'
const BUDGET_SELL = 'Sell'
const BUDGET_MOVE = 'Move'

const setCraftState = (state: CraftState) => ({
    type: SET_CRAFT_STATE,
    payload: {
        state
    }
})

const addBlueprint = (name: string) => ({
    type: ADD_BLUEPRINT,
    payload: {
        name
    }
})

const removeBlueprint = (name: string) => ({
    type: REMOVE_BLUEPRINT,
    payload: {
        name
    }
})

const sortBlueprintsBy = (part: number) => ({
    type: SORT_BLUEPRINTS_BY,
    payload: {
        part
    }
})

const setActiveBlueprintsExpanded = (expanded: boolean) => ({
    type: SET_ACTIVE_BLUEPRINTS_EXPANDED,
    payload: {
        expanded
    }
})

const setCraftMaterialsExpanded = (expanded: boolean) => ({
    type: SET_CRAFT_MATERIALS_EXPANDED,
    payload: {
        expanded
    }
})

const addBlueprintData = (data: BluprintWebData) => ({
    type: ADD_BLUEPRINT_DATA,
    payload: {
        data
    }
})

const setBlueprintQuantity = (dictionary: { [k: string]: number }) => ({
    type: SET_BLUEPRINT_QUANTITY,
    payload: {
        dictionary
    }
})

const setBlueprintExpanded = (name: string, expanded: boolean) => ({
    type: SET_BLUEPRINT_EXPANDED,
    payload: {
        name,
        expanded
    }
})

const startBudgetPageLoading = (name: string) => ({
    type: START_BUDGET_PAGE_LOADING,
    payload: {
        name
    }
})

const setBudgetPageStage = (name: string, stage: number) => ({
    type: SET_BUDGET_PAGE_LOADING_STAGE,
    payload: {
        name,
        stage
    }
})

const setBudgetPageInfo = (name: string, info: BudgetSheetGetInfo) => ({
    type: SET_BUDGET_PAGE_INFO,
    payload: {
        name,
        info
    }
})

const endBudgetPageLoading = (name: string) => ({
    type: END_BUDGET_PAGE_LOADING,
    payload: {
        name
    }
})

const setBudgetPageLoadingError = (name: string, text: string) => ({
    type: ERROR_BUDGET_PAGE_LOADING,
    payload: {
        name,
        text
    }
})

const buyBudgetPageMaterial = (name: string, materialName: string, text: string, value: number, quantity: number) => ({
    type: BUY_BUDGET_PAGE_MATERIAL,
    payload: {
        name,
        materialName,
        text,
        value,
        quantity
    }
})

const moveAllBudgetPageMaterial = (name: string) => ({
    type: MOVE_ALL_BUDGET_PAGE_MATERIAL,
    payload: {
        name
    }
})

const doneBuyBudget = (name: string, materialName: string, quantity: number) => ({
    type: BUY_BUDGET_PAGE_MATERIAL_DONE,
    payload: {
        name,
        materialName,
        quantity
    }
})

const clearBuyBudget = {
    type: BUY_BUDGET_PAGE_MATERIAL_CLEAR
}

const changeBudgetPageBuyCost = (name: string, materialName: string, cost: string) => ({
    type: CHANGE_BUDGET_PAGE_BUY_COST,
    payload: {
        name,
        materialName,
        cost
    }
})

const changeBudgetPageBuyFee = (name: string, materialName: string, withFee: boolean) => ({
    type: CHANGE_BUDGET_PAGE_BUY_FEE,
    payload: {
        name,
        materialName,
        withFee
    }
})

const startCraftingSession = (name: string) => ({
    type: START_CRAFT_SESSION,
    payload: {
        name
    }
})

const endCraftingSession = (name: string) => ({
    type: END_CRAFT_SESSION,
    payload: {
        name
    }
})

const errorCraftingSession = (name: string, errorText: string) => ({
    type: ERROR_CRAFT_SESSION,
    payload: {
        name,
        errorText
    }
})

const readyCraftingSession = (name: string) => ({
    type: READY_CRAFT_SESSION,
    payload: {
        name
    }
})

const setNewCraftingSessionDiff = (name: string, diff: BlueprintSessionDiff[]) => ({
    type: SET_NEW_CRAFT_SESSION_DIFF,
    payload: {
        name,
        diff
    }
})

const saveCraftingSession = (name: string) => ({
    type: SAVE_CRAFT_SESSION,
    payload: {
        name
    }
})

const setCraftingSessionStage = (name: string, stage: number) => ({
    type: SET_CRAFT_SAVE_STAGE,
    payload: {
        name,
        stage
    }
})

const doneCraftingSession = (name: string) => ({
    type: DONE_CRAFT_SESSION,
    payload: {
        name
    }
})

const clearCraftingSession = (name: string) => ({
    type: CLEAR_CRAFT_SESSION,
    payload: {
        name
    }
})

export {
    SET_CRAFT_STATE,
    ADD_BLUEPRINT,
    REMOVE_BLUEPRINT,
    SORT_BLUEPRINTS_BY,
    SET_ACTIVE_BLUEPRINTS_EXPANDED,
    SET_CRAFT_MATERIALS_EXPANDED,
    ADD_BLUEPRINT_DATA,
    SET_BLUEPRINT_QUANTITY,
    SET_BLUEPRINT_EXPANDED,
    START_BUDGET_PAGE_LOADING,
    SET_BUDGET_PAGE_LOADING_STAGE,
    SET_BUDGET_PAGE_INFO,
    END_BUDGET_PAGE_LOADING,
    ERROR_BUDGET_PAGE_LOADING,
    BUY_BUDGET_PAGE_MATERIAL,
    BUY_BUDGET_PAGE_MATERIAL_DONE,
    BUY_BUDGET_PAGE_MATERIAL_CLEAR,
    MOVE_ALL_BUDGET_PAGE_MATERIAL,
    CHANGE_BUDGET_PAGE_BUY_COST,
    CHANGE_BUDGET_PAGE_BUY_FEE,
    START_CRAFT_SESSION,
    END_CRAFT_SESSION,
    ERROR_CRAFT_SESSION,
    READY_CRAFT_SESSION,
    SET_NEW_CRAFT_SESSION_DIFF,
    SAVE_CRAFT_SESSION,
    SET_CRAFT_SAVE_STAGE,
    DONE_CRAFT_SESSION,
    CLEAR_CRAFT_SESSION,
    BUDGET_BUY,
    BUDGET_SELL,
    BUDGET_MOVE,
    setCraftState,
    addBlueprint,
    removeBlueprint,
    sortBlueprintsBy,
    setActiveBlueprintsExpanded,
    setCraftMaterialsExpanded,
    addBlueprintData,
    setBlueprintQuantity,
    setBlueprintExpanded,
    startBudgetPageLoading,
    setBudgetPageStage,
    setBudgetPageInfo,
    endBudgetPageLoading,
    setBudgetPageLoadingError,
    buyBudgetPageMaterial,
    moveAllBudgetPageMaterial,
    doneBuyBudget,
    clearBuyBudget,
    changeBudgetPageBuyCost,
    changeBudgetPageBuyFee,
    startCraftingSession,
    endCraftingSession,
    errorCraftingSession,
    readyCraftingSession,
    setNewCraftingSessionDiff,
    saveCraftingSession,
    setCraftingSessionStage,
    doneCraftingSession,
    clearCraftingSession,
}
