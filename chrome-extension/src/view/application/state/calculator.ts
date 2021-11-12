interface CalculatorStateIn {
    sweat: string,
    nexus: string,
    diluted: string,
    meMarkup: string,
    meValue: string,
    lmeMarkup: string,
    lmeValue: string,
}

interface CalculatorStateOut1 {
    amount: string,
    openingValue: string,
    buyoutValue: string,
    openingFee: string,
    buyoutFee: string,
    profitSale: string
    profitK: string,
    cost: string,
}

interface CalculatorStateOut {
    me: CalculatorStateOut1,
    lme: CalculatorStateOut1
}

interface CalculatorState {
    in: CalculatorStateIn,
    out: CalculatorStateOut
}

export {
    CalculatorStateIn,
    CalculatorStateOut,
    CalculatorStateOut1,
    CalculatorState,
}