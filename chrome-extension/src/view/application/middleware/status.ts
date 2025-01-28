import { PAGE_LOADED } from "../actions/ui"

const init = ({ }) => ({ dispatch }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            break
        }
    }
}

export default [ init ]
