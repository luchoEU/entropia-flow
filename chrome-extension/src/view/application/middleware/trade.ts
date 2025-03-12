import { GameLogData } from "../../../background/client/gameLogData"
import { gameTime } from "../../../common/date"
import { mergeDeep } from "../../../common/merge"
import { SET_CURRENT_GAME_LOG } from "../actions/log"
import { selectMenu, TRADE_PAGE } from "../actions/menu"
import { ON_NOTIFICATION_CLICKED } from "../actions/notification"
import { ADD_TRADE_MESSAGE_NOTIFICATION, REMOVE_TRADE_MESSAGE_NOTIFICATION, SET_LAST_TRADE_MESSAGE_CHECK_TIME, setLastTradeMessageCheckTime, setTradeState } from "../actions/trade"
import { PAGE_LOADED } from "../actions/ui"
import { itemMatchesFilter } from "../helpers/tabular"
import { initialState } from "../helpers/trade"
import { getTrade } from "../selectors/trade"
import { GAME_LOG_TABULAR_TRADE } from "../state/log"
import { TradeState } from "../state/trade"

const NOTIFICATION_ID = "entropiaFlowTrading"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: TradeState = await api.storage.loadTrade();
            if (state)
                dispatch(setTradeState(mergeDeep(initialState, state)));
            break
        }
        case ADD_TRADE_MESSAGE_NOTIFICATION:
        case REMOVE_TRADE_MESSAGE_NOTIFICATION:
        case SET_LAST_TRADE_MESSAGE_CHECK_TIME: {
            const state: TradeState = getTrade(getState())
            await api.storage.saveTrade(state)
            break
        }
        case SET_CURRENT_GAME_LOG: {
            const state: TradeState = getTrade(getState())
            const gameLog: GameLogData = action.payload.gameLog
            if (gameLog.trade.length === 0 || state.notifications.length == 0)
                break

            for (const t of gameLog.trade) {
                if (gameTime(t.time) < state.lastMessageCheckTime)
                    break

                const matches = state.notifications.filter(n => itemMatchesFilter(t, GAME_LOG_TABULAR_TRADE, n.filter)).map(n => n.filter)
                if (matches.length > 0) {
                    matches.unshift('New matches to trade chat filters')
                    chrome.notifications.create(
                        NOTIFICATION_ID,
                        { type: "basic", iconUrl: "img/flow128.png", title: "Entropia Flow", message: matches.join('\n') }
                    )
                }
            }

            dispatch(setLastTradeMessageCheckTime(gameTime(gameLog.trade[0].time)))
            break;
        }
        case ON_NOTIFICATION_CLICKED: {
            if (action.payload.notificationId === NOTIFICATION_ID) {
                dispatch(selectMenu(TRADE_PAGE));
            }
            break
        }
    }
}

export default [
    requests
]
