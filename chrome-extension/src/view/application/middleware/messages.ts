import { ViewState } from '../../../common/state'
import { setConnectionStatus } from '../actions/connection'
import { setHistoryList } from '../actions/history'
import { setCurrentInventory } from '../actions/inventory'
import { onLast } from '../actions/last'
import { setCurrentGameLog } from '../actions/log'
import { REFRESH, setLast, SET_AS_LAST, SET_LAST, TIMER_OFF, TIMER_ON, SEND_WEB_SOCKET_MESSAGE, SET_WEB_SOCKET_URL } from '../actions/messages'
import { setStatus } from '../actions/status'
import { PAGE_LOADED } from '../actions/ui'
import { getLatestFromHistory } from '../helpers/history'
import { getHistory } from '../selectors/history'
import { HistoryState } from '../state/history'

const refreshViewHandler = dispatch => async (m: ViewState) => {
    if (m.list) {
        m.list.reverse() // newer first
        dispatch(setHistoryList(m.list, m.last))
        if (m.last)
            dispatch(onLast(m.list, m.last))
        else if (m.list.length > 0 && m.list[0].log === undefined)
            dispatch(setLast)
        const newest = m.list.find(e => e.log === undefined)
        if (newest !== undefined)
            dispatch(setCurrentInventory(newest))
    }
    if (m.status)
        dispatch(setStatus(m.status))
    if (m.gameLog)
        dispatch(setCurrentGameLog(m.gameLog))
    if (m.clientState)
        dispatch(setConnectionStatus(m.clientState.state, m.clientState.message))
}

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            api.messages.initMessageClient(refreshViewHandler(dispatch))
            break
        }
        case REFRESH: { api.messages.requestRefresh(); break }
        case SET_LAST: {
            const history: HistoryState = getHistory(getState())
            if (history.list.length > 0)
                api.messages.requestSetLast(true, getLatestFromHistory(history).key)
            break
        }
        case SET_AS_LAST: { api.messages.requestSetLast(false, action.payload.last); break }
        case TIMER_ON: { api.messages.requestTimerOn(); break }
        case TIMER_OFF: { api.messages.requestTimerOff(); break }
        case SEND_WEB_SOCKET_MESSAGE: { api.messages.sendWebSocketMessage(action.payload.type, action.payload.data); break }
        case SET_WEB_SOCKET_URL: { api.messages.setWebSocketUrl(action.payload.url); break }
    }
}

export default [
    requests
]