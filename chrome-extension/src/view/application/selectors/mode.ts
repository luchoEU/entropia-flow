import ModeState from "../state/mode";

export const getMode = (state: any): ModeState => state.mode
export const getShowVisibleToggle = (state: any): boolean => getMode(state).showVisibleToggle
export const getShowSubtitles = (state: any): boolean => getMode(state).showSubtitles
export const getShowVisibility = (state: any): boolean => getShowSubtitles(state) && getShowVisibleToggle(state)
export const getMenuPinned = (state: any): boolean => getMode(state).menuPinned
export const getStreamViewPinned = (state: any): boolean => getMode(state).streamViewPinned
