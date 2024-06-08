import { SET_CONNECTION_CLIENT_EXPANDED, SET_CONNECTION_STATE, SET_CONNECTION_STATUS, WEB_SOCKET_CHANGED } from "../actions/connection"
import { initialState, setConnectionClientExpanded, setConnectionStatus, setConnectionWebSocket, setState } from "../helpers/connection"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CONNECTION_STATE: return setState(state, action.payload.state)
        case SET_CONNECTION_CLIENT_EXPANDED: return setConnectionClientExpanded(state, action.payload.expanded)
        case WEB_SOCKET_CHANGED: return setConnectionWebSocket(state, action.payload.webSocket)
        case SET_CONNECTION_STATUS: return setConnectionStatus(state, action.payload.status, action.payload.message)
        default: return state
    }
}
