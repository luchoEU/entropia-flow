import { BackgroundType } from '../../../stream/background'
import { StreamState } from "../state/stream";

const initialState: StreamState = {
    enabled: false,
    background: {
        expanded: true,
        selected: BackgroundType.Light,
    }
}

const isValid = (state: StreamState): boolean => state.background !== undefined

const setState = (state: StreamState, newState: StreamState): StreamState => {
    return isValid(newState) ? newState : initialState
}

const setEnabled = (state: StreamState, enabled: boolean) => ({
    ...state,
    enabled
})

const setBackgroundExpanded = (state: StreamState, expanded: boolean): StreamState => ({
    ...state,
    background: {
        ...state.background,
        expanded
    }
})

const setBackgroundSelected = (state: StreamState, selected: BackgroundType): StreamState => ({
    ...state,
    background: {
        ...state.background,
        selected
    }
})

export {
    initialState,
    setState,
    setEnabled,
    setBackgroundExpanded,
    setBackgroundSelected
}