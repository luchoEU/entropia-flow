interface FruitStateIn {
    price: string,
    amount: string,
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