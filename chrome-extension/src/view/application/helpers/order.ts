import { OrderState } from "../state/order";

const initialState: OrderState = {
    markup: '102',
    value: '2000',
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

export {
    initialState,
    setState,
    markupChanged,
    valueChanged,
}