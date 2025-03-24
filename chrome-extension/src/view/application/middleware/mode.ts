import { mergeDeep } from "../../../common/merge"
import { MODE_SHOW_SUBTITLES, setModeState } from "../actions/mode"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/refine"
import { getMode } from "../selectors/mode"
import ModeState from "../state/mode"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: ModeState = await api.storage.loadMode()
            if (state)
                dispatch(setModeState(mergeDeep(initialState, state)))
            break
        }
        case MODE_SHOW_SUBTITLES: {
            const state: ModeState = getMode(getState())
            await api.storage.saveMode(state)
            break
        }
    }
}

export default [
    requests
]
