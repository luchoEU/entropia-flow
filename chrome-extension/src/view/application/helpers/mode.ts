import ModeState from "../state/mode";

const initialState: ModeState = {
    showSubtitles: true,
    showVisibleToggle: false,
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

export {
    initialState,
    reduceSetModeState,
    reduceSetShowSubtitles,
    reduceSetShowVisibleToggle,
}
