import { CalculatorState, CalculatorStateIn, CalculatorStateOut, CalculatorStateOut1 } from "../state/calculator"

const initialStateIn: CalculatorStateIn = {
    sweat: '1',
    nexus: '102',
    diluted: '101',
    sweetstuff: '110',
    fruit: '3',
    me: {
        markup: '120',
        value: '99',
    },
    lme: {
        markup: '110',
        value: '39',
    },
    nb: {
        markup: '145',
        value: '49',
    }
}

const initialState: CalculatorState = {
    in: initialStateIn,
    out: calc(initialStateIn)
}

function auctionFee(difference: number): number {
    return Math.round(50 + difference * 4.9) / 100
}

function calc1(buyoutValue: number, markup: number, nexus: number, kOther: number, kRefined: number, pedMaterial: number): CalculatorStateOut1 {
    const refiner = 0.15

    const amount = Math.ceil(buyoutValue / (markup + 0.005) * 100 * pedMaterial)
    const buyoutFee = auctionFee(buyoutValue - amount / pedMaterial)
    const cost = (refiner + kOther + nexus / 10) * pedMaterial / kRefined
    const auctionCost = amount * cost / pedMaterial + buyoutFee
    const profitSale = buyoutValue - auctionCost
    const profitK = profitSale / (amount / kRefined)
    const openingValue = Math.ceil(buyoutValue - profitSale)
    const openingFee = auctionFee(openingValue - amount / pedMaterial)

    return {
        amount: amount.toString(),
        openingValue: openingValue.toString(),
        buyoutValue: buyoutValue.toString(),
        openingFee: openingFee.toFixed(2),
        buyoutFee: buyoutFee.toFixed(2),
        profitSale: profitSale.toFixed(2),
        profitK: `${profitK.toFixed(3)}  ${(profitK * 10).toFixed(2)}%`,
        cost: (cost * 100).toFixed(2) + '%'
    }
}

function calc(state: CalculatorStateIn): CalculatorStateOut {
    const sweat = Number(state.sweat)
    const nexus = Number(state.nexus)
    const diluted = Number(state.diluted)
    const sweetstuff = Number(state.sweetstuff)
    const fruit = Number(state.fruit)
    const meMarkup = Number(state.me.markup)
    const meValue = Number(state.me.value)
    const lmeMarkup = Number(state.lme.markup)
    const lmeValue = Number(state.lme.value)
    const nbMarkup = Number(state.nb.markup)
    const nbValue = Number(state.nb.value)

    const kMeRefined = 100100 // 10 ped nexus + 1k sweat = 0.01 ped
    const kLmeRefined = 200000 // 10 ped nexus + 1k diluted = 10 ped
    const kNbRefined = 1001 // 10 ped sweetstuff + 1k fruit = 0.01 ped

    return {
        me: calc1(meValue, meMarkup, nexus, sweat, kMeRefined, 10000),
        lme: calc1(lmeValue, lmeMarkup, nexus, diluted / 10, kLmeRefined, 10000),
        nb: calc1(nbValue, nbMarkup, sweetstuff, fruit, kNbRefined, 100),
    }
}

function setState(state: CalculatorState, inState: CalculatorStateIn): CalculatorState {
    return {
        in: inState,
        out: calc(inState)
    }
}

function sweatChanged(state: CalculatorState, price: string): CalculatorState {
    const inState = {
        ...state.in,
        sweat: price
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function fruitChanged(state: CalculatorState, price: string): CalculatorState {
    const inState = {
        ...state.in,
        fruit: price
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function nexusChanged(state: CalculatorState, price: string): CalculatorState {
    const inState = {
        ...state.in,
        nexus: price
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function dilutedChanged(state: CalculatorState, price: string): CalculatorState {
    const inState = {
        ...state.in,
        diluted: price
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function sweetstuffChanged(state: CalculatorState, price: string): CalculatorState {
    const inState = {
        ...state.in,
        sweetstuff: price
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function meMarkupChanged(state: CalculatorState, markup: string): CalculatorState {
    const inState = {
        ...state.in,
        me: {
            ...state.in.me,
            markup
        }
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function meValueChanged(state: CalculatorState, value: string): CalculatorState {
    const inState = {
        ...state.in,
        me: {
            ...state.in.me,
            value
        }
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function lmeMarkupChanged(state: CalculatorState, markup: string): CalculatorState {
    const inState = {
        ...state.in,
        lme: {
            ...state.in.lme,
            markup
        }
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function lmeValueChanged(state: CalculatorState, value: string): CalculatorState {
    const inState = {
        ...state.in,
        lme: {
            ...state.in.lme,
            value
        }
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function nbMarkupChanged(state: CalculatorState, markup: string): CalculatorState {
    const inState = {
        ...state.in,
        nb: {
            ...state.in.nb,
            markup
        }
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function nbValueChanged(state: CalculatorState, value: string): CalculatorState {
    const inState = {
        ...state.in,
        nb: {
            ...state.in.nb,
            value
        }
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

export {
    initialState,
    initialStateIn,
    setState,
    sweatChanged,
    fruitChanged,
    nexusChanged,
    dilutedChanged,
    sweetstuffChanged,
    meMarkupChanged,
    meValueChanged,
    lmeMarkupChanged,
    lmeValueChanged,
    nbMarkupChanged,
    nbValueChanged,
}
