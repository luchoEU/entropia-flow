import { ADD_STREAM_LAYOUT, ADD_STREAM_USER_VARIABLE, REMOVE_STREAM_LAYOUT, REMOVE_STREAM_USER_VARIABLE, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_CSS_TEMPLATE, SET_STREAM_DATA, SET_STREAM_EDITING, SET_STREAM_ENABLED, SET_STREAM_HTML_TEMPLATE, SET_STREAM_NAME, SET_STREAM_STARED, SET_STREAM_STATE, SET_STREAM_USER_VARIABLE_PARTIAL, SET_STREAM_VARIABLES } from "../actions/stream"
import { initialState, reduceAddStreamLayout, reduceAddStreamUserVariable, reduceRemoveStreamLayout, reduceRemoveStreamUserVariable, reduceSetStreamBackgroundSelected, reduceSetStreamCssTemplate, reduceSetStreamData, reduceSetStreamEditing, reduceSetStreamEnabled, reduceSetStreamHtmlTemplate, reduceSetStreamName, reduceSetStreamStared, reduceSetStreamState, reduceSetStreamUserVariablePartial, reduceSetStreamVariables } from "../helpers/stream"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STREAM_STATE: return reduceSetStreamState(state, action.payload.state)
        case SET_STREAM_ENABLED: return reduceSetStreamEnabled(state, action.payload.enabled)
        case SET_STREAM_BACKGROUND_SELECTED: return reduceSetStreamBackgroundSelected(state, action.payload.selected)
        case SET_STREAM_VARIABLES: return reduceSetStreamVariables(state, action.payload.source, action.payload.variables)
        case SET_STREAM_HTML_TEMPLATE: return reduceSetStreamHtmlTemplate(state, action.payload.template)
        case SET_STREAM_CSS_TEMPLATE: return reduceSetStreamCssTemplate(state, action.payload.template)
        case SET_STREAM_DATA: return reduceSetStreamData(state, action.payload.data)
        case SET_STREAM_EDITING: return reduceSetStreamEditing(state, action.payload.layoutId)
        case SET_STREAM_STARED: return reduceSetStreamStared(state, action.payload.layoutId, action.payload.stared)
        case SET_STREAM_NAME: return reduceSetStreamName(state, action.payload.name)
        case ADD_STREAM_LAYOUT: return reduceAddStreamLayout(state)
        case REMOVE_STREAM_LAYOUT: return reduceRemoveStreamLayout(state, action.payload.layoutId)
        case ADD_STREAM_USER_VARIABLE: return reduceAddStreamUserVariable(state)
        case REMOVE_STREAM_USER_VARIABLE: return reduceRemoveStreamUserVariable(state, action.payload.id)
        case SET_STREAM_USER_VARIABLE_PARTIAL: return reduceSetStreamUserVariablePartial(state, action.payload.id, action.payload.partial)
        default: return state
    }
}
