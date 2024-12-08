import { PAGE_LOADED } from "../actions/ui"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: { }
    }
}

export default [
    requests
]