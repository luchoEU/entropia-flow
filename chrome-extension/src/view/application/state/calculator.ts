interface CalculatorStateIn1 {
    markup: string,
    value: string,
}

interface CalculatorStateIn {
    sweat: string,
    nexus: string,
    diluted: string,
    sweetstuff: string,
    fruit: string,
    me: CalculatorStateIn1,
    lme: CalculatorStateIn1,
    nb: CalculatorStateIn1,
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
    lme: CalculatorStateOut1,
    nb: CalculatorStateOut1,
}

interface CalculatorState {
    in: CalculatorStateIn,
    out: CalculatorStateOut
}

export {
    CalculatorStateIn,
    CalculatorStateIn1,
    CalculatorStateOut,
    CalculatorStateOut1,
    CalculatorState,
}
