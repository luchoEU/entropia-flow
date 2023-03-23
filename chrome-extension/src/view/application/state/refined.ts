interface RefinedOneState {
    expanded: boolean,
    calculator: RefinedCalculatorState
}

interface RefinedState {
    me: RefinedOneState,
    lme: RefinedOneState,
    nb: RefinedOneState,
}

interface RefinedCalculatorState {
    in: RefinedCalculatorStateIn,
    out: RefinedCalculatorStateOut
}

interface RefinedCalculatorStateIn {
    markup: string,
    value: string,
    markupMaterial1: string, // markup of nexus or sweetstuff
    markupMaterial2: string, // markup of sweat, diluted, fruit
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
