import ExpandableState from "../state/expandable"

const initialExpandableState: ExpandableState = {
    collapsed: [],
    hidden: ['TabularSection.[log] missing'],
}

const reduceSetExpandableState = (state: ExpandableState, newState: ExpandableState): ExpandableState => newState

const reduceSetExpanded = (state: ExpandableState, selector: string, expanded: boolean): ExpandableState => ({
    ...state,
    collapsed: expanded ? state.collapsed.filter(x => x !== selector) : [...state.collapsed, selector]
})

const reduceSetVisible = (state: ExpandableState, selector: string, visible: boolean): ExpandableState => ({
    ...state,
    hidden: visible ? state.hidden.filter(x => x !== selector) : [...state.hidden, selector]
})

export {
    initialExpandableState,
    reduceSetExpandableState,
    reduceSetExpanded,
    reduceSetVisible,
}
