import { WebSocketStateCode } from "../../../background/client/webSocketInterface"
import { mergeDeep } from "../../../common/merge"
import { backgroundList, getLogoUrl } from "../../../stream/background"
import StreamRenderData from "../../../stream/data"
import { applyDelta, getDelta } from "../../../stream/delta"
import { computeFormulas } from "../../../stream/htmlTemplate"
import { WEB_SOCKET_STATE_CHANGED } from "../actions/connection"
import { ON_LAST } from "../actions/last"
import { sendWebSocketMessage } from "../actions/messages"
import { SET_STATUS, TICK_STATUS } from "../actions/status"
import { setStreamState, SET_STREAM_BACKGROUND_EXPANDED, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED, SET_STREAM_DATA, setStreamData, SET_STREAM_VARIABLES, setStreamVariables, SET_STREAM_TEMPLATE } from "../actions/stream"
import { setTabularData } from "../actions/tabular"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn } from "../helpers/stream"
import { getLast } from "../selectors/last"
import { getStatus } from "../selectors/status"
import { getStream, getStreamIn, getStreamOut } from "../selectors/stream"
import { STREAM_TABULAR_IMAGES, STREAM_TABULAR_VARIABLES, StreamState, StreamStateIn, StreamStateOut, StreamVariable } from "../state/stream"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: StreamStateIn = await api.storage.loadStream()
            if (state)
                dispatch(setStreamState(mergeDeep(initialStateIn, state)))
            break
        }
        case SET_STREAM_ENABLED:
        case SET_STREAM_BACKGROUND_EXPANDED:
        case SET_STREAM_BACKGROUND_SELECTED:
        case SET_STREAM_TEMPLATE: {
            const state: StreamStateIn = getStreamIn(getState())
            await api.storage.saveStream(state)
            break
        }
        case SET_STREAM_VARIABLES: {
            const { variables }: StreamState = getStream(getState())
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
            const s: StreamState = getStream(getState())
            const t = s.in.definition.backgroundType
            dispatch(setStreamVariables('background', [
                { name: 'backDark', value: t ? backgroundList[t].dark : false, description: 'background is dark' },
                { name: 'logoUrl', value: '=IF(backDark, img.logoWhite, img.logoBlack)', description: 'logo url' },
                { name: 'logoWhite', value: getLogoUrl(true), isImage: true },
                { name: 'logoBlack', value: getLogoUrl(false), isImage: true }
            ]))
            break
        }
    }

    switch (action.type) {
        case SET_STREAM_TEMPLATE:
        case SET_STREAM_VARIABLES:
        {
            const s: StreamState = getStream(getState())
            const vars = Object.values(s.variables).flat()
            const obj = Object.fromEntries(vars.filter(v => !v.isImage).map(v => [v.name, v.value]))
            obj.img = Object.fromEntries(vars.filter(v => v.isImage).map(v => [v.name, v.value]))
            const data: StreamRenderData = {
                obj,
                def: s.in.definition
            }
            dispatch(setStreamData(data))
            break;
        }
        case SET_STREAM_DATA: {
            const { data }: StreamStateOut = getStreamOut(getState())

            // TODO: send used variables
            const delta = getDelta(_dataInClient, data)
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

export default [
    requests
]
