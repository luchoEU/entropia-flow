import { MaterialsMap } from '../state/materials'
import { RefinedState } from '../state/refined'

const SET_REFINED_STATE = '[refined] set state'
const SET_REFINED_EXPANDED = '[refined] set expanded'
const REFINED_VALUE_CHANGED = '[refined] value changed'
const REFINED_MARKUP_CHANGED = '[refined] markup changed'
const REFINED_MATERIAL_CHANGED = '[refined] material changed'
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

const refinedValueChanged = (material: string, m: MaterialsMap) => (value: string) => ({
    type: REFINED_VALUE_CHANGED,
    payload: {
        material,
        value,
        m
    }
})

const refinedMarkupChanged = (material: string, m: MaterialsMap) => (value: string) => ({
    type: REFINED_MARKUP_CHANGED,
    payload: {
        material,
        value,
        m
    }
})

const refinedMaterialChanged = (m: MaterialsMap) => ({
    type: REFINED_MATERIAL_CHANGED,
    payload: {
        m
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
    REFINED_MATERIAL_CHANGED,
    REFINED_SELL,
    setRefinedState,
    setRefinedExpanded,
    refinedValueChanged,
    refinedMarkupChanged,
    refinedMaterialChanged,
    refinedSell,
}
