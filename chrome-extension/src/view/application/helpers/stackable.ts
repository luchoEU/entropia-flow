import { OPERATION_ADD_DILUTED, OPERATION_ADD_LME, OPERATION_ADD_ME, OPERATION_ADD_NEXUS } from "../state/actives"
import { StackableOneStateIn, StackableOneStateOut, StackableState, StackableStateIn } from "../state/stackable"

const STACKABLE_NEXUS = 'nexus'
const STACKABLE_ME = 'me'
const STACKABLE_LME = 'lme'
const STACKABLE_DILUTED = 'diluted'

const stackableTitle = {
    nexus: 'Buy Nexus',
    me: 'Buy ME',
    lme: 'Buy LME',
    diluted: 'Buy Diluted Sweat',
}

const stackableOperation = {
    nexus: OPERATION_ADD_NEXUS,
    me: OPERATION_ADD_ME,
    lme: OPERATION_ADD_LME,
    diluted: OPERATION_ADD_DILUTED,
}

const stackableSheetsMethod = {
    nexus: 'buyNexus',
    me: 'buyME',
    lme: 'buyLME',
    diluted: 'buyDiluted',
}

const calcOne = (s: StackableOneStateIn): StackableOneStateOut => ({
    value: (Number(s.ttValue) * Number(s.markup) / 100).toFixed(2)
})

const calc = (s: StackableStateIn): any => {
    return Object.fromEntries(
        Object.entries(s).map(entry => [entry[0], calcOne(entry[1])])
    )
}

const initialStateIn: StackableStateIn = {
    nexus: {
        ttValue: '100',
        markup: '102',
        pending: false,
    },
    me: {
        ttValue: '100',
        markup: '115',
        pending: false,
    },
    lme: {
        ttValue: '100',
        markup: '103',
        pending: false,
    },
    diluted: {
        ttValue: '100',
        markup: '103',
        pending: false,
    }
}

const initialState: StackableState = {
    in: initialStateIn,
    out: calc(initialStateIn)
}

const setState = (state: StackableState, inState: StackableStateIn): StackableState => ({
    in: inState,
    out: calc(inState)
})

const stackableTTValueChanged = (state: StackableState, material: string, ttValue: string): StackableState => {
    const inState = { ...state.in }
    inState[material] = {
        ...inState[material],
        ttValue
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

const stackableMarkupChanged = (state: StackableState, material: string, markup: string): StackableState => {
    const inState = { ...state.in }
    inState[material] = {
        ...inState[material],
        markup
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

const addStackableChanged = (state: StackableState, material: string, pending: boolean): StackableState => {
    const inState = { ...state.in }
    inState[material] = {
        ...inState[material],
        pending
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

export {
    STACKABLE_NEXUS,
    STACKABLE_ME,
    STACKABLE_LME,
    STACKABLE_DILUTED,
    stackableTitle,
    stackableOperation,
    stackableSheetsMethod,
    initialState,
    setState,
    stackableTTValueChanged,
    stackableMarkupChanged,
    addStackableChanged
}
