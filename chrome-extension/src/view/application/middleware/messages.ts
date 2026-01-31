import { ViewBlueprintList, ViewDispatch, ViewNotification, ViewState } from '../../../common/state'
import { setConnectionStatus, webSocketStateChanged } from '../actions/connection'
import { setCurrentInventory } from '../actions/inventory'
import { REFRESH, TIMER_OFF, TIMER_ON, SET_WEB_SOCKET_URL, COPY_LAST, RETRY_WEB_SOCKET } from '../actions/messages'
import { onNotificationClicked } from '../actions/notification'
import { setStatus } from '../actions/status'
import { executeStreamClickAction } from '../actions/stream.click'
import { AppAction } from '../slice/app'
import { AppDispatch } from '../store'
import { setBlueprintList } from '../actions/craft'
import { SET_STREAM_SHOWING_LAYOUT_ID, setStreamData, setStreamVariables } from '../actions/stream'
import { Feature, isFeatureEnabled } from '../state/settings'
import { getSettings } from '../selectors/settings'
import { getDefaultStore } from 'jotai'
import { createNewSessionAtom } from '../atoms/activity'
import { setLastTimestampAtom, lastComputedAtom } from '../atoms/last'
import { inventoryListAtom } from '../atoms/history'
import { processGameLogAtom } from '../atoms/gameLog'

const refreshViewHandler = (m: ViewState): any[] => {
    const actions: any[] = [];
    if (m.list) {
        m.list.reverse() // newer first
        // Update Jotai atoms
        getDefaultStore().set(inventoryListAtom, m.list)
        if (m.last) {
            getDefaultStore().set(setLastTimestampAtom, m.last)
        }
        else if (m.list.length > 0 && m.list[0].log === undefined)
            getDefaultStore().set(createNewSessionAtom)
        const newest = m.list.find(e => e.log === undefined && e.itemlist !== undefined)
        if (newest !== undefined)
            actions.push(setCurrentInventory(newest))
    }
    if (m.status)
        actions.push(setStatus(m.status))
    if (m.gameLog) {
        getDefaultStore().set(processGameLogAtom, m.gameLog)
    }
    if (m.clientState) {
        actions.push(webSocketStateChanged(m.clientState.code))
        actions.push(setConnectionStatus(m.clientState.message + (m.clientVersion ? ` (version ${m.clientVersion})` : '')))
    }
    if (m.streamVariables) {
        actions.push(setStreamVariables(m.streamVariables))
    }
    if (m.streamData) {
        actions.push(setStreamData(m.streamData))
    }
    return actions;
}

const actionViewHandler = () => async (m: ViewDispatch) => {
    executeStreamClickAction(m.action);
}

const notificationViewHandler = (dispatch: AppDispatch) => async (m: ViewNotification) => {
    dispatch(onNotificationClicked(m.notificationId, m.buttonIndex));
}

const blueprintListHandler = (dispatch: AppDispatch) => async (m: ViewBlueprintList) => {
    dispatch(setBlueprintList(m.blueprints));
}

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            await new Promise<void>(resolve => {
                setTimeout(resolve, 2000) // wait for background service worker to respond
                api.messages.initMessageClient(async (m: ViewState) => {
                    const actions = refreshViewHandler(m);
                    for (const action of actions) {
                        await Promise.resolve(dispatch(action));
                    }
                    resolve();
                }, actionViewHandler(), notificationViewHandler(dispatch), blueprintListHandler(dispatch))
            })
            break
        }
        case REFRESH: {
            /* Commented because it doesn't seem to be an issue anymore (January 2026) */
            //const history: HistoryState = getHistory(getState())
            //const forced = history.list.length > 0 && history.list[0].text.endsWith(STRING_WAIT_3_MINUTES)
            api.messages.requestRefresh(true);
            break
        }
        case COPY_LAST: {
            const computed = getDefaultStore().get(lastComputedAtom)
            if (computed.diff) {
                const settings = getSettings(getState())
                const useComma = isFeatureEnabled(settings, Feature.commaDecimalSeparator);
                const text = computed.diff.map((d: any) => `${d.n}\t${d.q}\t${useComma ? d.v.replace('.', ',') : d.v}`).join('\n')
                navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy text: ', err));
            }
            break
        }
        case TIMER_ON: { api.messages.requestTimerOn(); break }
        case TIMER_OFF: { api.messages.requestTimerOff(); break }
        case SET_STREAM_SHOWING_LAYOUT_ID: { api.messages.setShowingLayoutId(action.payload.layoutId); break }
        case SET_WEB_SOCKET_URL: { api.messages.setWebSocketUrl(action.payload.url); break }
        case RETRY_WEB_SOCKET: { api.messages.retryWebSocket(); break }
    }
}

export default [
    requests
]
