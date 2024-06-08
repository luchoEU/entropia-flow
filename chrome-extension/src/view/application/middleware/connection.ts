import { mergeDeep } from "../../../common/utils"
import { SET_CONNECTION_CLIENT_EXPANDED, WEB_SOCKET_CHANGED, setConnectionState } from "../actions/connection"
import { setWebSocketUrl } from "../actions/messages"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/connection"
import { getConnection } from "../selectors/connection"
import { ConnectionState } from "../state/connection"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: ConnectionState = await api.storage.loadConnection()
            if (state)
                dispatch(setConnectionState(mergeDeep(initialState, state)))
            break
        }
        case SET_CONNECTION_CLIENT_EXPANDED:
        case WEB_SOCKET_CHANGED: {
            const state: ConnectionState = getConnection(getState())
            await api.storage.saveConnection(state)

            if (action.type === WEB_SOCKET_CHANGED)
                dispatch(setWebSocketUrl(state.client.webSocket))
            break
        }
    }
}

export default [
    requests
]
