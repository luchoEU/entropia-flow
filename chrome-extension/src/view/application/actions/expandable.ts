import ExpandableState from '../state/expandable'

const SET_EXPANDABLE_STATE = '[expandable] set state'
const SET_EXPANDED = '[expandable] set expanded'
const SET_VISIBLE = '[expandable] set visible'

const setExpandableState = (state: ExpandableState) => ({
    type: SET_EXPANDABLE_STATE,
    payload: {
        state
    }
})

const setExpanded = (selector: string) => (expanded: boolean) => ({
    type: SET_EXPANDED,
    payload: {
        selector,
        expanded
    }
})

const setVisible = (selector: string) => (visible: boolean) => ({
    type: SET_VISIBLE,
    payload: {
        selector,
        visible
    }
})

export {
    SET_EXPANDABLE_STATE,
    SET_EXPANDED,
    SET_VISIBLE,
    setExpandableState,
    setExpanded,
    setVisible,
}
