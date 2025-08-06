import { NavigateFunction } from 'react-router-dom'
import { BackgroundType } from '../../../stream/background'
import { StreamExportLayout, StreamRenderData, StreamRenderLayoutSet } from '../../../stream/data'
import { getStreamIn } from '../selectors/stream'
import { StreamBaseVariable, StreamState, StreamStateVariable, StreamTemporalVariable, StreamUserImageVariable } from "../state/stream"
import { AppDispatch, RootState } from '../store'
import { navigateTo, streamEditorUrl, streamTrashUrl } from './navigation'

const SET_STREAM_STATE = "[stream] set state"
const SET_STREAM_ENABLED = "[stream] set enabled"
const SET_STREAM_ADVANCED = "[stream] set advanced"
const SET_STREAM_BACKGROUND_SELECTED = "[stream] set background selected"
const SET_STREAM_VARIABLES = "[stream] set variables"
const SET_STREAM_TEMPORAL_VARIABLES = "[stream] set temporal variables"
const SET_STREAM_FORMULA_JAVASCRIPT = "[stream] set formula javascript"
const SET_STREAM_SHOWING_LAYOUT_ID = "[stream] set showing layout id"
const SET_STREAM_HTML_TEMPLATE = "[stream] set html template"
const SET_STREAM_CSS_TEMPLATE = "[stream] set css template"
const SET_STREAM_DATA = "[stream] set data"
const SET_STREAM_STARED = "[stream] set stared"
const SET_STREAM_NAME = "[stream] set name"
const SET_STREAM_AUTHOR = "[stream] set author"
const ADD_STREAM_LAYOUT = "[stream] add layout"
const ADD_STREAM_USER_IMAGE = "[stream] add user image"
const ADD_STREAM_USER_PARAMETER = "[stream] add user parameter"
const REMOVE_STREAM_LAYOUT = "[stream] remove layout"
const RESTORE_STREAM_LAYOUT = "[stream] restore layout"
const REMOVE_STREAM_USER = "[stream] remove user"
const EMPTY_TRASH_LAYOUTS = "[stream] empty trash layouts"
const SET_STREAM_USER_PARTIAL = "[stream] set user partial"
const CLONE_STREAM_LAYOUT = "[stream] clone layout"
const IMPORT_STREAM_LAYOUT_FROM_FILE = "[stream] import layout from file"
const CLEAR_STREAM_LAYOUT_ALIAS = "[stream] clear layout alias"
const SET_STREAM_USED_LAYOUTS = "[stream] set used layouts"

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

const _getUnique = (used: string[], base: string, noNumberName?: string): string => {
    let n = 1;
    let name = noNumberName ?? '';
    while (!name || used.includes(name)) {
        name = `${base}${n++}`;
    }
    return name;
}

const _getUniqueLayoutId = (layouts: StreamRenderLayoutSet, trashLayouts: StreamRenderLayoutSet, name: string): string => {
    const baseId = (name.startsWith('entropiaflow.') ? `user.${name}` : name).replace(' ', '_');
    return _getUnique(Object.keys(layouts).concat(Object.keys(trashLayouts)), `${baseId}_`, baseId);
}

const _getUniqueLayoutName = (layouts: StreamRenderLayoutSet, base: string, noNumberName?: string): string =>
    _getUnique(Object.values(layouts).map(l => l.name), base, noNumberName);

const cloneStreamLayout = (navigate: NavigateFunction, layoutId: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const layouts = getStreamIn(getState()).layouts;
    const trashLayouts = getStreamIn(getState()).trashLayouts;
    const baseName = `${layouts[layoutId].name} copy`;
    const newName = _getUniqueLayoutName(layouts, `${baseName} `, baseName);
    const newLayoutId = _getUniqueLayoutId(layouts, trashLayouts, newName);
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

const setStreamFormulaJavaScript = (layoutId: string) => (code: string) => ({
    type: SET_STREAM_FORMULA_JAVASCRIPT,
    payload: { layoutId, code }
})

const setStreamShowingLayoutId = (layoutId: string) => ({
    type: SET_STREAM_SHOWING_LAYOUT_ID,
    payload: { layoutId }
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
    const newLayoutId = _getUniqueLayoutId(getStreamIn(getState()).layouts, getStreamIn(getState()).trashLayouts, name);
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
    const trashLayouts = getStreamIn(getState()).trashLayouts;
    const name = _getUniqueLayoutName(layouts, 'Layout ');
    const layoutId = _getUniqueLayoutId(layouts, trashLayouts, name);
    dispatch({
        type: ADD_STREAM_LAYOUT,
        payload: { layoutId, name }
    })
    dispatch(navigateTo(navigate, streamEditorUrl(layoutId)))
}

const goToTrash = (navigate: NavigateFunction) => async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(navigateTo(navigate, streamTrashUrl()))
}

const importStreamLayoutFromFile = (layout: StreamExportLayout) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const layouts = getStreamIn(getState()).layouts;
    const trashLayouts = getStreamIn(getState()).trashLayouts;
    const layoutId = _getUniqueLayoutId(layouts, trashLayouts, layout.name);
    dispatch({
        type: IMPORT_STREAM_LAYOUT_FROM_FILE,
        payload: { layoutId, layout }
    })
}

