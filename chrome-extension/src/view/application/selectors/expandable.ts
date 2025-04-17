import ExpandableState from "../state/expandable";

export const getExpandable = (state: any): ExpandableState => state.expandable
export const getExpanded = (id: string) => (state: any): boolean => !getExpandable(state).collapsed.includes(id)
export const getVisible = (id: string) => (state: any): boolean => getVisibleByExpandable(getExpandable(state), id)
export const getVisibleByExpandable = (expandable: ExpandableState, id: string): boolean => !expandable.hidden.includes(id)
