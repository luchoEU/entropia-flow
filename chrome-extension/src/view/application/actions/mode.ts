import ModeState from "../state/mode"

const SET_MODE_STATE = '[mode] set state'
const MODE_SHOW_SUBTITLES = '[mode] show subtitles'

const setModeState = (state: ModeState) => ({
    type: SET_MODE_STATE,
    payload: {
        state
    }
})

const setShowSubtitles = (showSubtitles: boolean) => ({
    type: MODE_SHOW_SUBTITLES,
    payload: {
        showSubtitles
    }
})

export {
    SET_MODE_STATE,
    MODE_SHOW_SUBTITLES,
    setModeState,
    setShowSubtitles
}
