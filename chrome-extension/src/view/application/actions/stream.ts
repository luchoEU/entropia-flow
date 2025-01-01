import { BackgroundType } from '../../../stream/background'
import StreamRenderData from '../../../stream/data'
import { StreamState, StreamVariable } from "../state/stream"

const SET_STREAM_STATE = "[stream] set state"
const SET_STREAM_ENABLED = "[stream] set enabled"
const SET_STREAM_BACKGROUND_EXPANDED = "[stream] set background expanded"
const SET_STREAM_BACKGROUND_SELECTED = "[stream] set background selected"
const SET_STREAM_VARIABLES = "[stream] set variables"
const SET_STREAM_TEMPLATE = "[stream] set template"
const SET_STREAM_CONTAINER_STYLE = "[stream] set container style"
const SET_STREAM_DATA = "[stream] set data"
const SET_STREAM_EDITING = "[stream] set editing"

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

const setStreamData = (data: StreamRenderData) => ({
    type: SET_STREAM_DATA,
    payload: {
        data
    }
})

const setStreamEditing = (editing: boolean) => ({
    type: SET_STREAM_EDITING,
    payload: {
        editing
    }
})

const setStreamTemplate = (template: string) => ({
    type: SET_STREAM_TEMPLATE,
    payload: {
        template
    }
})

const setStreamContainerStyle = (style: string) => ({
    type: SET_STREAM_CONTAINER_STYLE,
    payload: {
        style
    }
})

const setStreamVariables = (source: string, variables: StreamVariable[]) => ({
    type: SET_STREAM_VARIABLES,
    payload: {
        source,
        variables
    }
})

export {
    SET_STREAM_STATE,
    SET_STREAM_ENABLED,
    SET_STREAM_BACKGROUND_EXPANDED,
    SET_STREAM_BACKGROUND_SELECTED,
    SET_STREAM_VARIABLES,
    SET_STREAM_CONTAINER_STYLE,
    SET_STREAM_TEMPLATE,
    SET_STREAM_DATA,
    SET_STREAM_EDITING,
    setStreamState,
    setStreamEnabled,
    setStreamBackgroundExpanded,
    setStreamBackgroundSelected,
    setStreamVariables,
    setStreamTemplate,
    setStreamContainerStyle,
    setStreamData,
    setStreamEditing
}