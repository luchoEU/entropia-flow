import { OPERATION_REFINE_LME, OPERATION_REFINE_ME, OPERATION_REFINE_NB } from "../state/actives"
import { RefineState } from "../state/refine"

const refineTitle = {
    me: 'Mind Essence',
    lme: 'Light Mind Essence',
    nb: 'Nutrio Bar',
}

const refineOperation = {
    me: OPERATION_REFINE_ME,
    lme: OPERATION_REFINE_LME,
    nb: OPERATION_REFINE_NB,
}

const refineSheetsMethod = {
    me: 'refineME',
    lme: 'refineLME',
    nb: 'refineNB',
}

const initialState: RefineState = {
    me: {
        amount: '1000',
        pending: false,
    },
    lme: {
        amount: '1000',
        pending: false,
    },
    nb: {
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
