import { OPERATION_USE_LME, OPERATION_USE_ME, OPERATION_USE_NB } from "../state/actives"
import { UseState } from "../state/use"

const useTitle = {
    me: 'Mind Essence',
    lme: 'Light Mind Essence',
    nb: 'Nutrio Bar',
}

const initialState: UseState = {
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

const setState = (state: UseState, inState: UseState): UseState => inState

const useAmountChanged = (state: UseState, material: string, amount: string): UseState => {
    const inState = { ...state }
    inState[material] = {
        ...inState[material],
        amount
    }
    return inState
}

export {
    useTitle,
    initialState,
    setState,
    useAmountChanged,
}
