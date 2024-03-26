import { setHistoryExpanded, setHistoryIntervalId, SET_HISTORY_EXPANDED, SET_HISTORY_LIST } from "../actions/history"
import { PAGE_LOADED } from "../actions/ui"
import { getHistory } from "../selectors/history"
import { getStatus } from "../selectors/status"
import { HistoryState } from "../state/history"

const INTERVAL_MILLISECONDS = 10 * 60 * 1000  // 10 minutes
const NOTIFICATION_TIMES = 3

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

            if (state.intervalId !== undefined)
                clearInterval(state.intervalId)

            var notificationTimes = 0
            const intervalId = setInterval(
                () => {
                    const { isMonitoring } = getStatus(getState());
                    notificationTimes++
                    if (isMonitoring && notificationTimes < NOTIFICATION_TIMES) {
                        chrome.notifications.create(
                            undefined,
                            { type: "basic", iconUrl: "img/flow128.png", title: "Entropia Flow", message: "Disconnected" }
                        )
                    } else {
                        clearInterval(state.intervalId)
                    }
                },
                INTERVAL_MILLISECONDS
            )
            dispatch(setHistoryIntervalId(intervalId))

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
