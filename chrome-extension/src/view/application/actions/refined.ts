import { RefinedState } from '../state/refined'

const SET_REFINED_STATE = '[refined] set state'
const SET_REFINED_EXPANDED = '[refined] set expanded'
const REFINED_VALUE_CHANGED = '[refined] value changed'
const REFINED_MARKUP_CHANGED = '[refined] markup changed'
const REFINED_SELL = '[refined] sell'

const setRefinedState = (state: RefinedState) => ({
    type: SET_REFINED_STATE,
    payload: {
        state
    }
})

const setRefinedExpanded = (material: string) => (expanded: boolean) => ({
    type: SET_REFINED_EXPANDED,
    payload: {
        material,
        expanded
    }
})

const refinedValueChanged = (material: string) => (value: string) => ({
    type: REFINED_VALUE_CHANGED,
    payload: {
        material,
        value
    }
})

const refinedMarkupChanged = (material: string) => (value: string) => ({
    type: REFINED_MARKUP_CHANGED,
    payload: {
        material,
        value
    }
})

const refinedSell = (material: string) => ({
    type: REFINED_SELL,
    payload: {
        material
    }
})

export {
    SET_REFINED_STATE,
    SET_REFINED_EXPANDED,
    REFINED_VALUE_CHANGED,
    REFINED_MARKUP_CHANGED,
    REFINED_SELL,
    setRefinedState,
    setRefinedExpanded,
    refinedValueChanged,
    refinedMarkupChanged,
    refinedSell,
}
