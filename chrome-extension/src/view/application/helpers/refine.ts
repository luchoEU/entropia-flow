import { OPERATION_REFINE_LME, OPERATION_REFINE_ME } from "../state/actives"
import { RefineState } from "../state/refine"

const refineTitle = {
    me: 'Mind Essence',
    lme: 'Light Mind Essence'
}

const refineOperation = {
    me: OPERATION_REFINE_ME,
    lme: OPERATION_REFINE_LME,
}

const refineSheetsMethod = {
    me: 'refineME',
    lme: 'refineLME',
}

const initialState = {
    me: {
        amount: '1000',
        pending: false,
    },
    lme: {
        amount: '1000',
        pending: false,
    }
}

const setState = (state: RefineState, inState: RefineState): RefineState => inState

const refineAmountChanged = (state: RefineState, material: string, amount: string): RefineState => {
    const inState = { ...state }
    inState[material] = {
        ...inState[material],
        amount
    }
    return inState
}

const addRefineChanged = (state: RefineState, material: string, pending: boolean): RefineState => {
    const inState = { ...state }
    inState[material] = {
        ...inState[material],
        pending
    }
    return inState
}

export {
    refineTitle,
    refineOperation,
    refineSheetsMethod,
    initialState,
    setState,
    refineAmountChanged,
    addRefineChanged
}
