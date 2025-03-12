import { TradeState } from "../state/trade"

const initialState: TradeState = {
    lastMessageCheckTime: 0,
    notifications: []
}

const reduceSetTradeState = (state: TradeState, newState: TradeState): TradeState => newState

const reduceAddTradeMessageNotification = (state: TradeState, filter: string): TradeState => ({
    ...state,
    notifications: [ ...state.notifications, { time: new Date().toString(), filter } ]
})

const reduceRemoveTradeMessageNotification = (state: TradeState, time: string): TradeState => ({
    ...state,
    notifications: state.notifications.filter(n => n.time !== time)
})

const reduceSetLastMessageCheckTime = (state: TradeState, time: number): TradeState => ({
    ...state,
    lastMessageCheckTime: time
})

export {
    initialState,
    reduceSetTradeState,
    reduceAddTradeMessageNotification,
    reduceRemoveTradeMessageNotification,
    reduceSetLastMessageCheckTime,
}
