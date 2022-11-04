import { FruitStateIn } from "../state/fruit"

const SET_FRUIT_STATE = "[fruit] set state"
const FRUIT_PRICE_CHANGED = "[fruit] price changed"
const FRUIT_AMOUNT_CHANGED = "[fruit] amount changed"
const ADD_FRUIT_TO_SHEET = "[fruit] add sheet"
const ADD_FRUIT_TO_SHEET_DONE = "[fruit] add sheet done"

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

const addFruitToSheet = (price: string, amount: string) => ({
    type: ADD_FRUIT_TO_SHEET,
    payload: {
        price,
        amount,
    }
})

const addFruitToSheetDone = {
    type: ADD_FRUIT_TO_SHEET_DONE
}

export {
    SET_FRUIT_STATE,
    FRUIT_PRICE_CHANGED,
    FRUIT_AMOUNT_CHANGED,
    ADD_FRUIT_TO_SHEET,
    ADD_FRUIT_TO_SHEET_DONE,
    setFruitState,
    fruitPriceChanged,
    fruitAmountChanged,
    addFruitToSheet,
    addFruitToSheetDone,
}
