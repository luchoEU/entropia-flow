import { WebSocketStateCode } from "../../../background/client/webSocketInterface"
import { mergeDeep } from "../../../common/merge"
import { getBackgroundSpec, getLogoUrl } from "../../../stream/background"
import { StreamRenderData, StreamRenderLayoutSet, StreamRenderObject, StreamSavedLayout, StreamSavedLayoutSet } from "../../../stream/data"
import { applyDelta, getDelta } from "../../../stream/delta"
import { WEB_SOCKET_STATE_CHANGED } from "../actions/connection"
import { ADD_PEDS, APPLY_MARKUP_TO_LAST, EXCLUDE, EXCLUDE_WARNINGS, INCLUDE, ON_LAST, REMOVE_PEDS } from "../actions/last"
import { sendWebSocketMessage } from "../actions/messages"
import { SET_STATUS } from "../actions/status"
import { setStreamState, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED, SET_STREAM_DATA, setStreamData, SET_STREAM_VARIABLES, setStreamVariables, SET_STREAM_NAME, ADD_STREAM_LAYOUT, REMOVE_STREAM_LAYOUT, SET_STREAM_HTML_TEMPLATE, SET_STREAM_CSS_TEMPLATE, SET_STREAM_STARED, ADD_STREAM_USER_IMAGE, REMOVE_STREAM_USER, SET_STREAM_USER_PARTIAL, SET_STREAM_TEMPORAL_VARIABLES, SET_STREAM_ADVANCED, SET_STREAM_AUTHOR, CLONE_STREAM_LAYOUT, IMPORT_STREAM_LAYOUT_FROM_FILE, RESTORE_STREAM_LAYOUT, EMPTY_TRASH_LAYOUTS, SET_STREAM_FORMULA_JAVASCRIPT, SET_STREAM_SHOWING_LAYOUT_ID, ADD_STREAM_USER_PARAMETER } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { AppAction } from "../slice/app"
import { initialStateIn } from "../helpers/stream"
import { getLast } from "../selectors/last"
import { getStatus } from "../selectors/status"
import { getStream, getStreamIn, getStreamLayouts, getStreamOut, getStreamTrashLayouts, getStreamUsedLayouts } from "../selectors/stream"
import { StreamState, StreamStateIn, StreamStateOut, StreamStateVariable } from "../state/stream"
import isEqual from 'lodash.isequal';
import { setTabularDefinitions } from "../helpers/tabular"
import { streamTabularDataFromLayouts, streamTabularDataFromVariables, streamTabularDefinitions } from "../tabular/stream"
import { computeFormulas } from "../../../stream/formulaCompute"
import { SET_CURRENT_INVENTORY } from "../actions/inventory"
import { Inventory } from "../../../common/state"
import Interpreter from 'js-interpreter';
import * as Babel from '@babel/standalone';
import { interpreterLoadContext, parseFormula } from "../../../stream/formulaParser"
import { savedToRenderLayout } from "../../../stream/data.convert"

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
            if (action.type === SET_STREAM_VARIABLES && action.payload.source === 'formula') // avoid infinite loop
                break;

            const { in: { layouts }, ui: { showingLayoutId }, variables, temporalVariables } = getStream(getState());
            const vars = Object.values(variables).flat();
            const data = Object.fromEntries(vars.filter(v => !v.isImage).map(v => [v.name, v.value]));
            data.img = Object.fromEntries(vars.filter(v => v.isImage).map(v => [v.name, v.value]));
            const parameters = Object.fromEntries(vars.filter(v => v.isParameter).map(v => [v.name, v.value]));
            const tObj = Object.fromEntries(Object.values(temporalVariables).flat().map(v => [v.name, v.value]))
            const layoutsToRender: StreamRenderLayoutSet = Object.fromEntries(Object.entries(layouts).map(([k, v]) => [k, savedToRenderLayout(v)]));

            const oldVars = variables['formula']?.map(v => v.name) ?? [];
            const layoutVars = variables['layout']?.map(v => v.name) ?? [];
            const vObj = Object.fromEntries(Object.entries(data).filter(([k, v]) => !oldVars.includes(k) && !layoutVars.includes(k)));

            const backDarkFormulaObj: object = Object.fromEntries(Object.entries(vObj)
                .filter(([, value]) => typeof value === 'string' && value.startsWith('=') && parseFormula(value.slice(1)).usedVariables.has('backDark')));
            const vObjNoBackDark = Object.fromEntries(Object.entries(vObj).filter(([k]) => !Object.keys(backDarkFormulaObj).includes(k)));
            const commonData: StreamRenderObject = computeFormulas(vObjNoBackDark, tObj);
            const layoutTuple: [string, StreamStateVariable[], StreamRenderObject][] = Object.entries(layouts).map(([id, layout]) => {
                const backDark = getBackgroundSpec(layout.backgroundType)?.dark ?? false;
                const backComputed = computeFormulas({ ...commonData, backDark, ...backDarkFormulaObj, ...parameters }, tObj);
                const layoutVariables = getLayoutVariables(backComputed, layout);
                const layoutObj: StreamRenderObject = {
                    ...Object.fromEntries(layoutVariables.map(v => [v.name, v.value])), 
                    backDark,
                    ...Object.fromEntries(Object.entries(backComputed).filter(([k]) => Object.keys(backDarkFormulaObj).includes(k))),
                    ...parameters
                };
                if (layout.images)
                    layoutObj.img = Object.fromEntries(layout.images.map(v => [v.name, v.value]))
                return [id, layoutVariables, layoutObj];
            });
            const layoutData: Record<string, StreamRenderObject> = Object.fromEntries(layoutTuple.map(([id,, obj]) => [id, obj]));
            const renderData: StreamRenderData = { commonData, layoutData, layouts: layoutsToRender };

            if (showingLayoutId) { 
                dispatch(setStreamVariables('formula', layoutTuple.find(([id]) => id === showingLayoutId)?.[1] ?? []));
            }

            dispatch(setStreamData(renderData));
            break;
        }
        case SET_STREAM_DATA: {
            const out: StreamStateOut = getStreamOut(getState())
            if (!out.data)
                break

            function buildKeyTree(used: Set<string>) {
                const tree: any = {};
                for (const key of used) {
                    const parts = key.split('.');
                    let current = tree;
                    for (const part of parts) {
                        current = current[part] ??= {};
                    }
                }
                return tree;
            }
            function filterObject(data: any, keyTree: any): any {
                if (typeof data !== 'object' || data === null) return data;
            
                return Object.fromEntries(
                    Object.entries(keyTree)
                        .filter(([k]) => k in data)
                        .map(([k, subTree]) => [k, typeof subTree === 'object' && Object.keys(subTree as object).length === 0 ? data[k] : filterObject(data[k], subTree)])
                );
            }

            const usedLayouts: string[] = getStreamUsedLayouts(getState());
            const usedVariables = new Set(Object.entries(out.computed).filter(([id]) => usedLayouts.includes(id)).map(([,v]) => v.usedVariables ?? []).flat())
            const keyTree = buildKeyTree(usedVariables);

            const renderData: StreamRenderData = {
                layouts: out.data.layouts,
                layoutData: Object.fromEntries(Object.entries(out.data.layoutData)
                    .filter(([id]) => usedLayouts.includes(id))
                    .map(([id, data]) => {
                        const usedLayoutVariables = out.computed[id]?.usedVariables
                        if (!usedLayoutVariables?.length) return [id, {}]
                        return [id, filterObject(data, keyTree)]
                    })),
                commonData: filterObject(out.data.commonData, keyTree)
            }
            
            const delta = getDelta(_dataInClient, renderData)
            if (!delta)
                break

            _dataInClient = applyDelta(_dataInClient, delta)
            dispatch(sendWebSocketMessage('stream', delta))
            break
        }
        case WEB_SOCKET_STATE_CHANGED: {
            const code: WebSocketStateCode = action.payload.code
            if (code === WebSocketStateCode.connected) {
                // it is a new client, send all data next time
                _dataInClient = undefined
            }
            break
        }
    }
}

