import { mergeDeep } from "../../../common/merge"
import { getLogoUrl } from "../../../stream/background"
import StreamRenderData from "../../../stream/data"
import { templateManager } from "../../../stream/htmlTemplate"
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
import { STREAM_TABULAR_VARIABLES, StreamState, StreamStateIn, StreamStateOut, StreamVariable } from "../state/stream"

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
            dispatch(setTabularData(STREAM_TABULAR_VARIABLES, d))
            break
        }
    }

    switch (action.type) {
        case PAGE_LOADED:
        case SET_STREAM_TEMPLATE: {
            const { template }: StreamStateIn = getStreamIn(getState())
            templateManager.add(template)
            break
        }
    }

    switch (action.type) {
        case PAGE_LOADED:
        case ON_LAST:
        {
            const { delta } = getLast(getState())
            dispatch(setStreamVariables('last', _getDeltaData(delta)))
            break
        }
    }
    switch (action.type) {
        case PAGE_LOADED:
        case TICK_STATUS:
        case SET_STATUS:
        {
            const { message } = getStatus(getState())
            dispatch(setStreamVariables('status', [{ name: 'message', value: message ?? '', description: 'status message' }] ))
            break
        }
    }

    switch (action.type) {
        case PAGE_LOADED:
        case SET_STREAM_BACKGROUND_SELECTED:
        {
            const s: StreamState = getStream(getState())
            const backgroundType = s.in.background.selected
            dispatch(setStreamVariables('background', [{ name: 'logoUrl', value: templateManager.addIndirect(getLogoUrl(backgroundType)), description: 'logo url', isIndirect: true }]))
            break
        }
    }

    switch (action.type) {
        case SET_STREAM_VARIABLES:
        {
            const s: StreamState = getStream(getState())
            const indirectList = Object.values(s.variables).flat().filter(v => v.isIndirect).map(v => v.name)
            templateManager.setIndirectNames(indirectList)

            const templateName = s.in.template.name
            const backgroundType = s.in.background.selected
            const usedVariables = templateManager.get(templateName)?.getUsedVariables() ?? []
            const variables = Object.fromEntries(Object.values(s.variables).flat().filter(v => usedVariables.includes(v.name)).map(v => [v.name, v.value]))
            const data: StreamRenderData = {
                backgroundType,
                templateName,
                variables
            }
            dispatch(setStreamData(data))
            break;
        }
        case SET_STREAM_DATA: {
            const { data }: StreamStateOut = getStreamOut(getState())
            dispatch(sendWebSocketMessage('stream', _addDefinition(data)))
            break
        }
    }
}

function _addDefinition(data: StreamRenderData): StreamRenderData {
    const template = templateManager.get(data.templateName)
    if (!template)
        return data

    const usedVariables = template.getUsedVariables()
    const indirectNames = templateManager.getIndirectNames()
//    data.variables = Object.fromEntries(Object.entries(data.variables).filter(([n,v]) => usedVariables.includes(name)))

    return {
        ...data,
        templateDefinition: {
            data: template.getData(),
  //          indirect: template.getIndirect(),
            indirectNames
        }
    }
}

function _getDeltaData(delta: number | undefined): StreamVariable[] {
    let deltaBackColor: string
    let deltaWord: string
    if (delta === undefined || Math.abs(delta) < 0.005)
        delta = 0
    if (delta > 0) {
        deltaBackColor = 'green'
        deltaWord = 'Profit'
    } else if (delta < 0) {
        deltaBackColor = 'red'
        deltaWord = 'Loss'
    } else {
        deltaBackColor = 'black'
        deltaWord = ''
    }
    return [
        { name: 'deltaText', value: delta.toFixed(2) },
        { name: 'deltaBackColor', value: deltaBackColor },
        { name: 'deltaWord', value: deltaWord }
    ]
}

export default [
    requests
]
