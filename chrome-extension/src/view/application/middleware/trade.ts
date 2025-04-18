import { GameLogData } from "../../../background/client/gameLogData"
import { mergeDeep } from "../../../common/merge"
import { setExpanded } from "../actions/expandable"
import { SET_CURRENT_GAME_LOG } from "../actions/log"
import { ON_NOTIFICATION_CLICKED } from "../actions/notification"
import { setTabularFilter } from "../actions/tabular"
import { ADD_TRADE_MESSAGE_NOTIFICATION, REMOVE_TRADE_MESSAGE_NOTIFICATION, SET_LAST_TRADE_MESSAGE_CHECK_SERIAL, setLastTradeMessageCheckSerial, setTradeState } from "../actions/trade"
import { AppAction } from "../slice/app"
import { scrollValueForExpandable } from "../helpers/expandable"
import { itemMatchesFilter } from "../helpers/tabular"
import { initialState } from "../helpers/trade"
import { getTrade } from "../selectors/trade"
import { GAME_LOG_TABULAR_TRADE } from "../state/log"
import { TabId } from "../state/navigation"
import { TradeState } from "../state/trade"

const NOTIFICATION_ID = "entropiaFlowTrading"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: TradeState = await api.storage.loadTrade();
            if (state)
                dispatch(setTradeState(mergeDeep(initialState, state)));
            break
        }
        case ADD_TRADE_MESSAGE_NOTIFICATION:
        case REMOVE_TRADE_MESSAGE_NOTIFICATION:
        case SET_LAST_TRADE_MESSAGE_CHECK_SERIAL: {
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
                if (t.serial <= state.lastMessageCheckSerial)
                    break

                const matches = state.notifications.filter(n => itemMatchesFilter(t, GAME_LOG_TABULAR_TRADE, n.filter)).map(n => n.filter)
                if (matches.length > 0) {
                    matches.unshift('New matches to trade chat filters')
                    chrome.notifications.create(
                        `${NOTIFICATION_ID}-${matches[1]}`,
                        {
                            type: "basic",
                            iconUrl: "img/flow128.png",
                            title: "Entropia Flow",
                            message: matches.join('\n')
                        }
                    )
                }
            }

            dispatch(setLastTradeMessageCheckSerial(gameLog.trade[0].serial))
            break;
        }
        case ON_NOTIFICATION_CLICKED: {
            if (action.payload.notificationId.startsWith(NOTIFICATION_ID)) {
                const filter = action.payload.notificationId.replace(`${NOTIFICATION_ID}-`, '');
                const selector = `TabularSection.${GAME_LOG_TABULAR_TRADE}`;
                dispatch(setExpanded(selector)(true));
                dispatch(setTabularFilter(GAME_LOG_TABULAR_TRADE)(filter));
                window.location.href = `#${TabId.TRADE}?scrollTo=${scrollValueForExpandable(selector)}`;
            }
            break
        }
    }
}

export default [
    requests
]
