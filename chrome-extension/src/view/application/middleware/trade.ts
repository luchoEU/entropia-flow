import { mergeDeep } from "../../../common/merge"
import { setExpanded } from "../actions/expandable"
import { ON_NOTIFICATION_CLICKED } from "../actions/notification"
import { setTabularFilter } from "../actions/tabular"
import { ADD_TRADE_MESSAGE_NOTIFICATION, REMOVE_TRADE_MESSAGE_NOTIFICATION, SET_LAST_TRADE_MESSAGE_CHECK_SERIAL, setTradeState } from "../actions/trade"
import { AppAction } from "../slice/app"
import { scrollValueForExpandable } from "../helpers/expandable"
import { initialState } from "../helpers/trade"
import { getTrade } from "../selectors/trade"
import { GAME_LOG_TABULAR_TRADE } from "../state/log"
import { TabId } from "../state/navigation"
import { TradeState } from "../state/trade"

const NOTIFICATION_ID = "entropiaFlowTrading"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const result = await next(action)
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
        case ON_NOTIFICATION_CLICKED: {
            if (action.payload.notificationId.startsWith(NOTIFICATION_ID) && action.payload.buttonIndex === 0) {
                const filter = action.payload.notificationId.replace(`${NOTIFICATION_ID}-`, '');
                const selector = `TabularSection.${GAME_LOG_TABULAR_TRADE}`;
                dispatch(setExpanded(selector)(true));
                dispatch(setTabularFilter(GAME_LOG_TABULAR_TRADE)(filter));
                window.location.href = `#${TabId.TRADE}?scrollTo=${scrollValueForExpandable(selector)}`;
            }
            break
        }
    }
    return result
}

export default [
    requests
]
