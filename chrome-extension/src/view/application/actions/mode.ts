import ModeState from "../state/mode"

const SET_MODE_STATE = '[mode] set state'
const MODE_SHOW_SUBTITLES = '[mode] show subtitles'
const MODE_SHOW_VISIBLE_TOGGLE = '[mode] show visible toggle'

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

const setShowVisibleToggle = (showVisibleToggle: boolean) => ({
    type: MODE_SHOW_VISIBLE_TOGGLE,
    payload: {
        showVisibleToggle
    }
})

export {
    SET_MODE_STATE,
    MODE_SHOW_SUBTITLES,
    MODE_SHOW_VISIBLE_TOGGLE,
    setModeState,
    setShowSubtitles,
    setShowVisibleToggle,
}
