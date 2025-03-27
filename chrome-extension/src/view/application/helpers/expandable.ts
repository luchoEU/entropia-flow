import ExpandableState from "../state/expandable"

const initialExpandableState: ExpandableState = {
    expanded: [],
    hidden: ['TabularSection.[log] missing'],
}

const reduceSetExpandableState = (state: ExpandableState, newState: ExpandableState): ExpandableState => newState

const reduceSetExpanded = (state: ExpandableState, selector: string, expanded: boolean): ExpandableState => ({
    ...state,
    expanded: expanded ? [...state.expanded, selector] : state.expanded.filter(x => x !== selector)
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
