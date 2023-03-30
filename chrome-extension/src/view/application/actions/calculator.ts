import { CalculatorStateIn } from "../state/calculator"

const SET_CALCULATOR_STATE = "[calc] set state"
const SWEAT_CHANGED = "[calc] sweat changed"
const FRUIT_CHANGED = "[calc] fruit changed"
const NEXUS_CHANGED = "[calc] nexus changed"
const DILUTED_CHANGED = "[calc] diluted changed"
const SWEETSTUFF_CHANGED = "[calc] sweetstuff changed"
const ME_MARKUP_CHANGED = "[calc] ME markup changed"
const ME_VALUE_CHANGED = "[calc] ME value changed"
const LME_MARKUP_CHANGED = "[calc] LME markup changed"
const LME_VALUE_CHANGED = "[calc] LME value changed"
const NB_MARKUP_CHANGED = "[calc] NB markup changed"
const NB_VALUE_CHANGED = "[calc] NB value changed"

const setCalculatorState = (state: CalculatorStateIn) => ({
    type: SET_CALCULATOR_STATE,
    payload: {
        state
    }
})

const sweatChanged = (price: string) => ({
    type: SWEAT_CHANGED,
    payload: {
        price
    }
})

const fruitChanged = (price: string) => ({
    type: FRUIT_CHANGED,
    payload: {
        price
    }
})

const nexusChanged = (price: string) => ({
    type: NEXUS_CHANGED,
    payload: {
        price
    }
})

const dilutedChanged = (price: string) => ({
    type: DILUTED_CHANGED,
    payload: {
        price
    }
})

const sweetstuffChanged = (price: string) => ({
    type: SWEETSTUFF_CHANGED,
    payload: {
        price
    }
})

const meMarkupChanged = (markup: string) => ({
    type: ME_MARKUP_CHANGED,
    payload: {
        markup
    }
})

const meValueChanged = (value: string) => ({
    type: ME_VALUE_CHANGED,
    payload: {
        value
    }
})

const lmeMarkupChanged = (markup: string) => ({
    type: LME_MARKUP_CHANGED,
    payload: {
        markup
    }
})

const lmeValueChanged = (value: string) => ({
    type: LME_VALUE_CHANGED,
    payload: {
        value
    }
})

const nbMarkupChanged = (markup: string) => ({
    type: NB_MARKUP_CHANGED,
    payload: {
        markup
    }
})

const nbValueChanged = (value: string) => ({
    type: NB_VALUE_CHANGED,
    payload: {
        value
    }
})

export {
    SET_CALCULATOR_STATE,
    SWEAT_CHANGED,
    FRUIT_CHANGED,
    NEXUS_CHANGED,
    DILUTED_CHANGED,
    SWEETSTUFF_CHANGED,
    ME_MARKUP_CHANGED,
    ME_VALUE_CHANGED,
    LME_MARKUP_CHANGED,
    LME_VALUE_CHANGED,
    NB_MARKUP_CHANGED,
    NB_VALUE_CHANGED,
    setCalculatorState,
    sweatChanged,
    fruitChanged,
    nexusChanged,
    dilutedChanged,
    sweetstuffChanged,
    meMarkupChanged,
    meValueChanged,
    lmeMarkupChanged,
    lmeValueChanged,
    nbMarkupChanged,
    nbValueChanged,
}