let _dataInClient: StreamRenderData | undefined = undefined

const transpileCache = new Map<string, string>();
function getTranspiledCode(jsCode: string): string {
    if (!transpileCache.has(jsCode)) {
        // Transpile the modern JS code to ES5
        transpileCache.set(jsCode, Babel.transform(jsCode, { presets: ['env'] }).code!);
    }
    return transpileCache.get(jsCode)!;
}

function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
    const aKeys = Object.keys(a), bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(key => deepEqual(a[key], b[key]));
}

function getLayoutVariables(context: any, layout?: StreamSavedLayout): StreamStateVariable[] {
    const jsCode = layout?.formulaJavaScript;
    if (!jsCode?.trim()) return [];

    try {
        const es5Code = getTranspiledCode(jsCode);
        const interpreter = new Interpreter(es5Code, interpreterLoadContext(context));
        interpreter.run();

        return Object.entries(interpreter.globalScope.object.properties)
            .filter(([name, value]) =>
                !name.startsWith('__') &&
                name !== 'self' &&
                name !== 'window' &&
                value !== undefined &&
                (value as any)?.class !== 'Function'
            )
            .map(([name, value]) => ({ name, value: interpreter.pseudoToNative(value) }))
            .filter(({ name, value }) => !deepEqual(context[name], value));
    } catch (e) {
        return [{ name: '!error', value: e.message }];
    }
}

export default [
    requests
]
