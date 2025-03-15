import { TradeState } from "../state/trade"

const initialState: TradeState = {
    lastMessageCheckSerial: 0,
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

const reduceSetLastMessageCheckSerial = (state: TradeState, serial: number): TradeState => ({
    ...state,
    lastMessageCheckSerial: serial
})

export {
    initialState,
    reduceSetTradeState,
    reduceAddTradeMessageNotification,
    reduceRemoveTradeMessageNotification,
    reduceSetLastMessageCheckSerial,
}
