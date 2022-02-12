enum BackgroundType {
    Light,
    Dark,
    Ashfall,
}

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
    BackgroundType,
    BackgroundSpec,
    StreamState
}