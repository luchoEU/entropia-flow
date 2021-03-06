import { setStreamState, SET_STREAM_BACKGROUND_EXPANDED, SET_STREAM_BACKGROUND_SELECTED, SET_STREAM_ENABLED } from "../actions/stream"
import { PAGE_LOADED } from "../actions/ui"
import { getStream } from "../selectors/stream"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadStream()
            if (state)
                dispatch(setStreamState(state))
            break
        }
        case SET_STREAM_ENABLED:
        case SET_STREAM_BACKGROUND_EXPANDED:
        case SET_STREAM_BACKGROUND_SELECTED: {
            const state = getStream(getState())
            await api.storage.saveStream(state)
            break
        }
    }
}

export default [
    requests
]