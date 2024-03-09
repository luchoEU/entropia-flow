import { BackgroundType } from '../../../stream/background'

interface StreamStateIn {
    enabled: boolean,
    background: {
        expanded: boolean,
        selected: BackgroundType
    }
}

interface StreamStateOut {
    data: StreamData
}

interface StreamData {
    background: number,
    delta: number,
    message: string
}

interface StreamState {
    in: StreamStateIn,
    out: StreamStateOut
}

export {
    StreamState,
    StreamStateIn,
    StreamStateOut,
    StreamData
}
