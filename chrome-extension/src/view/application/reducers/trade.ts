import { ADD_TRADE_MESSAGE_NOTIFICATION, REMOVE_TRADE_MESSAGE_NOTIFICATION, SET_LAST_TRADE_MESSAGE_CHECK_TIME, SET_TRADE_STATE } from "../actions/trade"
import { initialState, reduceAddTradeMessageNotification, reduceRemoveTradeMessageNotification, reduceSetLastMessageCheckTime, reduceSetTradeState } from "../helpers/trade"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_TRADE_STATE: return reduceSetTradeState(state, action.payload.state)
        case ADD_TRADE_MESSAGE_NOTIFICATION: return reduceAddTradeMessageNotification(state, action.payload.filter)
        case REMOVE_TRADE_MESSAGE_NOTIFICATION: return reduceRemoveTradeMessageNotification(state, action.payload.time)
        case SET_LAST_TRADE_MESSAGE_CHECK_TIME: return reduceSetLastMessageCheckTime(state, action.payload.time)
        default: return state
    }
}
