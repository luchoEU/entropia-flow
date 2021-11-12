import { StackableStateIn } from "../state/stackable"

const SET_STACKABLE_STATE = "[stackable] set state"
const STACKABLE_TT_VALUE_CHANGED = "[stackable] tt value changed"
const STACKABLE_MARKUP_CHANGED = "[stackable] markup changed"
const ADD_STACKABLE_TO_SHEET = "[stackable] add sheet"

const setStackableState = (state: StackableStateIn) => ({
    type: SET_STACKABLE_STATE,
    payload: {
        state
    }
})

const stackableTTValueChanged = (material: string) => (ttValue: string) => ({
    type: STACKABLE_TT_VALUE_CHANGED,
    payload: {
        material,
        ttValue
    }
})

const stackableMarkupChanged = (material: string) => (markup: string) => ({
    type: STACKABLE_MARKUP_CHANGED,
    payload: {
        material,
        markup
    }
})

const addStackableToSheet = (material: string, ttValue: string, markup: string) => ({
    type: ADD_STACKABLE_TO_SHEET,
    payload: {
        material,
        ttValue,
        markup
    }
})

export {
    SET_STACKABLE_STATE,
    STACKABLE_TT_VALUE_CHANGED,
    STACKABLE_MARKUP_CHANGED,
    ADD_STACKABLE_TO_SHEET,
    setStackableState,
    stackableTTValueChanged,
    stackableMarkupChanged,
    addStackableToSheet
}