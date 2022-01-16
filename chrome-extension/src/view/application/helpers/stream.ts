import { StreamState } from "../state/stream";

const initialState: StreamState = {
    enabled: false
}

const setState = (state: StreamState, newState: StreamState): StreamState => newState

const setEnabled = (state: StreamState, enabled: boolean) => ({
    ...state,
    enabled
})

export {
    initialState,
    setState,
    setEnabled
}