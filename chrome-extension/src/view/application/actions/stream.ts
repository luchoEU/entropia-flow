import { BackgroundType } from '../../../stream/background'
import { StreamState } from "../state/stream"

const SET_STREAM_STATE = "[stream] set state"
const SET_STREAM_ENABLED = "[stream] set enabled"
const SET_STREAM_BACKGROUND_EXPANDED = "[stream] set background expanded"
const SET_STREAM_BACKGROUND_SELECTED = "[stream] set background selected"

const setStreamState = (state: StreamState) => ({
    type: SET_STREAM_STATE,
    payload: {
        state
    }
})

const setStreamEnabled = (enabled: boolean) => ({
    type: SET_STREAM_ENABLED,
    payload: {
        enabled
    }
})

const setStreamBackgroundExpanded = (expanded: boolean) => ({
    type: SET_STREAM_BACKGROUND_EXPANDED,
    payload: {
        expanded
    }
})

const setStreamBackgroundSelected = (selected: BackgroundType) => ({
    type: SET_STREAM_BACKGROUND_SELECTED,
    payload: {
        selected
    }
})

export {
    SET_STREAM_STATE,
    SET_STREAM_ENABLED,
    SET_STREAM_BACKGROUND_EXPANDED,
    SET_STREAM_BACKGROUND_SELECTED,
    setStreamState,
    setStreamEnabled,
    setStreamBackgroundExpanded,
    setStreamBackgroundSelected,
}