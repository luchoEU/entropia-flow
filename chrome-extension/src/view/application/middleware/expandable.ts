
import { mergeDeep } from "../../../common/merge"
import { SET_EXPANDED, SET_VISIBLE, setExpandableState } from "../actions/expandable"
import { PAGE_LOADED } from "../actions/ui"
import { initialExpandableState } from "../helpers/expandable"
import { getExpandable } from "../selectors/expandable"
import ExpandableState from "../state/expandable"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: ExpandableState = await api.storage.loadExpandable()
            if (state)
                dispatch(setExpandableState(mergeDeep(initialExpandableState, state)))
            break
        }
        case SET_EXPANDED:
        case SET_VISIBLE: {
            const state: ExpandableState = getExpandable(getState())
            await api.storage.saveExpandable(state)
            break
        }
    }
}

export default [
    requests
]
