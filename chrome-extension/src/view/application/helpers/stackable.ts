import { StackableOneStateIn, StackableOneStateOut, StackableState, StackableStateIn } from "../state/stackable"
import { refinedMap } from "./items"

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
    inState[refinedMap[material]] = {
        ...inState[refinedMap[material]],
        ttValue
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

const stackableMarkupChanged = (state: StackableState, material: string, markup: string): StackableState => {
    const inState = { ...state.in }
    inState[refinedMap[material]] = {
        ...inState[refinedMap[material]],
        markup
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

export {
    initialState,
    initialStateIn,
    setState,
    stackableTTValueChanged,
    stackableMarkupChanged,
}
