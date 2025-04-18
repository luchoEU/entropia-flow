import { mergeDeep } from "../../../common/merge"
import { SET_TABULAR_FILTER, setTabularState, SORT_TABULAR_BY } from "../actions/tabular"
import { cleanForSave, initialState } from "../helpers/tabular"
import { getTabular } from "../selectors/tabular"
import { TabularState } from "../state/tabular"
import { AppAction } from "../slice/app"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: TabularState = await api.storage.loadTabular()
            if (state)
                dispatch(setTabularState(mergeDeep(initialState, state)))
            break
        }
        case SET_TABULAR_FILTER:
        case SORT_TABULAR_BY: {
            const state: TabularState = getTabular(getState())
            await api.storage.saveTabular(cleanForSave(state))
            break
        }
    }
}

export default [
    requests
]
