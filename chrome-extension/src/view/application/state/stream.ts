import { TemporalValue } from '../../../common/state'
import { StreamComputedLayoutDataSet, StreamRenderData, StreamRenderValue, StreamSavedLayoutSet } from '../../../stream/data'

const STREAM_TABULAR_CHOOSER = '[stream] chooser'
const STREAM_TABULAR_VARIABLES = '[stream] variables'
const STREAM_TABULAR_IMAGES = '[stream] images'
const STREAM_TABULAR_TRASH = '[stream] trash'

interface StreamStateIn {
    advanced: boolean // show advanced editor
    defaultAuthor: string
    view: string[]
    layouts: StreamSavedLayoutSet
    layoutAlias?: { urlLayoutId: string, realLayoutId: string } // so the layout can change Id without changing the url while editing it
    trashLayouts: StreamSavedLayoutSet
}

interface StreamStateOut {
    computed: StreamComputedLayoutDataSet
    data: StreamRenderData
}

interface StreamState {
    in: StreamStateIn
    variables: Record<string, StreamStateVariable[]> // source => variables
    temporalVariables: Record<string, StreamTemporalVariable[]> // source => variables
    ui: {
        showingLayoutId?: string
    }
    client: {
        usedLayouts?: string[]
    }
    out: StreamStateOut
}

interface StreamBaseVariable<T> {
    name: string
    value: T
    description?: string
}

interface StreamUserImageVariable extends StreamBaseVariable<string> {
    id: number
}

interface StreamStateVariable extends StreamBaseVariable<StreamRenderValue> {
    isImage?: boolean
}

interface StreamTemporalVariable extends StreamBaseVariable<TemporalValue> {
    decimals?: number
}

type StreamComputedVariable = (StreamUserImageVariable | StreamStateVariable) & {
    source: string
    id?: number
    computed?: StreamRenderValue
    isImage?: boolean
}

export {
    StreamState,
    StreamStateIn,
    StreamStateOut,
    STREAM_TABULAR_CHOOSER,
    STREAM_TABULAR_VARIABLES,
    STREAM_TABULAR_IMAGES,
    STREAM_TABULAR_TRASH,
    StreamStateVariable,
    StreamUserImageVariable,
    StreamComputedVariable,
    StreamTemporalVariable,
}
