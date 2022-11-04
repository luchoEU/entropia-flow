import { OPERATION_USE_LME, OPERATION_USE_ME, OPERATION_USE_NB } from "../state/actives"
import { UseState } from "../state/use"

const useTitle = {
    me: 'Mind Essence',
    lme: 'Light Mind Essence',
    nb: 'Nutrio Bar',
}

const useOperation = {
    me: OPERATION_USE_ME,
    lme: OPERATION_USE_LME,
    nb: OPERATION_USE_NB,
}

const useSheetsMethod = {
    me: 'useME',
    lme: 'useLME',
    nb: 'useNB',
}

const initialState: UseState = {
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

const setState = (state: UseState, inState: UseState): UseState => inState

const useAmountChanged = (state: UseState, material: string, amount: string): UseState => {
    const inState = { ...state }
    inState[material] = {
        ...inState[material],
        amount
    }
    return inState
}

const addUseChanged = (state: UseState, material: string, pending: boolean): UseState => {
    const inState = { ...state }
    inState[material] = {
        ...inState[material],
        pending
    }
    return inState
}

export {
    useTitle,
    useOperation,
    useSheetsMethod,
    initialState,
    setState,
    useAmountChanged,
    addUseChanged
}
