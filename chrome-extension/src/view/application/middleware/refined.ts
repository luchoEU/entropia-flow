import { mergeDeep } from "../../../common/utils"
import { REFINED_MARKUP_CHANGED, REFINED_SELL, REFINED_VALUE_CHANGED, setRefinedState, SET_REFINED_EXPANDED } from "../actions/refined"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/refined"
import { getRefined } from "../selectors/refined"
import { RefinedState } from "../state/refined"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: RefinedState = await api.storage.loadRefine()
            if (state)
                dispatch(setRefinedState(mergeDeep(state, initialState)))
            break
        }
        case SET_REFINED_EXPANDED:
        case REFINED_VALUE_CHANGED:
        case REFINED_MARKUP_CHANGED:
        case REFINED_SELL: {
            const state: RefinedState = getRefined(getState())
            await api.storage.saveRefine(cleanForSave(state))
            break
        }
    }
}

export default [
    requests
]
