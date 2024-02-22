import { SET_CONNECTION_CLIENT_EXPANDED, SET_CONNECTION_STATE, WEB_SOCKET_CHANGED } from "../actions/connection"
import { initialState, setConnectionClientExpanded, setConnectionWebSocket, setState } from "../helpers/connection"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CONNECTION_STATE: return setState(state, action.payload.state)
        case SET_CONNECTION_CLIENT_EXPANDED: return setConnectionClientExpanded(state, action.payload.expanded)
        case WEB_SOCKET_CHANGED: return setConnectionWebSocket(state, action.payload.webSocket)
        default: return state
    }
}
