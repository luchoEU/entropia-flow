import ExpandableState from "../state/expandable";

export const getExpandable = (state: any): ExpandableState => state.expandable
export const getExpanded = (id: string) => (state: any): boolean => getExpandable(state).expanded.includes(id)
export const getVisible = (id: string) => (state: any): boolean => !getExpandable(state).hidden.includes(id)
