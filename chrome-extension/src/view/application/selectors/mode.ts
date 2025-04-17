import ModeState from "../state/mode";

export const getMode = (state: any): ModeState => state.mode
export const getShowVisibleToggle = (state: any): boolean => getMode(state).showVisibleToggle
