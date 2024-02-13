import { BackgroundType } from '../../../stream/background'
import { StreamState, StreamStateIn } from "../state/stream";

const initialStateIn: StreamStateIn = {
    enabled: false,
    background: {
        expanded: true,
        selected: BackgroundType.Light,
    }
}

const initialState: StreamState = {
    in: initialStateIn,
    out: undefined
}

const setState = (state: StreamState, newState: StreamStateIn): StreamState => ({
    in: newState,
    out: undefined
})

const setEnabled = (state: StreamState, enabled: boolean) => ({
    ...state,
    in: {
        ...state.in,
        enabled
    }
})

const setBackgroundExpanded = (state: StreamState, expanded: boolean): StreamState => ({
    ...state,
    in: {
        ...state.in,
        background: {
            ...state.in.background,
            expanded
        }
    }
})

const setBackgroundSelected = (state: StreamState, selected: BackgroundType): StreamState => ({
    ...state,
    in: {
        ...state.in,
        background: {
            ...state.in.background,
            selected
        }
    }
})

const setStreamData = (state: StreamState, data: any): StreamState => ({
    ...state,
    out: {
        ...state.out,
        data
    }
})

export {
    initialState,
    initialStateIn,
    setState,
    setEnabled,
    setBackgroundExpanded,
    setBackgroundSelected,
    setStreamData
}
