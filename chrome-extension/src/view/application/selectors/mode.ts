import ModeState from "../state/mode";

export const getMode = (state: any): ModeState => state.mode
export const getShowVisibleToggle = (state: any): boolean => getMode(state).showVisibleToggle
export const getShowSubtitles = (state: any): boolean => getMode(state).showSubtitles
export const getShowVisible = (state: any): boolean => getShowSubtitles(state) && getShowVisibleToggle(state)
