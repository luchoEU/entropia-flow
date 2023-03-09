import { BluprintWebData, CraftState } from "../state/craft"

const SET_CRAFT_STATE = "[craft] set state"
const ADD_BLUEPRINT = "[craft] add blueprint"
const REMOVE_BLUEPRINT = "[craft] remove blueprint"
const ADD_BLUEPRINT_DATA = "[craft] add blueprint data"
const SET_BLUEPRINT_QUANTITY = "[craft] set blueprint quantity"
const CREATE_BUDGET_PAGE = "[craft] create budget page"
const CREATE_BUDGET_PAGE_DONE = "[craft] create budget page done"

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

const createBudgetPage = (name: string) => ({
    type: CREATE_BUDGET_PAGE,
    payload: {
        name
    }
})

const createBudgetPageDone = (name: string) => ({
    type: CREATE_BUDGET_PAGE_DONE,
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
    CREATE_BUDGET_PAGE,
    CREATE_BUDGET_PAGE_DONE,
    setCraftState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
    createBudgetPage,
    createBudgetPageDone,
}
