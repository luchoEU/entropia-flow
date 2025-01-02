import { SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_CONTAINER_STYLE, SET_STREAM_DATA, SET_STREAM_EDITING, SET_STREAM_ENABLED, SET_STREAM_NAME, SET_STREAM_STATE, SET_STREAM_TEMPLATE, SET_STREAM_VARIABLES } from "../actions/stream"
import { initialState, reduceSetStreamBackgroundSelected, reduceSetStreamContainerStyle, reduceSetStreamData, reduceSetStreamEditing, reduceSetStreamEnabled, reduceSetStreamName, reduceSetStreamState, reduceSetStreamTemplate, reduceSetStreamVariables } from "../helpers/stream"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_STREAM_STATE: return reduceSetStreamState(state, action.payload.state)
        case SET_STREAM_ENABLED: return reduceSetStreamEnabled(state, action.payload.enabled)
        case SET_STREAM_BACKGROUND_SELECTED: return reduceSetStreamBackgroundSelected(state, action.payload.selected)
        case SET_STREAM_VARIABLES: return reduceSetStreamVariables(state, action.payload.source, action.payload.variables)
        case SET_STREAM_TEMPLATE: return reduceSetStreamTemplate(state, action.payload.template)
        case SET_STREAM_CONTAINER_STYLE: return reduceSetStreamContainerStyle(state, action.payload.style)
        case SET_STREAM_DATA: return reduceSetStreamData(state, action.payload.data)
        case SET_STREAM_EDITING: return reduceSetStreamEditing(state, action.payload.editing)
        case SET_STREAM_NAME: return reduceSetStreamName(state, action.payload.name)
        default: return state
    }
}
