import { ConnectionState } from "../state/connection"

const initialState: ConnectionState = {
    client: {
        expanded: true,
        webSocket: 'ws://localhost:6521'
    }
}

const setState = (state: ConnectionState, inState: ConnectionState) => inState

const setConnectionClientExpanded = (state: ConnectionState, expanded: boolean) => ({
    ...state,
    client: {
        ...state.client,
        expanded
    }
})

const setConnectionWebSocket = (state: ConnectionState, webSocket: string) => ({
    ...state,
    client: {
        ...state.client,
        webSocket
    }
})

export {
    initialState,
    setState,
    setConnectionClientExpanded,
    setConnectionWebSocket
}
