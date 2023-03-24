import { mergeDeep } from "../../../common/utils"
import { setStreamState, SET_STREAM_BACKGROUND_EXPANDED, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED } from "../actions/stream"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/stream"
import { getStream } from "../selectors/stream"
import { StreamState } from "../state/stream"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: StreamState = await api.storage.loadStream()
            if (state)
                dispatch(setStreamState(mergeDeep(state, initialState)))
            break
        }
        case SET_STREAM_ENABLED:
        case SET_STREAM_BACKGROUND_EXPANDED:
        case SET_STREAM_BACKGROUND_SELECTED: {
            const state: StreamState = getStream(getState())
            await api.storage.saveStream(state)
            break
        }
    }
}

export default [
    requests
]
