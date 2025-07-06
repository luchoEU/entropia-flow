import { ADD_STREAM_LAYOUT, ADD_STREAM_USER_VARIABLE, CLEAR_STREAM_LAYOUT_ALIAS, CLONE_STREAM_LAYOUT, IMPORT_STREAM_LAYOUT_FROM_FILE, REMOVE_STREAM_LAYOUT, REMOVE_STREAM_USER_VARIABLE, SET_STREAM_ADVANCED, SET_STREAM_AUTHOR, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_CSS_TEMPLATE, SET_STREAM_DATA, SET_STREAM_ENABLED, SET_STREAM_HTML_TEMPLATE, SET_STREAM_NAME, SET_STREAM_STARED, SET_STREAM_STATE, SET_STREAM_TEMPORAL_VARIABLES, SET_STREAM_USER_VARIABLE_PARTIAL, SET_STREAM_VARIABLES } from "../actions/stream"
import { initialState, reduceAddStreamLayout, reduceAddStreamUserVariable, reduceClearStreamLayoutAlias, reduceCloneStreamLayout, reduceImportStreamLayoutFromFile, reduceRemoveStreamLayout, reduceRemoveStreamUserVariable, reduceSetStreamAdvanced, reduceSetStreamAuthor, reduceSetStreamBackgroundSelected, reduceSetStreamCssTemplate, reduceSetStreamData, reduceSetStreamEnabled, reduceSetStreamHtmlTemplate, reduceSetStreamName, reduceSetStreamStared, reduceSetStreamState, reduceSetStreamTemporalVariables, reduceSetStreamUserVariablePartial, reduceSetStreamVariables } from "../helpers/stream"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STREAM_STATE: return reduceSetStreamState(state, action.payload.state)
        case SET_STREAM_ENABLED: return reduceSetStreamEnabled(state, action.payload.enabled)
        case SET_STREAM_ADVANCED: return reduceSetStreamAdvanced(state, action.payload.advanced)
        case SET_STREAM_BACKGROUND_SELECTED: return reduceSetStreamBackgroundSelected(state, action.payload.layoutId, action.payload.backgroundType)
        case SET_STREAM_VARIABLES: return reduceSetStreamVariables(state, action.payload.source, action.payload.variables)
        case SET_STREAM_TEMPORAL_VARIABLES: return reduceSetStreamTemporalVariables(state, action.payload.source, action.payload.variables)
        case SET_STREAM_HTML_TEMPLATE: return reduceSetStreamHtmlTemplate(state, action.payload.layoutId, action.payload.template)
        case SET_STREAM_CSS_TEMPLATE: return reduceSetStreamCssTemplate(state, action.payload.layoutId, action.payload.template)
        case SET_STREAM_DATA: return reduceSetStreamData(state, action.payload.data)
        case SET_STREAM_STARED: return reduceSetStreamStared(state, action.payload.layoutId, action.payload.stared)
        case SET_STREAM_NAME: return reduceSetStreamName(state, action.payload.layoutId, action.payload.newLayoutId, action.payload.name)
        case SET_STREAM_AUTHOR: return reduceSetStreamAuthor(state, action.payload.layoutId, action.payload.author)
        case ADD_STREAM_LAYOUT: return reduceAddStreamLayout(state, action.payload.layoutId, action.payload.name)
        case IMPORT_STREAM_LAYOUT_FROM_FILE: return reduceImportStreamLayoutFromFile(state, action.payload.layoutId, action.payload.layout)
        case ADD_STREAM_USER_VARIABLE: return reduceAddStreamUserVariable(state, action.payload.isImage)
        case REMOVE_STREAM_LAYOUT: return reduceRemoveStreamLayout(state, action.payload.layoutId)
        case REMOVE_STREAM_USER_VARIABLE: return reduceRemoveStreamUserVariable(state, action.payload.id)
        case SET_STREAM_USER_VARIABLE_PARTIAL: return reduceSetStreamUserVariablePartial(state, action.payload.id, action.payload.partial)
        case CLONE_STREAM_LAYOUT: return reduceCloneStreamLayout(state, action.payload.layoutId, action.payload.newLayoutId, action.payload.newName)
        case CLEAR_STREAM_LAYOUT_ALIAS: return reduceClearStreamLayoutAlias(state)
        default: return state
    }
}
