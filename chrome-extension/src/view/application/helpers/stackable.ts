import { OPERATION_ADD_DILUTED, OPERATION_ADD_LME, OPERATION_ADD_ME, OPERATION_ADD_NB, OPERATION_ADD_NEXUS, OPERATION_ADD_SWEETSTUFF } from "../state/actives"
import { StackableOneStateIn, StackableOneStateOut, StackableState, StackableStateIn } from "../state/stackable"

const STACKABLE_NEXUS = 'nexus'
const STACKABLE_ME = 'me'
const STACKABLE_LME = 'lme'
const STACKABLE_NB = 'nb'
const STACKABLE_DILUTED = 'diluted'
const STACKABLE_SWEETSTUFF = 'sweetstuff'

const stackableTitle = {
    nexus: 'Buy Nexus',
    me: 'Buy ME',
    lme: 'Buy LME',
    nb: 'Buy NB',
    diluted: 'Buy Diluted Sweat',
    sweetstuff: 'Buy Sweetstuff',
}

const stackableOperation = {
    nexus: OPERATION_ADD_NEXUS,
    me: OPERATION_ADD_ME,
    lme: OPERATION_ADD_LME,
    nb: OPERATION_ADD_NB,
    diluted: OPERATION_ADD_DILUTED,
    sweetstuff: OPERATION_ADD_SWEETSTUFF,
}

const stackableSheetsMethod = {
    nexus: 'buyNexus',
    me: 'buyME',
    lme: 'buyLME',
    nb: 'buyNB',
    diluted: 'buyDiluted',
    sweetstuff: 'buySweetstuff',
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
    nb: {
        ttValue: '100',
        markup: '145',
        pending: false,
    },
    diluted: {
        ttValue: '100',
        markup: '103',
        pending: false,
    },
    sweetstuff: {
        ttValue: '100',
        markup: '110',
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
    STACKABLE_NB,
    STACKABLE_DILUTED,
    STACKABLE_SWEETSTUFF,
    stackableTitle,
    stackableOperation,
    stackableSheetsMethod,
    initialState,
    setState,
    stackableTTValueChanged,
    stackableMarkupChanged,
    addStackableChanged
}
