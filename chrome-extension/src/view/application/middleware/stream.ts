import { WebSocketStateCode } from "../../../background/client/webSocketInterface"
import { mergeDeep } from "../../../common/merge"
import { getBackgroundSpec, getLogoUrl } from "../../../stream/background"
import StreamRenderData, { StreamRenderLayout } from "../../../stream/data"
import { applyDelta, getDelta } from "../../../stream/delta"
import { computeFormulas } from "../../../stream/template"
import { WEB_SOCKET_STATE_CHANGED } from "../actions/connection"
import { ON_LAST } from "../actions/last"
import { sendWebSocketMessage } from "../actions/messages"
import { SET_STATUS, TICK_STATUS } from "../actions/status"
import { setStreamState, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED, SET_STREAM_DATA, setStreamData, SET_STREAM_VARIABLES, setStreamVariables, SET_STREAM_EDITING, SET_STREAM_NAME, ADD_STREAM_LAYOUT, REMOVE_STREAM_LAYOUT, SET_STREAM_HTML_TEMPLATE, SET_STREAM_CSS_TEMPLATE, SET_STREAM_STARED, ADD_STREAM_USER_VARIABLE, REMOVE_STREAM_USER_VARIABLE, SET_STREAM_USER_VARIABLE_PARTIAL, setStreamUserVariablePartial, removeStreamUserVariable, setStreamEditing, removeStreamLayout, setStreamStared } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn } from "../helpers/stream"
import { getLast } from "../selectors/last"
import { getStatus } from "../selectors/status"
import { getStream, getStreamIn, getStreamOut } from "../selectors/stream"
import { STREAM_TABULAR_CHOOSER, STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamState, StreamStateIn, StreamStateOut, StreamVariable } from "../state/stream"
import isEqual from 'lodash.isequal';
import { TabularDefinitions } from "../state/tabular"
import { setTabularDefinitions } from "../helpers/tabular"
import { RowValue } from "../../components/common/SortableTabularSection.data"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    const { variables: beforeVariables }: StreamState = getStream(getState())
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            setTabularDefinitions(_tabularDefinitions)
            const state: StreamStateIn = await api.storage.loadStream()
            if (state)
                dispatch(setStreamState(mergeDeep(initialStateIn, state)))
            break
        }
        case SET_STREAM_ENABLED:
        case SET_STREAM_BACKGROUND_SELECTED:
        case SET_STREAM_HTML_TEMPLATE:
        case SET_STREAM_CSS_TEMPLATE:
        case SET_STREAM_NAME:
        case SET_STREAM_EDITING:
        case SET_STREAM_STARED:
        case ADD_STREAM_LAYOUT:
        case REMOVE_STREAM_LAYOUT:
        case ADD_STREAM_USER_VARIABLE:
        case REMOVE_STREAM_USER_VARIABLE:
        case SET_STREAM_USER_VARIABLE_PARTIAL: {
            const state: StreamStateIn = getStreamIn(getState())
            await api.storage.saveStream(state)
            break
        }
        case SET_STREAM_VARIABLES: {
            const { variables }: StreamState = getStream(getState())
            if (isEqual(beforeVariables, variables))
                break

            const d: StreamVariable[] =
                Object.entries(variables).map(([source, data]) => data.map(v => ({ source, ...v }))).flat()
            const noImages = d.filter(v => !v.isImage)
            const images = d.filter(v => v.isImage)

            const obj = Object.fromEntries(noImages.map(v => [v.name, v.value]))
            obj.img = Object.fromEntries(images.map(v => [v.name, `img.${v.name}`]))
            const computedObj = computeFormulas(obj)
            const tVariables = noImages.map(v => ({ ...v, computed: computedObj[v.name] }))

            dispatch(setTabularData(STREAM_TABULAR_VARIABLES, tVariables))
            dispatch(setTabularData(STREAM_TABULAR_IMAGES, images))
            break
        }
    }

    switch (action.type) {
        case PAGE_LOADED:
        case ON_LAST:
        {
            const { delta } = getLast(getState())
            dispatch(setStreamVariables('last', [
                { name: 'delta', value: (delta || 0).toFixed(2) },
                { name: 'deltaBackColor', value: "=IF(delta > 0, 'green', delta < 0, 'red', 'black')", description: 'delta background color' },
                { name: 'deltaWord', value: "=IF(delta > 0, 'Profit', delta < 0, 'Loss'))", description: 'delta word' }
            ]))
            break
        }
    }
    switch (action.type) {
        case PAGE_LOADED:
        case TICK_STATUS:
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
        case PAGE_LOADED:
        case SET_STREAM_BACKGROUND_SELECTED:
        {
            const { layouts, editing } = getStreamIn(getState())
            const t = layouts[editing?.layoutId]?.backgroundType
            dispatch(setStreamVariables('background', [
                { name: 'backDark', value: t ? getBackgroundSpec(t).dark : false, description: 'background is dark' },
                { name: 'logoUrl', value: '=IF(backDark, img.logoWhite, img.logoBlack)', description: 'logo url' },
                { name: 'logoWhite', value: getLogoUrl(true), isImage: true },
                { name: 'logoBlack', value: getLogoUrl(false), isImage: true }
            ]))
            break
        }
    }

    switch (action.type) {
        case PAGE_LOADED:
        case ADD_STREAM_USER_VARIABLE:
        case REMOVE_STREAM_USER_VARIABLE:
        case SET_STREAM_USER_VARIABLE_PARTIAL: {
            const { userVariables } = getStreamIn(getState())
            dispatch(setStreamVariables('user', userVariables));
            break;
        }
    }

    switch (action.type) {
        case PAGE_LOADED:
        case SET_STREAM_BACKGROUND_SELECTED:
        case SET_STREAM_HTML_TEMPLATE:
        case SET_STREAM_CSS_TEMPLATE:
        case SET_STREAM_STARED:
        case SET_STREAM_NAME:
        case ADD_STREAM_LAYOUT:
        case REMOVE_STREAM_LAYOUT:
        {
            const { layouts }: StreamStateIn = getStreamIn(getState())
            const chooser: StreamChooserLine[] = Object.entries(layouts).map(([id, layout]) => ({
                id,
                name: layout.name,
                readonly: !!layout.readonly,
                stared: !!layout.stared,
                layout
            }));
            dispatch(setTabularData(STREAM_TABULAR_CHOOSER, chooser));
            break;
        }
    }

    switch (action.type) {
        case SET_STREAM_HTML_TEMPLATE:
        case SET_STREAM_CSS_TEMPLATE:
        case SET_STREAM_VARIABLES:
        {
            const { in: { layouts }, variables } = getStream(getState());
            const vars = Object.values(variables).flat();
            const data = Object.fromEntries(vars.filter(v => !v.isImage).map(v => [v.name, v.value]));
            data.img = Object.fromEntries(vars.filter(v => v.isImage).map(v => [v.name, v.value]));
            const renderData: StreamRenderData = { data, layouts };
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
            if (_lastWebSocketCode !== code) {
                if (code === WebSocketStateCode.connected)
                    _dataInClient = undefined // it is a new client
                _lastWebSocketCode = code
            }
            break
        }
    }
}

