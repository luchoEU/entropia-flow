import { tickStatus } from "../actions/status"
import { PAGE_LOADED } from "../actions/ui"

const init = ({ }) => ({ dispatch }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            setInterval(() => dispatch(tickStatus), 1000)
            break
        }
    }
}

export default [
    init
]