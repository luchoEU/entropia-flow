import { BackgroundType } from '../../../stream/background'

interface StreamState {
    enabled: boolean,
    background: {
        expanded: boolean,
        selected: BackgroundType
    }
}

export {
    StreamState
}