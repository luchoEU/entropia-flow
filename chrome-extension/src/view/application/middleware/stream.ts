import { mergeDeep } from "../../../common/merge"
import { SHOW_PAGES_IN_DEVELOPMENT } from "../../../config"
import { ON_LAST } from "../actions/last"
import { sendWebSocketMessage } from "../actions/messages"
import { SET_STATUS, TICK_STATUS } from "../actions/status"
import { setStreamState, SET_STREAM_BACKGROUND_EXPANDED, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED, SET_STREAM_DATA, setStreamData } from "../actions/stream"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn } from "../helpers/stream"
import { getLast } from "../selectors/last"
import { getStatus } from "../selectors/status"
import { getStreamIn, getStreamOut } from "../selectors/stream"
import { StreamStateIn, StreamStateOut } from "../state/stream"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: StreamStateIn = await api.storage.loadStream()
            if (state)
                dispatch(setStreamState(mergeDeep(initialStateIn, state)))
            break
        }
        case SET_STREAM_ENABLED:
        case SET_STREAM_BACKGROUND_EXPANDED:
        case SET_STREAM_BACKGROUND_SELECTED: {
            const state: StreamStateIn = getStreamIn(getState())
            await api.storage.saveStream(state)
            break
        }
    }
    switch (action.type) {
        case PAGE_LOADED:
        case ON_LAST:
        case TICK_STATUS:
        case SET_STATUS:
        case SET_STREAM_BACKGROUND_SELECTED:
        {
            const { delta } = getLast(getState())
            const { message } = getStatus(getState())
            const { background }: StreamStateIn = getStreamIn(getState())

            const data = {
                background: background.selected,
                delta,
                message
            }
            dispatch(setStreamData(data))
            break;
        }
        case SET_STREAM_DATA: {
            const { data }: StreamStateOut = getStreamOut(getState())
            if (SHOW_PAGES_IN_DEVELOPMENT) {
                // TODO: it should only send this message if connected
                // Also check if reconnection to background works
                dispatch(sendWebSocketMessage('stream', data))
            }
            break
        }
    }
}

export default [
    requests
]
