import { BackgroundType } from '../../../stream/background'
import StreamRenderData from '../../../stream/data'
import { StreamState, StreamVariable } from "../state/stream"

const SET_STREAM_STATE = "[stream] set state"
const SET_STREAM_ENABLED = "[stream] set enabled"
const SET_STREAM_BACKGROUND_SELECTED = "[stream] set background selected"
const SET_STREAM_VARIABLES = "[stream] set variables"
const SET_STREAM_HTML_TEMPLATE = "[stream] set html template"
const SET_STREAM_CSS_TEMPLATE = "[stream] set css template"
const SET_STREAM_DATA = "[stream] set data"
const SET_STREAM_EDITING = "[stream] set editing"
const SET_STREAM_STARED = "[stream] set stared"
const SET_STREAM_NAME = "[stream] set name"
const ADD_STREAM_LAYOUT = "[stream] add layout"
const ADD_STREAM_USER_VARIABLE = "[stream] add user variable"
const REMOVE_STREAM_LAYOUT = "[stream] remove layout"
const REMOVE_STREAM_USER_VARIABLE = "[stream] remove user variable"
const SET_STREAM_USER_VARIABLE_PARTIAL = "[stream] set user variable partial"

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

const setStreamEditing = (layoutId: string) => ({
    type: SET_STREAM_EDITING,
    payload: {
        layoutId
    }
})

const setStreamStared = (layoutId: string, stared: boolean) => ({
    type: SET_STREAM_STARED,
    payload: {
        layoutId,
        stared
    }
})

const setStreamHtmlTemplate = (template: string) => ({
    type: SET_STREAM_HTML_TEMPLATE,
    payload: {
        template
    }
})

const setStreamCssTemplate = (template: string) => ({
    type: SET_STREAM_CSS_TEMPLATE,
    payload: {
        template
    }
})

const setStreamName = (name: string) => ({
    type: SET_STREAM_NAME,
    payload: {
        name
    }
})

const setStreamVariables = (source: string, variables: StreamVariable[]) => ({
    type: SET_STREAM_VARIABLES,
    payload: {
        source,
        variables
    }
})

const addStreamLayout = {
    type: ADD_STREAM_LAYOUT
}

const removeStreamLayout = (layoutId: string) => ({
    type: REMOVE_STREAM_LAYOUT,
    payload: {
        layoutId
    }
})

const addStreamUserVariable = (isImage: boolean) => ({
    type: ADD_STREAM_USER_VARIABLE,
    payload: {
        isImage
    }
})


const removeStreamUserVariable = (id: number) => ({
    type: REMOVE_STREAM_USER_VARIABLE,
    payload: {
        id
    }
})

const setStreamUserVariablePartial = (id: number, partial: Partial<StreamVariable>) => ({
    type: SET_STREAM_USER_VARIABLE_PARTIAL,
    payload: {
        id,
        partial
    }
})

export {
    SET_STREAM_STATE,
    SET_STREAM_ENABLED,
    SET_STREAM_BACKGROUND_SELECTED,
    SET_STREAM_VARIABLES,
    SET_STREAM_HTML_TEMPLATE,
    SET_STREAM_CSS_TEMPLATE,
    SET_STREAM_DATA,
    SET_STREAM_EDITING,
    SET_STREAM_STARED,
    SET_STREAM_NAME,
    ADD_STREAM_LAYOUT,
    ADD_STREAM_USER_VARIABLE,
    REMOVE_STREAM_LAYOUT,
    REMOVE_STREAM_USER_VARIABLE,
    SET_STREAM_USER_VARIABLE_PARTIAL,
    setStreamState,
    setStreamEnabled,
    setStreamBackgroundSelected,
    setStreamVariables,
    setStreamHtmlTemplate,
    setStreamCssTemplate,
    setStreamData,
    setStreamEditing,
    setStreamStared,
    setStreamName,
    addStreamLayout,
    addStreamUserVariable,
    removeStreamLayout,
    removeStreamUserVariable,
    setStreamUserVariablePartial,
}
