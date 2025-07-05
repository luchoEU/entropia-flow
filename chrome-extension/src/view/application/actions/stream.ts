import { NavigateFunction } from 'react-router-dom'
import { BackgroundType } from '../../../stream/background'
import StreamRenderData, { StreamExportLayout, StreamRenderLayoutSet } from '../../../stream/data'
import { getStreamIn } from '../selectors/stream'
import { StreamState, StreamStateVariable, StreamTemporalVariable, StreamUserVariable } from "../state/stream"
import { AppDispatch, RootState } from '../store'
import { navigateTo, streamEditorUrl } from './navigation'

const SET_STREAM_STATE = "[stream] set state"
const SET_STREAM_ENABLED = "[stream] set enabled"
const SET_STREAM_ADVANCED = "[stream] set advanced"
const SET_STREAM_BACKGROUND_SELECTED = "[stream] set background selected"
const SET_STREAM_VARIABLES = "[stream] set variables"
const SET_STREAM_TEMPORAL_VARIABLES = "[stream] set temporal variables"
const SET_STREAM_HTML_TEMPLATE = "[stream] set html template"
const SET_STREAM_CSS_TEMPLATE = "[stream] set css template"
const SET_STREAM_DATA = "[stream] set data"
const SET_STREAM_STARED = "[stream] set stared"
const SET_STREAM_NAME = "[stream] set name"
const SET_STREAM_AUTHOR = "[stream] set author"
const ADD_STREAM_LAYOUT = "[stream] add layout"
const ADD_STREAM_USER_VARIABLE = "[stream] add user variable"
const REMOVE_STREAM_LAYOUT = "[stream] remove layout"
const REMOVE_STREAM_USER_VARIABLE = "[stream] remove user variable"
const SET_STREAM_USER_VARIABLE_PARTIAL = "[stream] set user variable partial"
const CLONE_STREAM_LAYOUT = "[stream] clone layout"
const IMPORT_STREAM_LAYOUT_FROM_FILE = "[stream] import layout from file"

const setStreamState = (state: StreamState) => ({
    type: SET_STREAM_STATE,
    payload: { state }
})

const setStreamEnabled = (enabled: boolean) => ({
    type: SET_STREAM_ENABLED,
    payload: { enabled }
})

const setStreamAdvanced = (advanced: boolean) => ({
    type: SET_STREAM_ADVANCED,
    payload: { advanced }
})

const _getUnique = (used: string[], base: string, noNumberName: string = undefined): string => {
    let n = 1;
    let name = noNumberName;
    while (!name || used.includes(name)) {
        name = `${base}${n++}`;
    }
    return name;
}

const _getUniqueLayoutId = (layouts: StreamRenderLayoutSet, name: string): string => {
    const baseId = (name.startsWith('entropiaflow.') ? `user.${name}` : name).replace(' ', '_');
    return _getUnique(Object.keys(layouts), `${baseId}_`, baseId);
}

const _getUniqueLayoutName = (layouts: StreamRenderLayoutSet, base: string, noNumberName?: string): string =>
    _getUnique(Object.values(layouts).map(l => l.name), base, noNumberName);

const cloneStreamLayout = (navigate: NavigateFunction, layoutId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const layouts = getStreamIn(getState()).layouts;
    const baseName = `${layouts[layoutId].name} copy`;
    const newName = _getUniqueLayoutName(layouts, `${baseName} `, baseName);
    const newLayoutId = _getUniqueLayoutId(layouts, newName);
    dispatch({
        type: CLONE_STREAM_LAYOUT,
        payload: { layoutId, newLayoutId, newName }
    })
    dispatch(navigateTo(navigate, streamEditorUrl(newLayoutId)))
}

const setStreamBackgroundSelected = (layoutId: string, backgroundType: BackgroundType) => ({
    type: SET_STREAM_BACKGROUND_SELECTED,
    payload: { layoutId, backgroundType }
})

const setStreamData = (data: StreamRenderData) => ({
    type: SET_STREAM_DATA,
    payload: { data }
})

const setStreamStared = (layoutId: string) => (stared: boolean) => ({
    type: SET_STREAM_STARED,
    payload: { layoutId, stared }
})

