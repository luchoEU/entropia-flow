import { USE_AMOUNT_CHANGED, setUseState } from "../actions/use"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/use"
import { getUse } from "../selectors/use"
import { UseState } from "../state/use"
import { mergeDeep } from "../../../common/merge"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: UseState = await api.storage.loadUse()
            if (state)
                dispatch(setUseState(mergeDeep(state, initialState)))
            break
        }
        case USE_AMOUNT_CHANGED: {
            const state: UseState = getUse(getState())
            await api.storage.saveUse(state)
            break
        }
    }
}

export default [
    requests
]
