import { StackableOneStateIn, StackableOneStateOut, StackableState, StackableStateIn } from "../state/stackable"
import { MATERIAL_DW, MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_NX, MATERIAL_ST } from "./materials"

const STACKABLE_NEXUS = 'nexus'
const STACKABLE_ME = 'me'
const STACKABLE_LME = 'lme'
const STACKABLE_NB = 'nb'
const STACKABLE_DILUTED = 'diluted'
const STACKABLE_SWEETSTUFF = 'sweetstuff'

const stackableTitle = {
    [MATERIAL_NX]: 'Buy Nexus',
    [MATERIAL_ME]: 'Buy ME',
    [MATERIAL_LME]: 'Buy LME',
    [MATERIAL_NB]: 'Buy NB',
    [MATERIAL_DW]: 'Buy Diluted Sweat',
    [MATERIAL_ST]: 'Buy Sweetstuff',
}
/*
const stackableOperation = {
    nexus: OPERATION_ADD_NEXUS,
    me: OPERATION_ADD_ME,
    lme: OPERATION_ADD_LME,
    nb: OPERATION_ADD_NB,
    diluted: OPERATION_ADD_DILUTED,
    sweetstuff: OPERATION_ADD_SWEETSTUFF,
}
*/

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
    },
    me: {
        ttValue: '100',
        markup: '115',
    },
    lme: {
        ttValue: '100',
        markup: '103',
    },
    nb: {
        ttValue: '100',
        markup: '145',
    },
    diluted: {
        ttValue: '100',
        markup: '103',
    },
    sweetstuff: {
        ttValue: '100',
        markup: '110',
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

export {
    STACKABLE_NEXUS,
    STACKABLE_ME,
    STACKABLE_LME,
    STACKABLE_NB,
    STACKABLE_DILUTED,
    STACKABLE_SWEETSTUFF,
    initialState,
    initialStateIn,
    stackableTitle,
    setState,
    stackableTTValueChanged,
    stackableMarkupChanged,
}
