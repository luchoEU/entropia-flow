import { mergeDeep } from "../../../common/merge"
import { SET_CONNECTION_CLIENT_EXPANDED, WEB_SOCKET_CHANGED, WEB_SOCKET_RETRY, setConnectionState } from "../actions/connection"
import { setWebSocketUrl } from "../actions/messages"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/connection"
import { getConnection } from "../selectors/connection"
import { ConnectionState } from "../state/connection"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: ConnectionState = await api.storage.loadConnection()
            if (state) {
                dispatch(setConnectionState(mergeDeep(initialState, state)))
                dispatch(setWebSocketUrl(state.client.webSocket)) // recover the connection
            }
            break
        }
        case SET_CONNECTION_CLIENT_EXPANDED:
        case WEB_SOCKET_CHANGED: {
            const state: ConnectionState = getConnection(getState())
            await api.storage.saveConnection(cleanForSave(state))

            if (action.type === WEB_SOCKET_CHANGED)
                dispatch(setWebSocketUrl(state.client.webSocket))
            break
        }
        case WEB_SOCKET_RETRY: {
            const state: ConnectionState = getConnection(getState())
            dispatch(setWebSocketUrl(state.client.webSocket)) // this retriggers the connection
            break
        }
    }
}

export default [
    requests
]