const removeStreamLayout = (layoutId: string) => ({
    type: REMOVE_STREAM_LAYOUT,
    payload: { layoutId }
})

const restoreStreamLayout = (layoutId: string) => ({
    type: RESTORE_STREAM_LAYOUT,
    payload: { layoutId }
})

const addStreamUserImage = (layoutId: string) => ({
    type: ADD_STREAM_USER_IMAGE,
    payload: { layoutId }
})

const addStreamUserParameter = (layoutId: string) => ({
    type: ADD_STREAM_USER_PARAMETER,
    payload: { layoutId }
})

const removeStreamUser = (layoutId: string, id: number) => ({
    type: REMOVE_STREAM_USER,
    payload: { layoutId, id }
})

const emptyTrashLayouts = {
    type: EMPTY_TRASH_LAYOUTS
}

const setStreamUserPartial = (layoutId: string, id: number, partial: Partial<StreamBaseVariable<string>>) => ({
    type: SET_STREAM_USER_PARTIAL,
    payload: { layoutId, id, partial }
})

const clearStreamLayoutAlias = {
    type: CLEAR_STREAM_LAYOUT_ALIAS
}

const setStreamUsedLayouts = (layouts: string[]) => ({
    type: SET_STREAM_USED_LAYOUTS,
    payload: {
        layouts
    }
})

export {
    SET_STREAM_STATE,
    SET_STREAM_ENABLED,
    SET_STREAM_ADVANCED,
    SET_STREAM_BACKGROUND_SELECTED,
    SET_STREAM_VARIABLES,
    SET_STREAM_TEMPORAL_VARIABLES,
    SET_STREAM_FORMULA_JAVASCRIPT,
    SET_STREAM_SHOWING_LAYOUT_ID,
    SET_STREAM_HTML_TEMPLATE,
    SET_STREAM_CSS_TEMPLATE,
    SET_STREAM_DATA,
    SET_STREAM_STARED,
    SET_STREAM_NAME,
    SET_STREAM_AUTHOR,
    ADD_STREAM_LAYOUT,
    ADD_STREAM_USER_IMAGE,
    ADD_STREAM_USER_PARAMETER,
    REMOVE_STREAM_LAYOUT,
    RESTORE_STREAM_LAYOUT,
    REMOVE_STREAM_USER,
    EMPTY_TRASH_LAYOUTS,
    SET_STREAM_USER_PARTIAL,
    CLONE_STREAM_LAYOUT,
    IMPORT_STREAM_LAYOUT_FROM_FILE,
    CLEAR_STREAM_LAYOUT_ALIAS,
    SET_STREAM_USED_LAYOUTS,
    setStreamState,
    setStreamEnabled,
    setStreamAdvanced,
    setStreamBackgroundSelected,
    setStreamVariables,
    setStreamTemporalVariables,
    setStreamFormulaJavaScript,
    setStreamShowingLayoutId,
    setStreamHtmlTemplate,
    setStreamCssTemplate,
    setStreamData,
    setStreamStared,
    setStreamName,
    setStreamAuthor,
    addStreamLayout,
    addStreamUserImage,
    addStreamUserParameter,
    removeStreamLayout,
    restoreStreamLayout,
    removeStreamUser,
    emptyTrashLayouts,
    setStreamUserPartial,
    cloneStreamLayout,
    importStreamLayoutFromFile,
    goToTrash,
    clearStreamLayoutAlias,
    setStreamUsedLayouts,
}