const setStreamHtmlTemplate = (layoutId: string) => (template: string) => ({
    type: SET_STREAM_HTML_TEMPLATE,
    payload: { layoutId, template }
})

const setStreamCssTemplate = (layoutId: string) => (template: string) => ({
    type: SET_STREAM_CSS_TEMPLATE,
    payload: { layoutId, template }
})

const setStreamName = (layoutId: string) => (name: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const newLayoutId = _getUniqueLayoutId(getStreamIn(getState()).layouts, name);
    dispatch({
        type: SET_STREAM_NAME,
        payload: { layoutId, newLayoutId, name }
    })
}

const setStreamAuthor = (layoutId: string) => (author: string) => ({
    type: SET_STREAM_AUTHOR,
    payload: { layoutId, author }
})

const setStreamVariables = (source: string, variables: StreamStateVariable[]) => ({
    type: SET_STREAM_VARIABLES,
    payload: { source, variables }
})

const setStreamTemporalVariables = (source: string, variables: StreamTemporalVariable[]) => ({
    type: SET_STREAM_TEMPORAL_VARIABLES,
    payload: { source, variables }
})

const addStreamLayout = (navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const layouts = getStreamIn(getState()).layouts;
    const name = _getUniqueLayoutName(layouts, 'Layout ');
    const layoutId = _getUniqueLayoutId(layouts, name);
    dispatch({
        type: ADD_STREAM_LAYOUT,
        payload: { layoutId, name }
    })
    dispatch(navigateTo(navigate, streamEditorUrl(layoutId)))
}

const importStreamLayoutFromFile = (layout: StreamExportLayout, navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const layouts = getStreamIn(getState()).layouts;
    const layoutId = _getUniqueLayoutId(layouts, layout.name);
    dispatch({
        type: IMPORT_STREAM_LAYOUT_FROM_FILE,
        payload: { layoutId, layout }
    })
    dispatch(navigateTo(navigate, streamEditorUrl(layoutId)))
}

const removeStreamLayout = (layoutId: string) => ({
    type: REMOVE_STREAM_LAYOUT,
    payload: { layoutId }
})

const addStreamUserVariable = (isImage: boolean) => ({
    type: ADD_STREAM_USER_VARIABLE,
    payload: { isImage }
})


const removeStreamUserVariable = (id: number) => ({
    type: REMOVE_STREAM_USER_VARIABLE,
    payload: { id }
})

const setStreamUserVariablePartial = (id: number, partial: Partial<StreamUserVariable>) => ({
    type: SET_STREAM_USER_VARIABLE_PARTIAL,
    payload: { id, partial }
})

export {
    SET_STREAM_STATE,
    SET_STREAM_ENABLED,
    SET_STREAM_ADVANCED,
    SET_STREAM_BACKGROUND_SELECTED,
    SET_STREAM_VARIABLES,
    SET_STREAM_TEMPORAL_VARIABLES,
    SET_STREAM_HTML_TEMPLATE,
    SET_STREAM_CSS_TEMPLATE,
    SET_STREAM_DATA,
    SET_STREAM_STARED,
    SET_STREAM_NAME,
    SET_STREAM_AUTHOR,
    ADD_STREAM_LAYOUT,
    ADD_STREAM_USER_VARIABLE,
    REMOVE_STREAM_LAYOUT,
    REMOVE_STREAM_USER_VARIABLE,
    SET_STREAM_USER_VARIABLE_PARTIAL,
    CLONE_STREAM_LAYOUT,
    IMPORT_STREAM_LAYOUT_FROM_FILE,
    setStreamState,
    setStreamEnabled,
    setStreamAdvanced,
    setStreamBackgroundSelected,
    setStreamVariables,
    setStreamTemporalVariables,
    setStreamHtmlTemplate,
    setStreamCssTemplate,
    setStreamData,
    setStreamStared,
    setStreamName,
    setStreamAuthor,
    addStreamLayout,
    addStreamUserVariable,
    removeStreamLayout,
    removeStreamUserVariable,
    setStreamUserVariablePartial,
    cloneStreamLayout,
    importStreamLayoutFromFile,
}
