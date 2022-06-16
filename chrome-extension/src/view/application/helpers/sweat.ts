import { SweatState, SweatStateIn, SweatStateOut } from "../state/sweat";

const calc = (s: SweatStateIn): SweatStateOut => ({
    value: (Number(s.amount) / 1000 * Number(s.price)).toFixed(2)
})

const initialStateIn: SweatStateIn = {
    price: '1.45',
    amount: '1000',
    pending: false,
}

const initialState: SweatState = {
    in: initialStateIn,
    out: calc(initialStateIn)
}

const setState = (state: SweatState, inState: SweatStateIn): SweatState => ({
    in: inState,
    out: calc(inState)
})

const sweatPriceChanged = (state: SweatState, price: string): SweatState => {
    const inState = {
        ...state.in,
        price
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

const sweatAmountChanged = (state: SweatState, amount: string): SweatState => {
    const inState = {
        ...state.in,
        amount
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

const addSweatChanged = (state: SweatState, pending: boolean): SweatState => {
    const inState = {
        ...state.in,
        pending
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

export {
    initialState,
    setState,
    sweatPriceChanged,
    sweatAmountChanged,
    addSweatChanged,
}
