import { USE_AMOUNT_CHANGED, setUseState } from "../actions/use"
import { initialState } from "../helpers/use"
import { getUse } from "../selectors/use"
import { UseState } from "../state/use"
import { mergeDeep } from "../../../common/merge"
import { AppAction } from "../slice/app";

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const result = await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
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
    return result
}

export default [
    requests
]
