
import { mergeDeep } from "../../../common/merge"
import { SET_EXPANDED, SET_VISIBLE, setExpandableState } from "../actions/expandable"
import { AppAction } from "../slice/app"
import { initialExpandableState } from "../helpers/expandable"
import { getExpandable } from "../selectors/expandable"
import ExpandableState from "../state/expandable"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
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
