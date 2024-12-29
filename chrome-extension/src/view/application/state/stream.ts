import StreamRenderData, { StreamRenderDefinition, StreamRenderValue } from '../../../stream/data'

const STREAM_TABULAR_VARIABLES = '[stream] variables'
const STREAM_TABULAR_IMAGES = '[stream] images'

interface StreamStateIn {
    enabled: boolean
    expanded: {
        background: boolean
    }
    definition: StreamRenderDefinition
}

interface StreamStateOut {
    data: StreamRenderData
}

interface StreamState {
    in: StreamStateIn
    variables: Record<string, StreamVariable[]>
    out: StreamStateOut
}

interface StreamVariable {
    source?: string
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
    STREAM_TABULAR_VARIABLES,
    STREAM_TABULAR_IMAGES,
    StreamVariable
}
