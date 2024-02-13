import { BackgroundType } from '../../../stream/background'

interface StreamStateIn {
    enabled: boolean,
    background: {
        expanded: boolean,
        selected: BackgroundType
    }
}

interface StreamStateOut {
    data: any
}

interface StreamState {
    in: StreamStateIn,
    out: StreamStateOut
}

export {
    StreamState,
    StreamStateIn,
    StreamStateOut
}
