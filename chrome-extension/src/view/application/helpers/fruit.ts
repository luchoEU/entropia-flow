import { FruitState, FruitStateIn, FruitStateOut } from "../state/fruit";

const calc = (s: FruitStateIn): FruitStateOut => ({
    value: (Number(s.amount) / 1000 * Number(s.price)).toFixed(2)
})

const initialStateIn: FruitStateIn = {
    price: '3',
    amount: '1000',
    pending: false,
}

const initialState: FruitState = {
    in: initialStateIn,
    out: calc(initialStateIn)
}

const setState = (state: FruitState, inState: FruitStateIn): FruitState => ({
    in: inState,
    out: calc(inState)
})

const fruitPriceChanged = (state: FruitState, price: string): FruitState => {
    const inState = {
        ...state.in,
        price
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

const fruitAmountChanged = (state: FruitState, amount: string): FruitState => {
    const inState = {
        ...state.in,
        amount
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

const addFruitChanged = (state: FruitState, pending: boolean): FruitState => {
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
    fruitPriceChanged,
    fruitAmountChanged,
    addFruitChanged,
}
