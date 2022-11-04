import { UseState } from "../state/use"

const SET_USE_STATE = "[use] set state"
const USE_AMOUNT_CHANGED = "[use] amount changed"
const ADD_USE_TO_SHEET = "[use] add sheet"
const ADD_USE_TO_SHEET_DONE = "[use] add sheet done"

const setUseState = (state: UseState) => ({
    type: SET_USE_STATE,
    payload: {
        state
    }
})

const useAmountChanged = (material: string) => (amount: string) => ({
    type: USE_AMOUNT_CHANGED,
    payload: {
        material,
        amount
    }
})

const addUseToSheet = (material: string, amount: string) => ({
    type: ADD_USE_TO_SHEET,
    payload: {
        material,
        amount
    }
})

const addUseToSheetDone = (material: string) => ({
    type: ADD_USE_TO_SHEET_DONE,
    payload: {
        material
    }
})

export {
    SET_USE_STATE,
    USE_AMOUNT_CHANGED,
    ADD_USE_TO_SHEET,
    ADD_USE_TO_SHEET_DONE,
    setUseState,
    useAmountChanged,
    addUseToSheet,
    addUseToSheetDone
}
