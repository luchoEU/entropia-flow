import { TemporalValue } from '../../../common/state'
import StreamRenderData, { StreamRenderLayoutSet, StreamRenderValue } from '../../../stream/data'

const STREAM_TABULAR_CHOOSER = '[stream] chooser'
const STREAM_TABULAR_VARIABLES = '[stream] variables'
const STREAM_TABULAR_IMAGES = '[stream] images'

interface StreamStateIn {
    enabled: boolean
    editing?: {
        layoutId: string
    }
    view: string[]
    layouts: StreamRenderLayoutSet
    userVariables: StreamUserVariable[]
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

interface StreamUserVariable {
    id: number,
    name: string
    value: string
    description?: string
    isImage?: boolean
}

interface StreamStateVariable {
    name: string
    value: StreamRenderValue
    description?: string
    isImage?: boolean
}

interface StreamTemporalVariable {
    name: string
    value: TemporalValue
    decimals?: number
    description?: string
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
