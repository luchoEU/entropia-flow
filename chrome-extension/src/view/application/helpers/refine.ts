import { RefineState } from "../state/refine"
import { refinedMap } from "./items"

const initialState: RefineState = {
    me: {
        amount: '1000',
    },
    lme: {
        amount: '1000',
    },
    nb: {
        amount: '1000',
    }
}

const setState = (state: RefineState, inState: RefineState): RefineState => inState

const refineAmountChanged = (state: RefineState, material: string, amount: string): RefineState => {
    const inState = { ...state }
    inState[refinedMap[material]] = {
        ...inState[refinedMap[material]],
        amount
    }
    return inState
}

export {
    initialState,
    setState,
    refineAmountChanged,
}
