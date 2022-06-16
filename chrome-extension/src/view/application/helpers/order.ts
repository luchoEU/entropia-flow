import { OrderState } from "../state/order";

const initialState: OrderState = {
    markup: '102',
    value: '2000',
    pending: false,
}

const setState = (state: OrderState, newState: OrderState): OrderState => newState

const markupChanged = (state: OrderState, markup: string): OrderState => ({
    ...state,
    markup
})

const valueChanged = (state: OrderState, value: string): OrderState => ({
    ...state,
    value
})

const addOrderChanged = (state: OrderState, pending: boolean): OrderState => ({
    ...state,
    pending
})

export {
    initialState,
    setState,
    markupChanged,
    valueChanged,
    addOrderChanged
}
