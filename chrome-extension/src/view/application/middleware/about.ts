import { setState, SET_EXPANDED } from "../actions/about"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/about"
import { getAbout } from "../selectors/about"
import { AboutState } from "../state/about"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: AboutState = await api.storage.loadAbout()
            if (state)
                dispatch(setState({ ...initialState, ...state }))
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
