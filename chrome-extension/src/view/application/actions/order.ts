import { OrderState } from "../state/order"

const SET_ORDER_STATE = "[order] set state"
const ORDER_MARKUP_CHANGED = "[order] markup changed"
const ORDER_VALUE_CHANGED = "[order] value changed"
const ADD_ORDER_TO_SHEET = "[order] add sheet"
const ADD_ORDER_TO_LIST = "[order] add list"

const setOrderState = (state: OrderState) => ({
    type: SET_ORDER_STATE,
    payload: {
        state
    }
})

const markupChanged = (markup: string) => ({
    type: ORDER_MARKUP_CHANGED,
    payload: {
        markup
    }
})

const valueChanged = (value: string) => ({
    type: ORDER_VALUE_CHANGED,
    payload: {
        value
    }
})

const addOrderToSheet = (markup: string, value: string) => ({
    type: ADD_ORDER_TO_SHEET,
    payload: {
        markup,
        value,
    }
})

const addOrderToList = (row: number, markup: string, value: string) => ({
    type: ADD_ORDER_TO_LIST,
    payload: {
        row,
        markup,
        value,
    }
})

export {
    SET_ORDER_STATE,
    ORDER_MARKUP_CHANGED,
    ORDER_VALUE_CHANGED,
    ADD_ORDER_TO_SHEET,
    ADD_ORDER_TO_LIST,
    setOrderState,
    markupChanged,
    valueChanged,
    addOrderToSheet,
    addOrderToList,
}