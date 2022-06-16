import { CalculatorState, CalculatorStateIn, CalculatorStateOut, CalculatorStateOut1 } from "../state/calculator"

const initialStateIn: CalculatorStateIn = {
    sweat: '1',
    nexus: '102',
    diluted: '101',
    meMarkup: '120',
    meValue: '99',
    mePending: false,
    lmeMarkup: '110',
    lmeValue: '39',
    lmePending: false,
}

const initialState: CalculatorState = {
    in: initialStateIn,
    out: calc(initialStateIn)
}

function auctionFee(difference: number): number {
    return Math.round(50 + difference * 4.9) / 100
}

function calc1(buyoutValue: number, markup: number, nexus: number, kOther: number, kRefined: number): CalculatorStateOut1 {
    const refiner = 0.15
    const pMaterial = 10000 // 1 ped nexus

    const amount = Math.ceil(buyoutValue / (markup + 0.005) * 100 * pMaterial)
    const buyoutFee = auctionFee(buyoutValue - amount / pMaterial)
    const cost = (refiner + kOther + nexus / 10) * pMaterial / kRefined
    const auctionCost = amount * cost / pMaterial + buyoutFee
    const profitSale = buyoutValue - auctionCost
    const profitK = profitSale / (amount / kRefined)
    const openingValue = Math.ceil(buyoutValue - profitSale)
    const openingFee = auctionFee(openingValue - amount / pMaterial)

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
    const meMarkup = Number(state.meMarkup)
    const meValue = Number(state.meValue)
    const lmeMarkup = Number(state.lmeMarkup)
    const lmeValue = Number(state.lmeValue)

    const kMeRefined = 100100 // 10 ped nexus + 1k sweat = 0.01 ped
    const kLmeRefined = 200000 // 10 ped nexus + 1k diluted = 10 ped

    return {
        me: calc1(meValue, meMarkup, nexus, sweat, kMeRefined),
        lme: calc1(lmeValue, lmeMarkup, nexus, diluted / 10, kLmeRefined)
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

function meMarkupChanged(state: CalculatorState, meMarkup: string): CalculatorState {
    const inState = {
        ...state.in,
        meMarkup
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function meValueChanged(state: CalculatorState, meValue: string): CalculatorState {
    const inState = {
        ...state.in,
        meValue
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function lmeMarkupChanged(state: CalculatorState, lmeMarkup: string): CalculatorState {
    const inState = {
        ...state.in,
        lmeMarkup
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function lmeValueChanged(state: CalculatorState, lmeValue: string): CalculatorState {
    const inState = {
        ...state.in,
        lmeValue
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function meSellChange(state: CalculatorState, mePending: boolean): CalculatorState {
    const inState = {
        ...state.in,
        mePending
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

function lmeSellChange(state: CalculatorState, lmePending: boolean): CalculatorState {
    const inState = {
        ...state.in,
        lmePending
    }
    return {
        in: inState,
        out: calc(inState)
    }
}

export {
    initialState,
    setState,
    sweatChanged,
    nexusChanged,
    dilutedChanged,
    meMarkupChanged,
    meValueChanged,
    lmeMarkupChanged,
    lmeValueChanged,
    meSellChange,
    lmeSellChange
}
