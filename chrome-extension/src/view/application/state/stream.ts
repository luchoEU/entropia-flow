import { BackgroundType } from '../../../stream/background'

interface BackgroundSpec {
    key: number,
    type: BackgroundType,
    title: string,
    icon: string,
}

interface StreamState {
    enabled: boolean,
    background: {
        expanded: boolean,
        selected: BackgroundType
    }
}

export {
    BackgroundSpec,
    StreamState
}