import { RefineState } from "../state/refine"

const SET_REFINE_STATE = "[refine] set state"
const REFINE_AMOUNT_CHANGED = "[refine] amount changed"
const ADD_REFINE_TO_SHEET = "[refine] add sheet"
const ADD_REFINE_TO_SHEET_DONE = "[refine] add sheet done"

const setRefineState = (state: RefineState) => ({
    type: SET_REFINE_STATE,
    payload: {
        state
    }
})

const refineAmountChanged = (material: string) => (amount: string) => ({
    type: REFINE_AMOUNT_CHANGED,
    payload: {
        material,
        amount
    }
})

const addRefineToSheet = (material: string, amount: string) => ({
    type: ADD_REFINE_TO_SHEET,
    payload: {
        material,
        amount
    }
})

const addRefineToSheetDone = (material: string) => ({
    type: ADD_REFINE_TO_SHEET_DONE,
    payload: {
        material
    }
})

export {
    SET_REFINE_STATE,
    REFINE_AMOUNT_CHANGED,
    ADD_REFINE_TO_SHEET,
    ADD_REFINE_TO_SHEET_DONE,
    setRefineState,
    refineAmountChanged,
    addRefineToSheet,
    addRefineToSheetDone
}
