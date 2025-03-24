import ModeState from "../state/mode";

const initialState: ModeState = {
    showSubtitles: false,
}

const reduceSetModeState = (state: ModeState, newState: ModeState): ModeState => newState;

const reduceSetShowSubtitles = (state: ModeState, showSubtitles: boolean): ModeState => ({
    ...state,
    showSubtitles
})

export {
    initialState,
    reduceSetModeState,
    reduceSetShowSubtitles,
}
