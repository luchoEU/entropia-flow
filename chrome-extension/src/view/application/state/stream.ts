import { TemporalValue } from '../../../common/state'
import StreamRenderData, { StreamRenderLayoutSet, StreamRenderValue } from '../../../stream/data'

const STREAM_TABULAR_CHOOSER = '[stream] chooser'
const STREAM_TABULAR_VARIABLES = '[stream] variables'
const STREAM_TABULAR_IMAGES = '[stream] images'

interface StreamStateIn {
    advanced: boolean // show advanced editor
    defaultAuthor: string
    view: string[]
    layouts: StreamRenderLayoutSet
    userVariables: StreamUserVariable[]
    layoutAlias?: { urlLayoutId: string, realLayoutId: string } // so the layout can change Id without changing the url while editing it
}

interface StreamStateOut {
    data: StreamRenderData
}

interface StreamState {
    in: StreamStateIn
    variables: Record<string, StreamStateVariable[]> // source => variables
    temporalVariables: Record<string, StreamTemporalVariable[]> // source => variables
    out: StreamStateOut
}

interface StreamBaseVariable<T> {
    name: string
    value: T
    description?: string
}

interface StreamUserVariable extends StreamBaseVariable<string> {
    id: number,
    isImage?: boolean
}

interface StreamStateVariable extends StreamBaseVariable<StreamRenderValue> {
    isImage?: boolean
}

interface StreamTemporalVariable extends StreamBaseVariable<TemporalValue> {
    decimals?: number
}

type StreamComputedVariable = (StreamUserVariable | StreamStateVariable) & {
    source: string
    id?: number
    computed?: StreamRenderValue
}

export {
    StreamState,
    StreamStateIn,
    StreamStateOut,
    STREAM_TABULAR_CHOOSER,
    STREAM_TABULAR_VARIABLES,
    STREAM_TABULAR_IMAGES,
    StreamStateVariable,
    StreamUserVariable,
    StreamComputedVariable,
    StreamTemporalVariable,
}
