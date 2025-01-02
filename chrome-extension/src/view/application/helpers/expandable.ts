import ExpandableState from "../state/expandable"

const initialExpandableState: ExpandableState = {
    expanded: []
}

const reduceSetExpandableState = (state: ExpandableState, newState: ExpandableState): ExpandableState => newState

const reduceSetExpanded = (state: ExpandableState, id: string, expanded: boolean): ExpandableState => ({
    ...state,
    expanded: expanded ? [...state.expanded, id] : state.expanded.filter(x => x !== id)
})

export {
    initialExpandableState,
    reduceSetExpandableState,
    reduceSetExpanded,
}
