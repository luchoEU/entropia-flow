import { mergeDeep } from "../../../common/merge"
import { MODE_SHOW_SUBTITLES, MODE_SHOW_VISIBLE_TOGGLE, setModeState } from "../actions/mode"
import { AppAction } from "../slice/app"
import { initialState } from "../helpers/refine"
import { getMode } from "../selectors/mode"
import ModeState from "../state/mode"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: ModeState = await api.storage.loadMode()
            if (state)
                dispatch(setModeState(mergeDeep(initialState, state)))
            break
        }
        case MODE_SHOW_SUBTITLES:
        case MODE_SHOW_VISIBLE_TOGGLE: {
            const state: ModeState = getMode(getState())
            await api.storage.saveMode(state)
            break
        }
    }
}

export default [
    requests
]
