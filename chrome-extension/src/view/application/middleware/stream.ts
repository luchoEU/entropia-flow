import { mergeDeep } from "../../../common/merge"
import { StreamSavedLayoutSet } from "../../../stream/data"
import { setStreamState, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED, SET_STREAM_VARIABLES, SET_STREAM_NAME, ADD_STREAM_LAYOUT, REMOVE_STREAM_LAYOUT, SET_STREAM_HTML_TEMPLATE, SET_STREAM_CSS_TEMPLATE, SET_STREAM_STARED, ADD_STREAM_USER_IMAGE, REMOVE_STREAM_USER, SET_STREAM_USER_PARTIAL, SET_STREAM_ADVANCED, SET_STREAM_AUTHOR, CLONE_STREAM_LAYOUT, IMPORT_STREAM_LAYOUT_FROM_FILE, RESTORE_STREAM_LAYOUT, EMPTY_TRASH_LAYOUTS, SET_STREAM_FORMULA_JAVASCRIPT, SET_STREAM_SHOWING_LAYOUT_ID, ADD_STREAM_USER_PARAMETER, SET_STREAM_DATA } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { AppAction } from "../slice/app"
import { initialStateIn } from "../helpers/stream"
import { getStream, getStreamIn, getStreamLayouts, getStreamTrashLayouts } from "../selectors/stream"
import { StreamState, StreamStateIn } from "../state/stream"
import isEqual from 'lodash.isequal';
import { setTabularDefinitions } from "../helpers/tabular"
import { streamTabularDataFromLayouts, streamTabularDataFromVariables, streamTabularDefinitions } from "../tabular/stream"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const beforeState: StreamState = getStream(getState())
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            setTabularDefinitions(streamTabularDefinitions)
            const state: StreamStateIn = await api.storage.loadStream()
            if (state)
                dispatch(setStreamState(mergeDeep(initialStateIn, state)))
            break
        }
        case SET_STREAM_ENABLED:
        case SET_STREAM_ADVANCED:
        case SET_STREAM_BACKGROUND_SELECTED:
        case SET_STREAM_FORMULA_JAVASCRIPT:
        case SET_STREAM_HTML_TEMPLATE:
        case SET_STREAM_CSS_TEMPLATE:
        case SET_STREAM_NAME:
        case SET_STREAM_AUTHOR:
        case SET_STREAM_STARED:
        case ADD_STREAM_LAYOUT:
        case IMPORT_STREAM_LAYOUT_FROM_FILE:
        case ADD_STREAM_USER_IMAGE:
        case ADD_STREAM_USER_PARAMETER:
        case REMOVE_STREAM_LAYOUT:
        case RESTORE_STREAM_LAYOUT:
        case EMPTY_TRASH_LAYOUTS:
        case REMOVE_STREAM_USER:
        case SET_STREAM_USER_PARTIAL:
        case CLONE_STREAM_LAYOUT: {
            const state: StreamStateIn = getStreamIn(getState())
            await api.storage.saveStream(state)
            break
        }
    }

    switch (action.type) {
        case SET_STREAM_ADVANCED:
        case SET_STREAM_SHOWING_LAYOUT_ID:
        case SET_STREAM_VARIABLES: {
            const { variables: beforeVariables }: StreamState = beforeState
            const { variables, ui: { showingLayoutId }, in: { advanced, layouts } }: StreamState = getStream(getState())
            if (action.type === SET_STREAM_VARIABLES && isEqual(beforeVariables, variables))
                break

            const layoutId = showingLayoutId ?? ''
            const layout = layouts[layoutId]
            const readonly = !!layout?.readonly || !advanced
            dispatch(setTabularData(streamTabularDataFromVariables(variables, { layoutId, readonly })))
            break
        }
    }

    switch (action.type) {
        case AppAction.INITIALIZE:
        case SET_STREAM_BACKGROUND_SELECTED:
        case SET_STREAM_FORMULA_JAVASCRIPT:
        case SET_STREAM_HTML_TEMPLATE:
        case SET_STREAM_CSS_TEMPLATE:
        case SET_STREAM_STARED:
        case SET_STREAM_NAME:
        case ADD_STREAM_LAYOUT:
        case IMPORT_STREAM_LAYOUT_FROM_FILE:
        case REMOVE_STREAM_LAYOUT:
        case CLONE_STREAM_LAYOUT:
        case EMPTY_TRASH_LAYOUTS:
        case RESTORE_STREAM_LAYOUT:
        {
            const layouts: StreamSavedLayoutSet = getStreamLayouts(getState())
            const trashLayouts: StreamSavedLayoutSet = getStreamTrashLayouts(getState())
            dispatch(setTabularData(streamTabularDataFromLayouts(layouts, trashLayouts)));
            break;
        }
    }
}

export default [
    requests
]
