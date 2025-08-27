import { StreamComputedLayoutDataSet, StreamRenderData, StreamSavedLayoutSet, StreamStateVariablesSet } from '../../../stream/data'

const STREAM_TABULAR_CHOOSER = '[stream] chooser'
const STREAM_TABULAR_VARIABLES = '[stream] variables'
const STREAM_TABULAR_IMAGES = '[stream] images'
const STREAM_TABULAR_PARAMETERS = '[stream] parameters'
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
    data: StreamRenderData
}

interface StreamState {
    in: StreamStateIn
    variables: StreamStateVariablesSet
    ui: {
        showingLayoutId?: string
    }
    out: StreamStateOut
}

export {
    StreamState,
    StreamStateIn,
    StreamStateOut,
    STREAM_TABULAR_CHOOSER,
    STREAM_TABULAR_VARIABLES,
    STREAM_TABULAR_IMAGES,
    STREAM_TABULAR_PARAMETERS,
    STREAM_TABULAR_TRASH
}
