import ModeState from "../state/mode";

const initialState: ModeState = {
    showSubtitles: true,
    showVisibleToggle: false,
    menuPinned: true,
    streamViewPinned: false
}

const reduceSetModeState = (state: ModeState, newState: ModeState): ModeState => newState;

const reduceSetShowSubtitles = (state: ModeState, showSubtitles: boolean): ModeState => ({
    ...state,
    showSubtitles
})

const reduceSetShowVisibleToggle = (state: ModeState, showVisibleToggle: boolean): ModeState => ({
    ...state,
    showVisibleToggle
})

const reduceSetMenuPinned = (state: ModeState, menuPinned: boolean): ModeState => ({
    ...state,
    menuPinned
})

const reduceSetStreamViewPinned = (state: ModeState, streamViewPinned: boolean): ModeState => ({
    ...state,
    streamViewPinned
})

export {
    initialState,
    reduceSetModeState,
    reduceSetShowSubtitles,
    reduceSetShowVisibleToggle,
    reduceSetMenuPinned,
    reduceSetStreamViewPinned
}
