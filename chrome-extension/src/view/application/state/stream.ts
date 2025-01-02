import StreamRenderData, { StreamRenderLayoutSet, StreamRenderValue } from '../../../stream/data'

const STREAM_TABULAR_VARIABLES = '[stream] variables'
const STREAM_TABULAR_IMAGES = '[stream] images'

interface StreamStateIn {
    enabled: boolean
    editing?: string // layout id
    windows: string[]
    layouts: StreamRenderLayoutSet
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
