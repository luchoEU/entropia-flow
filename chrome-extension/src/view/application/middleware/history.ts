import { createBasicNotification } from "../../../common/notifications"
import { setHistoryIntervalId, SET_HISTORY_LIST, EXPORT_TO_FILE } from "../actions/history"
import { getHistory } from "../selectors/history"
import { getStatus } from "../selectors/status"
import { HistoryState } from "../state/history"

const INTERVAL_MILLISECONDS = 10 * 60 * 1000  // it should update at least every 10 minutes or an error notification is shown to notify the user
const NOTIFICATION_TIMES = 2

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case SET_HISTORY_LIST: {
            const state: HistoryState = getHistory(getState())

            if (state.intervalId !== undefined)
                window.clearInterval(state.intervalId)

            var notificationTimes = 0
            const intervalId = window.setInterval(
                () => {
                    const { isMonitoring } = getStatus(getState());
                    notificationTimes++
                    if (isMonitoring && notificationTimes < NOTIFICATION_TIMES) {
                        createBasicNotification('history', 'Failed to refresh items from entropia universe page');
                    } else {
                        window.clearInterval(state.intervalId)
                    }
                },
                INTERVAL_MILLISECONDS
            )

            dispatch(setHistoryIntervalId(intervalId))
            break
        }
        case EXPORT_TO_FILE: {
            const { list } = getHistory(getState())
            const inv = list.find(i => i.key === action.payload.key)
            if (inv) {
                const data = JSON.stringify({
                    date: new Date(inv.rawInventory.meta.lastDate ?? inv.rawInventory.meta.date).toString(),
                    items: inv.rawInventory.itemlist
                }, null, 2)

                // save to file
                const blob = new Blob([data], { type: "application/json" })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `entropia-flow-items.json`
                a.style.display = 'none'
                document.body.appendChild(a)
                a.click()
                setTimeout(() => {
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                }, 0)
            }
            break
        }
    }
}

export default [
    requests
]
