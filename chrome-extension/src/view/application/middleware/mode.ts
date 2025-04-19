import { mergeDeep } from "../../../common/merge"
import { MODE_PIN_MENU, MODE_PIN_STREAM_VIEW, MODE_SHOW_SUBTITLES, MODE_SHOW_VISIBLE_TOGGLE, setModeState } from "../actions/mode"
import { AppAction } from "../slice/app"
import { initialState } from "../helpers/mode"
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
        case MODE_SHOW_VISIBLE_TOGGLE:
        case MODE_PIN_MENU:
        case MODE_PIN_STREAM_VIEW: {
            const state: ModeState = getMode(getState())
            await api.storage.saveMode(state)
            break
        }
    }
}

export default [ requests ]
