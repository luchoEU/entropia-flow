import { BudgetSheetInfo } from "../../services/api/sheets/sheetsBudget"
import { BluprintWebData, CraftState } from "../state/craft"

const SET_CRAFT_STATE = "[craft] set state"
const ADD_BLUEPRINT = "[craft] add blueprint"
const REMOVE_BLUEPRINT = "[craft] remove blueprint"
const ADD_BLUEPRINT_DATA = "[craft] add blueprint data"
const SET_BLUEPRINT_QUANTITY = "[craft] set blueprint quantity"
const START_BUDGET_PAGE_LOADING = "[craft] start budget page loading"
const SET_BUDGET_PAGE_LOADING_STAGE = "[craft] set budget page stage"
const SET_BUDGET_PAGE_INFO = "[craft] set budget page info"
const END_BUDGET_PAGE_LOADING = "[craft] end budget page loading"
const ERROR_BUDGET_PAGE_LOADING = "[craft] error budget page loading"
const START_CRAFT_SESSION = "[craft] start session"
const END_CRAFT_SESSION = "[craft] end session"
const ERROR_CRAFT_SESSION = "[craft] error session"
const READY_CRAFT_SESSION = "[craft] ready session"
const SAVE_CRAFT_SESSION = "[craft] save session"
const SET_CRAFT_SAVE_STAGE = "[craft] set save stage"
const DONE_CRAFT_SESSION = "[craft] done session"

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

const setBudgetPageInfo = (name: string, info: BudgetSheetInfo) => ({
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

export {
    SET_CRAFT_STATE,
    ADD_BLUEPRINT,
    REMOVE_BLUEPRINT,
    ADD_BLUEPRINT_DATA,
    SET_BLUEPRINT_QUANTITY,
    START_BUDGET_PAGE_LOADING,
    SET_BUDGET_PAGE_LOADING_STAGE,
    SET_BUDGET_PAGE_INFO,
    END_BUDGET_PAGE_LOADING,
    ERROR_BUDGET_PAGE_LOADING,
    START_CRAFT_SESSION,
    END_CRAFT_SESSION,
    ERROR_CRAFT_SESSION,
    READY_CRAFT_SESSION,
    SAVE_CRAFT_SESSION,
    SET_CRAFT_SAVE_STAGE,
    DONE_CRAFT_SESSION,
    setCraftState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
    startBudgetPageLoading,
    setBudgetPageStage,
    setBudgetPageInfo,
    endBudgetPageLoading,
    setBudgetPageLoadingError,
    startCraftingSession,
    endCraftingSession,
    errorCraftingSession,
    readyCraftingSession,
    saveCraftingSession,
    setCraftingSessionStage,
    doneCraftingSession,
}
