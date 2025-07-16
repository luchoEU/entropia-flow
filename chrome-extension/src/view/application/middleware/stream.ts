import { WebSocketStateCode } from "../../../background/client/webSocketInterface"
import { mergeDeep } from "../../../common/merge"
import { getBackgroundSpec, getLogoUrl } from "../../../stream/background"
import StreamRenderData, { StreamRenderLayoutSet, StreamSavedLayoutSet } from "../../../stream/data"
import { applyDelta, getDelta } from "../../../stream/delta"
import { WEB_SOCKET_STATE_CHANGED } from "../actions/connection"
import { ADD_PEDS, APPLY_MARKUP_TO_LAST, EXCLUDE, EXCLUDE_WARNINGS, INCLUDE, ON_LAST, REMOVE_PEDS } from "../actions/last"
import { sendWebSocketMessage } from "../actions/messages"
import { SET_STATUS } from "../actions/status"
import { setStreamState, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED, SET_STREAM_DATA, setStreamData, SET_STREAM_VARIABLES, setStreamVariables, SET_STREAM_NAME, ADD_STREAM_LAYOUT, REMOVE_STREAM_LAYOUT, SET_STREAM_HTML_TEMPLATE, SET_STREAM_CSS_TEMPLATE, SET_STREAM_STARED, ADD_STREAM_USER_IMAGE, REMOVE_STREAM_USER_IMAGE, SET_STREAM_USER_IMAGE_PARTIAL, SET_STREAM_TEMPORAL_VARIABLES, SET_STREAM_ADVANCED, SET_STREAM_AUTHOR, CLONE_STREAM_LAYOUT, IMPORT_STREAM_LAYOUT_FROM_FILE, RESTORE_STREAM_LAYOUT, EMPTY_TRASH_LAYOUTS, SET_STREAM_FORMULA_JAVASCRIPT, SET_STREAM_SHOWING_LAYOUT_ID } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { AppAction } from "../slice/app"
import { initialStateIn, savedToRenderLayout } from "../helpers/stream"
import { getLast } from "../selectors/last"
import { getStatus } from "../selectors/status"
import { getStream, getStreamIn, getStreamLayouts, getStreamOut, getStreamTrashLayouts } from "../selectors/stream"
import { StreamState, StreamStateIn, StreamStateOut, StreamStateVariable } from "../state/stream"
import isEqual from 'lodash.isequal';
import { setTabularDefinitions } from "../helpers/tabular"
import { streamTabularDataFromLayouts, streamTabularDataFromVariables, streamTabularDefinitions } from "../tabular/stream"
import { computeFormulas } from "../../../stream/formulaCompute"
import { SET_CURRENT_INVENTORY } from "../actions/inventory"
import { Inventory } from "../../../common/state"
import Interpreter from 'js-interpreter';
import * as Babel from '@babel/standalone';
import { interpreterLoadContext } from "../../../stream/formulaParser"

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
        case REMOVE_STREAM_LAYOUT:
        case RESTORE_STREAM_LAYOUT:
        case EMPTY_TRASH_LAYOUTS:
        case REMOVE_STREAM_USER_IMAGE:
        case SET_STREAM_USER_IMAGE_PARTIAL:
        case CLONE_STREAM_LAYOUT: {
            const state: StreamStateIn = getStreamIn(getState())
            await api.storage.saveStream(state)
            break
        }
        case SET_STREAM_SHOWING_LAYOUT_ID:
        case SET_STREAM_VARIABLES:
        case SET_STREAM_TEMPORAL_VARIABLES: {
            const { variables: beforeVariables }: StreamState = beforeState
            const { variables, temporalVariables, ui: { showingLayoutId } }: StreamState = getStream(getState())
            if (isEqual(beforeVariables, variables))
                break

            dispatch(setTabularData(streamTabularDataFromVariables(showingLayoutId ?? '', variables, temporalVariables)))
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
            const { c: { delta, diff } } = getLast(getState())
            dispatch(setStreamVariables('last', [
                { name: 'delta', value: (delta || 0).toFixed(2) },
                { name: 'deltaBackColor', value: "=IF(delta > 0, 'green', delta < 0, 'red', 'black')", description: 'delta background color' },
                { name: 'deltaWord', value: "=IF(delta > 0, 'Profit', delta < 0, 'Loss')", description: 'delta word' },
                { name: 'deltaItems', value: diff?.filter(d => !d.e).map(d => ({ name: d.n, quantity: Number(d.q), value: Number(d.v), container: d.c })) ?? [], description: 'delta items' }
            ]))
            break
        }
        case SET_CURRENT_INVENTORY:
        {
            const inventory: Inventory = action.payload.inventory
            dispatch(setStreamVariables('inventory', [
                { name: 'inventoryTime', value: inventory.meta.date, description: 'time of the last inventory update' },
                { name: 'items', value: inventory.itemlist?.map(i => ({ name: i.n, quantity: Number(i.q), value: Number(i.v), container: i.c })) ?? [], description: 'items' }
            ]))
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
        case REMOVE_STREAM_USER_IMAGE:
        case SET_STREAM_USER_IMAGE_PARTIAL: {
            const { in: { layouts }, ui: { showingLayoutId } } = getStream(getState());
            const vars = showingLayoutId ? layouts[showingLayoutId]?.images?.map(v => ({
                name: v.name,
                value: v.value,
                description: v.description,
                id: v.id,
                isImage: true
            })) : undefined
            dispatch(setStreamVariables('user', vars ?? []));
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
            const { in: { layouts }, ui: { showingLayoutId }, variables, temporalVariables } = getStream(getState());
            const vars = Object.values(variables).flat();
            const data = Object.fromEntries(vars.filter(v => !v.isImage).map(v => [v.name, v.value]));
            data.img = Object.fromEntries(vars.filter(v => v.isImage).map(v => [v.name, v.value]));
            const tObj = Object.fromEntries(Object.values(temporalVariables).flat().map(v => [v.name, v.value]))
            const layoutsToRender: StreamRenderLayoutSet = Object.fromEntries(Object.entries(layouts).map(([k, v]) => [k, savedToRenderLayout(v)]));
            const renderData: StreamRenderData = { data: computeFormulas(data, tObj), layouts: layoutsToRender };

            if (action.type !== SET_STREAM_VARIABLES || action.payload.source !== 'formula') {
                const baseContext = renderData.data ?? {};
                const oldVars = variables['formula']?.map(v => v.name) ?? [];
                const userVars = variables['user']?.map(v => v.name) ?? [];
                const context = Object.fromEntries(Object.entries(baseContext).filter(([k, v]) => !oldVars.includes(k) && !userVars.includes(k)));
                const jsCode = showingLayoutId ? layouts[showingLayoutId]?.formulaJavaScript : undefined
                let definedVars: StreamStateVariable[] = [];
                if (jsCode && jsCode.trim() !== '') {
                    try {
                        const es5Code = Babel.transform(jsCode, { presets: ['env'] }).code; // Transpile the modern JS code to ES5 at parse time
                        const interpreter = new Interpreter(es5Code, interpreterLoadContext(context));
                        interpreter.run();
                        definedVars = Object.entries(interpreter.globalScope.object.properties)
                            .filter(([name, value]) => !name.startsWith('__') && name !== 'self' && name !== 'window' && value !== undefined && (value as any)?.class !== 'Function')
                            .map(([name, value]) => ({name, value: interpreter.pseudoToNative(value)}))
                            .filter(({name, value}) => JSON.stringify(context[name]) !== JSON.stringify(value));
                    } catch (e) {
                        definedVars = [{name: '!error', value: e.message, description: 'error in formula javascript'}];
                    }
                }
                dispatch(setStreamVariables('formula', definedVars));
            }

            dispatch(setStreamData(renderData));
            break;
        }
        case SET_STREAM_DATA: {
            const { data }: StreamStateOut = getStreamOut(getState())

            const delta = getDelta(_dataInClient, data)
            if (!delta)
                break

            _dataInClient = applyDelta(_dataInClient, delta)
            dispatch(sendWebSocketMessage('stream', delta))
            break
        }
        case WEB_SOCKET_STATE_CHANGED: {
            const code: WebSocketStateCode = action.payload.code
            if (code === WebSocketStateCode.connected) {
                // it is a new client, send all current data
                const { data }: StreamStateOut = getStreamOut(getState())
                dispatch(sendWebSocketMessage('stream', data))
                _dataInClient = data
            }
            break
        }
    }
}

let _dataInClient: StreamRenderData | undefined = undefined

export default [
    requests
]
