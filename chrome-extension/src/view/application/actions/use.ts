import { UseState } from "../state/use"

const SET_USE_STATE = "[use] set state"
const USE_AMOUNT_CHANGED = "[use] amount changed"

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

export {
    SET_USE_STATE,
    USE_AMOUNT_CHANGED,
    setUseState,
    useAmountChanged,
}
