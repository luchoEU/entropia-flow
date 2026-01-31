import { mergeDeep } from "../../../common/merge"
import { WEB_SOCKET_CHANGED, WEB_SOCKET_RETRY, setConnectionState } from "../actions/connection"
import { setWebSocketUrl } from "../actions/messages"
import { AppAction } from "../slice/app"
import { cleanForSave, initialState } from "../helpers/connection"
import { getConnection, getWebSocketUrl } from "../selectors/connection"
import { ConnectionState } from "../state/connection"
import { Feature } from "../state/settings"
import { isFeatureEnabledAtom } from '../atoms/settings'
import { getDefaultStore } from 'jotai'

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const result = await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: ConnectionState = await api.storage.loadConnection()
            if (state) {
                dispatch(setConnectionState(mergeDeep(initialState, state)))
            }
            break
        }
        case AppAction.LOADED: {
            const url: string = getWebSocketUrl(getState())
            if (url && getDefaultStore().get(isFeatureEnabledAtom(Feature.client)))
                dispatch(setWebSocketUrl(url)) // recover the connection
            break
        }
        case WEB_SOCKET_CHANGED: {
            const state: ConnectionState = getConnection(getState())
            await api.storage.saveConnection(cleanForSave(state))
            dispatch(setWebSocketUrl(state.client.webSocket))
            break
        }
        case WEB_SOCKET_RETRY: {
            const url: string = getWebSocketUrl(getState())
            dispatch(setWebSocketUrl(url)) // this retriggers the connection
            break
        }
    }
    return result
}

export default [
    requests
]
