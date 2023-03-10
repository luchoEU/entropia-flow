import { BluprintWebData, CraftState } from "../state/craft"

const SET_CRAFT_STATE = "[craft] set state"
const ADD_BLUEPRINT = "[craft] add blueprint"
const REMOVE_BLUEPRINT = "[craft] remove blueprint"
const ADD_BLUEPRINT_DATA = "[craft] add blueprint data"
const SET_BLUEPRINT_QUANTITY = "[craft] set blueprint quantity"
const START_BUDGET_PAGE_LOADING = "[craft] start budget page loading"
const SET_BUDGET_PAGE_LOADING_STAGE = "[craft] set budget page stage"
const END_BUDGET_PAGE_LOADING = "[craft] end budget page loading"
const ERROR_BUDGET_PAGE_LOADING = "[craft] error budget page loading"

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

export {
    SET_CRAFT_STATE,
    ADD_BLUEPRINT,
    REMOVE_BLUEPRINT,
    ADD_BLUEPRINT_DATA,
    SET_BLUEPRINT_QUANTITY,
    START_BUDGET_PAGE_LOADING,
    SET_BUDGET_PAGE_LOADING_STAGE,
    END_BUDGET_PAGE_LOADING,
    ERROR_BUDGET_PAGE_LOADING,
    setCraftState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
    startBudgetPageLoading,
    setBudgetPageStage,
    endBudgetPageLoading,
    setBudgetPageLoadingError,
}
