import { mergeDeep } from "../../../common/utils"
import { SET_CONNECTION_CLIENT_EXPANDED, setConnectionState } from "../actions/connection"
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
        case SET_CONNECTION_CLIENT_EXPANDED: {
            const state: ConnectionState = getConnection(getState())
            await api.storage.saveConnection(state)
            break
        }
    }
}

export default [
    requests
]
