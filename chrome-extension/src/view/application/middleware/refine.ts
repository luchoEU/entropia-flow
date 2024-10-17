import { mergeDeep } from "../../../common/merge"
import { REFINE_AMOUNT_CHANGED, setRefineState } from "../actions/refine"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/refine"
import { getRefine } from "../selectors/refine"
import { RefineState } from "../state/refine"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: RefineState = await api.storage.loadRefine()
            if (state)
                dispatch(setRefineState(mergeDeep(initialState, state)))
            break
        }
        case REFINE_AMOUNT_CHANGED: {
            const state: RefineState = getRefine(getState())
            await api.storage.saveRefine(state)
            break
        }
    }
}

export default [
    requests
]
