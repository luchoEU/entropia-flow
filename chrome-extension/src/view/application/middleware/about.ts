import { mergeDeep } from "../../../common/merge"
import { setState, SET_EXPANDED } from "../actions/about"
import { AppAction } from "../slice/app"
import { initialState } from "../helpers/about"
import { getAbout } from "../selectors/about"
import { AboutState } from "../state/about"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: AboutState = await api.storage.loadAbout()
            if (state)
                dispatch(setState(mergeDeep(initialState, state)))
            break
        }
        case SET_EXPANDED: {
            const state: AboutState = getAbout(getState())
            api.storage.saveAbout(state)
        }
    }
}

export default [
    requests
]
