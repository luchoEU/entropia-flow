import ModeState from "../state/mode"

const SET_MODE_STATE = '[mode] set state'
const MODE_SHOW_SUBTITLES = '[mode] show subtitles'
const MODE_SHOW_VISIBLE_TOGGLE = '[mode] show visible toggle'
const MODE_PIN_MENU = '[mode] pin menu'
const MODE_PIN_STREAM_VIEW = '[mode] pin stream view'

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

const pinMenu = (pinned: boolean) => ({
    type: MODE_PIN_MENU,
    payload: {
        pinned
    }
})

const pinStreamView = (pinned: boolean) => ({
    type: MODE_PIN_STREAM_VIEW,
    payload: {
        pinned
    }
})

export {
    SET_MODE_STATE,
    MODE_SHOW_SUBTITLES,
    MODE_SHOW_VISIBLE_TOGGLE,
    MODE_PIN_MENU,
    MODE_PIN_STREAM_VIEW,
    setModeState,
    setShowSubtitles,
    setShowVisibleToggle,
    pinMenu,
    pinStreamView
}
