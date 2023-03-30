import { mergeDeep } from "../../../common/utils"
import { setStackableState, STACKABLE_MARKUP_CHANGED, STACKABLE_TT_VALUE_CHANGED } from "../actions/stackable"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn, } from "../helpers/stackable"
import { getStackableIn } from "../selectors/stackable"
import { StackableStateIn } from "../state/stackable"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: StackableStateIn = await api.storage.loadStackable()
            if (state)
                dispatch(setStackableState(mergeDeep(initialStateIn, state)))
            break
        }
        case STACKABLE_TT_VALUE_CHANGED:
        case STACKABLE_MARKUP_CHANGED: {
            const state: StackableStateIn = getStackableIn(getState())
            await api.storage.saveStackable(state)
            break
        }
    }
}

export default [
    requests
]
