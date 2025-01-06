import StreamRenderData, { StreamRenderLayoutSet, StreamRenderValue } from '../../../stream/data'

const STREAM_TABULAR_CHOOSER = '[stream] chooser'
const STREAM_TABULAR_VARIABLES = '[stream] variables'
const STREAM_TABULAR_IMAGES = '[stream] images'

interface StreamStateIn {
    enabled: boolean
    editing?: {
        layoutId: string
    }
    windows: string[]
    layouts: StreamRenderLayoutSet
    userVariables: StreamVariable[]
}

interface StreamStateOut {
    data: StreamRenderData
}

interface StreamState {
    in: StreamStateIn
    variables: Record<string, StreamVariable[]> // source => variables
    out: StreamStateOut
}

interface StreamVariable {
    source?: string
    id?: number
    name: string
    value: StreamRenderValue
    computed?: StreamRenderValue
    description?: string
    isImage?: boolean
}

export {
    StreamState,
    StreamStateIn,
    StreamStateOut,
    STREAM_TABULAR_CHOOSER,
    STREAM_TABULAR_VARIABLES,
    STREAM_TABULAR_IMAGES,
    StreamVariable,
}
