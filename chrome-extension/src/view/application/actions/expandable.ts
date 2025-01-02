import ExpandableState from "../state/expandable"

const SET_EXPANDABLE_STATE = "[expandable] set state"
const SET_EXPANDED = "[expandable] set expanded"

const setExpandableState = (state: ExpandableState) => ({
    type: SET_EXPANDABLE_STATE,
    payload: {
        state
    }
})

const setExpanded = (id: string) => (expanded: boolean) => ({
    type: SET_EXPANDED,
    payload: {
        id,
        expanded
    }
})

export {
    SET_EXPANDABLE_STATE,
    SET_EXPANDED,
    setExpandableState,
    setExpanded,
}
