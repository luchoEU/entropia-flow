import { setListExpanded, SET_LIST_EXPANDED } from "../actions/history"
import { PAGE_LOADED } from "../actions/ui"
import { getHistory } from "../selectors/history"
import { HistoryState } from "../state/history"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const expanded = await api.storage.loadHistoryExpanded()
            if (expanded)
                dispatch(setListExpanded(expanded))
            break
        }
        case SET_LIST_EXPANDED: {
            const state: HistoryState = getHistory(getState())
            await api.storage.saveHistoryExpanded(state.expanded)
            break
        }
    }
}

export default [
    requests
]