let _dataInClient: StreamRenderData = undefined
let _lastWebSocketCode: WebSocketStateCode = undefined

interface StreamChooserLine {
    id: string,
    name: string,
    readonly: boolean,
    stared: boolean,
    layout: StreamRenderLayout
}

const _field = (g: StreamVariable, selector: string, maxWidth?: number, readonly?: boolean, addRemove?: boolean): RowValue => {
    if (!readonly && g.source === 'user') {
        const w = { input: g[selector], width: maxWidth, dispatchChange: (v: string) => setStreamUserVariablePartial(g.id, { [selector]: v }) }
        return addRemove ? { sub: [ w, { img: 'img/cross.png', title: 'Remove variable', dispatch: () => removeStreamUserVariable(g.id) } ] } : w;
    } else if (maxWidth) {
        const v = g[selector];
        return { text: typeof v === 'string' ? v : JSON.stringify(v), maxWidth };
    } else {
        return g[selector];
    }
}

const _tabularDefinitions: TabularDefinitions = {
    [STREAM_TABULAR_IMAGES]: {
        title: 'Images',
        columns: ['Source', 'Name', 'Image', 'Description'],
        getRow: (g: StreamVariable) => [ g.source, g.name, { img: g.value as string, title: `${g.name} image`, show: true, style: { height: '90%' } }, { text: g.description, maxWidth: 300 } ],
    },
    [STREAM_TABULAR_VARIABLES]: {
        title: 'Variables',
        columns: ['Source', 'Name', 'Value', 'Computed', 'Description'],
        getRow: (g: StreamVariable) => [
            g.source,
            _field(g, 'name', 100, false, true),
            _field(g, 'value', 300),
            _field(g, 'computed', 120, true),
            _field(g, 'description', 300),
        ],
    },
    [STREAM_TABULAR_CHOOSER]: {
        title: 'Layouts',
        columns: [ 'Name', 'Preview' ],
        getRow: (g: StreamChooserLine, i: number) => [
            [ g.name,
                { flex: 1 },
                { img: g.stared ? 'img/staron.png' : 'img/staroff.png', title: 'Set as default', show: true, dispatch: () => setStreamStared(g.id, !g.stared) },
                { img: 'img/edit.png', title: 'Edit', dispatch: () => setStreamEditing(g.id) },
                { img: 'img/cross.png', title: 'Remove', dispatch: () => removeStreamLayout(g.id), visible: !g.readonly },
            ], {
                layout: g.layout, layoutId: g.id, id: `stream-chooser-${i}`, scale: 0.4, width: 200
            }],
    }
}

export default [
    requests
]
