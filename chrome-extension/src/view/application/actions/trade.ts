import { TradeState } from "../state/trade"

const SET_TRADE_STATE = '[trade] set state'
const ADD_TRADE_MESSAGE_NOTIFICATION = '[trade] add trade message notification'
const REMOVE_TRADE_MESSAGE_NOTIFICATION = '[trade] remove trade message notification'
const SET_LAST_TRADE_MESSAGE_CHECK_TIME = '[trade] set last trade message check time'

const setTradeState = (state: TradeState) => ({
    type: SET_TRADE_STATE,
    payload: {
        state
    }
})

const addTradeMessageNotification = (filter: string) => ({
    type: ADD_TRADE_MESSAGE_NOTIFICATION,
    payload: {
        filter
    }
})

const removeTradeMessageNotification = (time: string) => ({
    type: REMOVE_TRADE_MESSAGE_NOTIFICATION,
    payload: {
        time
    }
})

const setLastTradeMessageCheckTime = (time: number) => ({
    type: SET_LAST_TRADE_MESSAGE_CHECK_TIME,
    payload: {
        time
    }
})

export {
    SET_TRADE_STATE,
    ADD_TRADE_MESSAGE_NOTIFICATION,
    REMOVE_TRADE_MESSAGE_NOTIFICATION,
    SET_LAST_TRADE_MESSAGE_CHECK_TIME,
    setTradeState,
    addTradeMessageNotification,
    removeTradeMessageNotification,
    setLastTradeMessageCheckTime,
}
