import { RefineState } from "../state/refine"

const SET_REFINE_STATE = "[refine] set state"
const REFINE_AMOUNT_CHANGED = "[refine] amount changed"

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

export {
    SET_REFINE_STATE,
    REFINE_AMOUNT_CHANGED,
    setRefineState,
    refineAmountChanged,
}
