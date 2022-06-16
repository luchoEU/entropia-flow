import { setState, SET_EXPANDED } from "../actions/about"
import { PAGE_LOADED } from "../actions/ui"
import { getAbout } from "../selectors/about"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadAbout()
            if (state)
                dispatch(setState(state))
            break
        }
        case SET_EXPANDED: {
            const state = getAbout(getState())
            api.storage.saveAbout(state)
        }
    }
}

export default [
    requests
]
