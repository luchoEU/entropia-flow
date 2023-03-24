interface RefinedState {
    map: { [name: string] : RefinedOneState }
}

interface RefinedOneState {
    name: string,
    expanded: boolean,
    calculator: RefinedCalculatorState
}

interface RefinedCalculatorState {
    in: RefinedCalculatorStateIn,
    out: RefinedCalculatorStateOut
}

interface RefinedCalculatorStateIn {
    value: string,
    refinedMaterial: string,
    sourceMaterials: string[]
}

interface RefinedCalculatorStateOut {
    amount: string,
    openingValue: string,
    buyoutValue: string,
    openingFee: string,
    buyoutFee: string,
    profitSale: string
    profitK: string,
    cost: string,
}

export {
    RefinedOneState,
    RefinedState,
    RefinedCalculatorState,
    RefinedCalculatorStateIn,
    RefinedCalculatorStateOut,
}
