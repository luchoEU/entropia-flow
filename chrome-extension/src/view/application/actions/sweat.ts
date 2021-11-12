import { SweatStateIn } from "../state/sweat"

const SET_SWEAT_STATE = "[sweat] set state"
const SWEAT_PRICE_CHANGED = "[sweat] price changed"
const SWEAT_AMOUNT_CHANGED = "[sweat] amount changed"
const ADD_SWEAT_TO_SHEET = "[sweat] add sheet"

const setSweatState = (state: SweatStateIn) => ({
    type: SET_SWEAT_STATE,
    payload: {
        state
    }
})

const sweatPriceChanged = (price: string) => ({
    type: SWEAT_PRICE_CHANGED,
    payload: {
        price
    }
})

const sweatAmountChanged = (amount: string) => ({
    type: SWEAT_AMOUNT_CHANGED,
    payload: {
        amount
    }
})

const addSweatToSheet = (price: string, amount: string) => ({
    type: ADD_SWEAT_TO_SHEET,
    payload: {
        price,
        amount,
    }
})

export {
    SET_SWEAT_STATE,
    SWEAT_PRICE_CHANGED,
    SWEAT_AMOUNT_CHANGED,
    ADD_SWEAT_TO_SHEET,
    setSweatState,
    sweatPriceChanged,
    sweatAmountChanged,
    addSweatToSheet,
}