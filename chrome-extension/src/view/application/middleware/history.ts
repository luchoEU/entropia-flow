import { setHistoryExpanded, SET_HISTORY_EXPANDED, SET_HISTORY_LIST } from "../actions/history"
import { PAGE_LOADED } from "../actions/ui"
import { getHistory } from "../selectors/history"
import { HistoryState, MindEssenceLogText, ViewItemData } from "../state/history"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const expanded = await api.storage.loadHistoryExpanded()
            if (expanded)
                dispatch(setHistoryExpanded(expanded))
            break
        }
        case SET_HISTORY_LIST: {
            const state: HistoryState = getHistory(getState())
            if (state.list[0].diff) {
                var reduced = state.list[0].diff.flatMap((i: ViewItemData) =>
                    i.a !== undefined ? [ MindEssenceLogText[i.a.type] ] : []);
                if (reduced.length > 0) {
                    chrome.notifications.create(
                        undefined,
                        { type: "basic", iconUrl: "img/flow128.png", title: "Entropia Flow", message: reduced.join('\n') }
                    )
                }
            }
            break
        }
        case SET_HISTORY_EXPANDED: {
            const state: HistoryState = getHistory(getState())
            await api.storage.saveHistoryExpanded(state.expanded)
            break
        }
    }
}

export default [
    requests
]
