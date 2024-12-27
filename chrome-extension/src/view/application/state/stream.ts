import { BackgroundType } from '../../../stream/background'
import StreamRenderData from '../../../stream/data'
import { HtmlTemplateData } from '../../../stream/htmlTemplate'

const STREAM_TABULAR_VARIABLES = '[stream] variables'

interface StreamStateIn {
    enabled: boolean,
    background: {
        expanded: boolean,
        selected: BackgroundType
    }
    template: HtmlTemplateData
}

interface StreamStateOut {
    data: StreamRenderData
}

interface StreamState {
    in: StreamStateIn,
    variables: Record<string, StreamVariable[]>,
    out: StreamStateOut
}

interface StreamVariable {
    source?: string,
    name: string,
    value: string,
    description?: string,
    isIndirect?: boolean
}

export {
    StreamState,
    StreamStateIn,
    StreamStateOut,
    STREAM_TABULAR_VARIABLES,
    StreamVariable
}
