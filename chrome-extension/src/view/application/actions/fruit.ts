import { FruitStateIn } from "../state/fruit"

const SET_FRUIT_STATE = "[fruit] set state"
const FRUIT_PRICE_CHANGED = "[fruit] price changed"
const FRUIT_AMOUNT_CHANGED = "[fruit] amount changed"

const setFruitState = (state: FruitStateIn) => ({
    type: SET_FRUIT_STATE,
    payload: {
        state
    }
})

const fruitPriceChanged = (price: string) => ({
    type: FRUIT_PRICE_CHANGED,
    payload: {
        price
    }
})

const fruitAmountChanged = (amount: string) => ({
    type: FRUIT_AMOUNT_CHANGED,
    payload: {
        amount
    }
})

export {
    SET_FRUIT_STATE,
    FRUIT_PRICE_CHANGED,
    FRUIT_AMOUNT_CHANGED,
    setFruitState,
    fruitPriceChanged,
    fruitAmountChanged,
}
