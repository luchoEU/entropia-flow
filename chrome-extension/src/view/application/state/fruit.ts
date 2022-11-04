interface FruitStateIn {
    price: string,
    amount: string,
    pending: boolean
}

interface FruitStateOut {
    value: string
}

interface FruitState {
    in: FruitStateIn,
    out: FruitStateOut
}

export {
    FruitState,
    FruitStateIn,
    FruitStateOut
}