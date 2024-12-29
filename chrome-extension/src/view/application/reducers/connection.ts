import { SET_CONNECTION_CLIENT_EXPANDED, SET_CONNECTION_STATE, SET_CONNECTION_STATUS, WEB_SOCKET_CHANGED } from "../actions/connection"
import { initialState, reduceSetConnectionClientExpanded, reduceSetConnectionStatus, reduceSetConnectionWebSocket, reduceSetState } from "../helpers/connection"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_CONNECTION_STATE: return reduceSetState(state, action.payload.state)
        case SET_CONNECTION_CLIENT_EXPANDED: return reduceSetConnectionClientExpanded(state, action.payload.expanded)
        case WEB_SOCKET_CHANGED: return reduceSetConnectionWebSocket(state, action.payload.webSocket)
        case SET_CONNECTION_STATUS: return reduceSetConnectionStatus(state, action.payload.status)
        default: return state
    }
}
