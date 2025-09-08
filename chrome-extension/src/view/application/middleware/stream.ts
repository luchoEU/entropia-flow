import { mergeDeep } from "../../../common/merge"
import { getBackgroundSpec, getLogoUrl } from "../../../stream/background"
import { StreamSavedLayoutSet } from "../../../stream/data"
import { ADD_PEDS, APPLY_MARKUP_TO_LAST, EXCLUDE, EXCLUDE_WARNINGS, INCLUDE, ON_LAST, REMOVE_PEDS } from "../actions/last"
import { SET_STATUS } from "../actions/status"
import { setStreamState, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED, SET_STREAM_VARIABLES, setStreamVariables, SET_STREAM_NAME, ADD_STREAM_LAYOUT, REMOVE_STREAM_LAYOUT, SET_STREAM_HTML_TEMPLATE, SET_STREAM_CSS_TEMPLATE, SET_STREAM_STARED, ADD_STREAM_USER_IMAGE, REMOVE_STREAM_USER, SET_STREAM_USER_PARTIAL, SET_STREAM_TEMPORAL_VARIABLES, SET_STREAM_ADVANCED, SET_STREAM_AUTHOR, CLONE_STREAM_LAYOUT, IMPORT_STREAM_LAYOUT_FROM_FILE, RESTORE_STREAM_LAYOUT, EMPTY_TRASH_LAYOUTS, SET_STREAM_FORMULA_JAVASCRIPT, SET_STREAM_SHOWING_LAYOUT_ID, ADD_STREAM_USER_PARAMETER, setStreamData, SET_STREAM_DATA } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { AppAction } from "../slice/app"
import { initialStateIn } from "../helpers/stream"
import { getLast } from "../selectors/last"
import { getStatus } from "../selectors/status"
import { getStream, getStreamIn, getStreamLayouts, getStreamOut, getStreamTrashLayouts, getStreamUsedLayouts } from "../selectors/stream"
import { StreamState, StreamStateIn, StreamStateOut } from "../state/stream"
import isEqual from 'lodash.isequal';
import { setTabularDefinitions } from "../helpers/tabular"
import { streamTabularDataFromLayouts, streamTabularDataFromVariables, streamTabularDefinitions } from "../tabular/stream"
import { SET_CURRENT_INVENTORY } from "../actions/inventory"
import { Inventory } from "../../../common/state"
import { StreamDataBuilder } from "../../../background/client/streamDataBuilder"
import { sendWebSocketMessage } from "../actions/messages"
import { Dispatch } from "react"
import { _getLastVariables } from "../../../background/inventory/lastDeltaBuilder"

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
        case SET_STREAM_VARIABLES:
        case SET_STREAM_TEMPORAL_VARIABLES: {
            const { variables: beforeVariables }: StreamState = beforeState
            const { variables, temporalVariables, ui: { showingLayoutId }, in: { advanced, layouts } }: StreamState = getStream(getState())
            if (action.type === SET_STREAM_VARIABLES && isEqual(beforeVariables, variables))
                break

            const layoutId = showingLayoutId ?? ''
            const layout = layouts[layoutId]
            const readonly = !!layout?.readonly || !advanced
            dispatch(setTabularData(streamTabularDataFromVariables(variables, temporalVariables, { layoutId, readonly })))
            break
        }
    }

    switch (action.type) {
        case AppAction.INITIALIZE:
        case ON_LAST:
        case ADD_PEDS:
        case REMOVE_PEDS:
        case INCLUDE:
        case EXCLUDE:
        case EXCLUDE_WARNINGS:
        case APPLY_MARKUP_TO_LAST:
        {
            const { c: { delta, diff, deltaNoMarkup, deltaWithMarkup } } = getLast(getState())
            dispatch(setStreamVariables('last', _getLastVariables(delta, deltaNoMarkup, deltaWithMarkup, diff)))
            break
        }
        case SET_CURRENT_INVENTORY:
        {
            const inventory: Inventory = action.payload.inventory
            dispatch(setStreamVariables('inventory', _getInventoryVariables(inventory)))
            break
        }
    }
    switch (action.type) {
        case AppAction.INITIALIZE:
        case SET_STATUS:
        {
            const { message } = getStatus(getState())
            dispatch(setStreamVariables('status', [
                { name: 'message', value: message ?? '', description: 'status message' }]
            ))
            break
        }
    }

    switch (action.type) {
        case AppAction.INITIALIZE:
        case SET_STREAM_BACKGROUND_SELECTED:
        {
            const { layouts } = getStreamIn(getState())
            const t = layouts[action.payload?.layoutId]?.backgroundType
            dispatch(setStreamVariables('background', [
                { name: 'backDark', value: t ? getBackgroundSpec(t)?.dark ?? false : false, description: 'background is dark' },
                { name: 'logoUrl', value: '=IF(backDark, img.logoWhite, img.logoBlack)', description: 'logo url' },
                { name: 'logoWhite', value: getLogoUrl(true), isImage: true },
                { name: 'logoBlack', value: getLogoUrl(false), isImage: true }
            ]))
            break
        }
    }

    switch (action.type) {
        case AppAction.INITIALIZE:
        case SET_STREAM_SHOWING_LAYOUT_ID:
        case ADD_STREAM_USER_IMAGE:
        case REMOVE_STREAM_USER:
        case ADD_STREAM_USER_PARAMETER:
        case SET_STREAM_USER_PARTIAL: {
            const { in: { layouts }, ui: { showingLayoutId } } = getStream(getState());
            if (!showingLayoutId) {
                dispatch(setStreamVariables('layout', []));
                break;
            }

            const images = layouts[showingLayoutId]?.images?.map(v => ({
                name: v.name,
                value: v.value,
                description: v.description,
                id: v.id,
                isImage: true
            })) ?? []

            const parameters = layouts[showingLayoutId]?.parameters?.map(v => ({
                name: v.name,
                value: v.value,
                description: v.description,
                id: v.id,
                isParameter: true
            })) ?? []

            dispatch(setStreamVariables('layout', [...images, ...parameters]));
            break;
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

    switch (action.type) {
        case SET_STREAM_SHOWING_LAYOUT_ID:
        case SET_STREAM_FORMULA_JAVASCRIPT:
        case SET_STREAM_HTML_TEMPLATE:
        case SET_STREAM_CSS_TEMPLATE:
        case SET_STREAM_VARIABLES:
        {
            /* LAYOUT_CALC_DELETE */
            if (action.type === SET_STREAM_VARIABLES && action.payload.source === 'formula') // avoid infinite loop
                break;

            const { in: { layouts }, ui: { showingLayoutId }, variables, temporalVariables } = getStream(getState());
            const { renderData, formulaVariables } = await getDataBuilder(dispatch).calculateData(layouts, showingLayoutId, variables, temporalVariables);

            if (formulaVariables) {
                dispatch(setStreamVariables('formula', formulaVariables));
            }
    
            dispatch(setStreamData(renderData));
            break;
        }
        case SET_STREAM_DATA: {
            /* LAYOUT_CALC_DELETE */
            const out: StreamStateOut = getStreamOut(getState())
            if (!out.data)
                break

            const usedLayouts: string[] = getStreamUsedLayouts(getState());
            getDataBuilder(dispatch).sendDataToClient(out.data, out.computed, usedLayouts)
            break
        }
    }
}

let _dataBuilder: StreamDataBuilder | undefined;
function getDataBuilder(dispatch: any) {
    if (!_dataBuilder) {
        _dataBuilder = new StreamDataBuilder()
        _dataBuilder.sendClientData = (delta) => dispatch(sendWebSocketMessage('stream', delta))
    }
    return _dataBuilder
}

export default [
    requests
]
