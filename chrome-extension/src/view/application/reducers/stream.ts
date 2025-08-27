import { ADD_STREAM_LAYOUT, CLEAR_STREAM_LAYOUT_ALIAS, CLONE_STREAM_LAYOUT, EMPTY_TRASH_LAYOUTS, IMPORT_STREAM_LAYOUT_FROM_FILE, REMOVE_STREAM_LAYOUT, RESTORE_STREAM_LAYOUT, SET_STREAM_ADVANCED, SET_STREAM_AUTHOR, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_CSS_TEMPLATE, SET_STREAM_ENABLED, SET_STREAM_FORMULA_JAVASCRIPT, SET_STREAM_HTML_TEMPLATE, SET_STREAM_NAME, SET_STREAM_STARED, SET_STREAM_STATE, SET_STREAM_USER_PARTIAL, SET_STREAM_VARIABLES, ADD_STREAM_USER_IMAGE, REMOVE_STREAM_USER, SET_STREAM_SHOWING_LAYOUT_ID, ADD_STREAM_USER_PARAMETER, SET_STREAM_DATA } from "../actions/stream"
import { initialState, reduceAddStreamLayout, reduceAddStreamUserImage, reduceAddStreamUserParameter, reduceClearStreamLayoutAlias, reduceCloneStreamLayout, reduceEmptyTrashLayouts, reduceImportStreamLayoutFromFile, reduceRemoveStreamLayout, reduceRemoveStreamUser, reduceRestoreStreamLayout, reduceSetStreamAdvanced, reduceSetStreamAuthor, reduceSetStreamBackgroundSelected, reduceSetStreamCssTemplate, reduceSetStreamData, reduceSetStreamEnabled, reduceSetStreamFormulaJavaScript, reduceSetStreamHtmlTemplate, reduceSetStreamName, reduceSetStreamShowingLayoutId, reduceSetStreamStared, reduceSetStreamState, reduceSetStreamUserPartial, reduceSetStreamVariables } from "../helpers/stream"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STREAM_STATE: return reduceSetStreamState(state, action.payload.state)
        case SET_STREAM_ENABLED: return reduceSetStreamEnabled(state, action.payload.enabled)
        case SET_STREAM_ADVANCED: return reduceSetStreamAdvanced(state, action.payload.advanced)
        case SET_STREAM_BACKGROUND_SELECTED: return reduceSetStreamBackgroundSelected(state, action.payload.layoutId, action.payload.backgroundType)
        case SET_STREAM_VARIABLES: return reduceSetStreamVariables(state, action.payload.variables)
        case SET_STREAM_FORMULA_JAVASCRIPT: return reduceSetStreamFormulaJavaScript(state, action.payload.layoutId, action.payload.code)
        case SET_STREAM_SHOWING_LAYOUT_ID: return reduceSetStreamShowingLayoutId(state, action.payload.layoutId)
        case SET_STREAM_HTML_TEMPLATE: return reduceSetStreamHtmlTemplate(state, action.payload.layoutId, action.payload.template)
        case SET_STREAM_CSS_TEMPLATE: return reduceSetStreamCssTemplate(state, action.payload.layoutId, action.payload.template)
        case SET_STREAM_DATA: return reduceSetStreamData(state, action.payload.data)
        case SET_STREAM_STARED: return reduceSetStreamStared(state, action.payload.layoutId, action.payload.stared)
        case SET_STREAM_NAME: return reduceSetStreamName(state, action.payload.layoutId, action.payload.newLayoutId, action.payload.name)
        case SET_STREAM_AUTHOR: return reduceSetStreamAuthor(state, action.payload.layoutId, action.payload.author)
        case ADD_STREAM_LAYOUT: return reduceAddStreamLayout(state, action.payload.layoutId, action.payload.name)
        case IMPORT_STREAM_LAYOUT_FROM_FILE: return reduceImportStreamLayoutFromFile(state, action.payload.layoutId, action.payload.layout)
        case ADD_STREAM_USER_IMAGE: return reduceAddStreamUserImage(state, action.payload.layoutId)
        case ADD_STREAM_USER_PARAMETER: return reduceAddStreamUserParameter(state, action.payload.layoutId)
        case REMOVE_STREAM_LAYOUT: return reduceRemoveStreamLayout(state, action.payload.layoutId)
        case RESTORE_STREAM_LAYOUT: return reduceRestoreStreamLayout(state, action.payload.layoutId)
        case EMPTY_TRASH_LAYOUTS: return reduceEmptyTrashLayouts(state)
        case REMOVE_STREAM_USER: return reduceRemoveStreamUser(state, action.payload.layoutId, action.payload.id)
        case SET_STREAM_USER_PARTIAL: return reduceSetStreamUserPartial(state, action.payload.layoutId, action.payload.id, action.payload.partial)
        case CLONE_STREAM_LAYOUT: return reduceCloneStreamLayout(state, action.payload.layoutId, action.payload.newLayoutId, action.payload.newName)
        case CLEAR_STREAM_LAYOUT_ALIAS: return reduceClearStreamLayoutAlias(state)
        default: return state
    }
}
