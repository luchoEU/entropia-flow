import { StackableStateIn } from "../state/stackable"

const SET_STACKABLE_STATE = "[stackable] set state"
const STACKABLE_TT_VALUE_CHANGED = "[stackable] tt value changed"
const STACKABLE_MARKUP_CHANGED = "[stackable] markup changed"

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

export {
    SET_STACKABLE_STATE,
    STACKABLE_TT_VALUE_CHANGED,
    STACKABLE_MARKUP_CHANGED,
    setStackableState,
    stackableTTValueChanged,
    stackableMarkupChanged,
}
