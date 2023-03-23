import { RefinedCalculatorState, RefinedCalculatorStateIn, RefinedCalculatorStateOut, RefinedState } from "../state/refined"

const refinedTitle = {
    me: 'Mind Essence',
    lme: 'Light Mind Essence',
    nb: 'Nutrio Bar',
}

const initialStateIn: { [v: string]: RefinedCalculatorStateIn } = {
    me: {
        markup: '120',
        value: '120',
        markupMaterial1: '101', // nexus
        markupMaterial2: '135000' // sweat
    },
    lme: {
        markup: '110',
        value: '49',
        markupMaterial1: '101', // nexus
        markupMaterial2: '102', // diluted
    },
    nb: {
        markup: '150',
        value: '49',
        markupMaterial1: '110', // sweetstuff
        markupMaterial2: '280000', // fruit
    } 
}

const initialState: RefinedState = {
    me: {
        expanded: true,
        calculator: initialCalc('me')
    },
    lme: {
        expanded: true,
        calculator: initialCalc('lme')
    },
    nb: {
        expanded: true,
        calculator: initialCalc('nb')
    }
}

const calcConst: { [v: string]: RefinedCalculatorConst } = {
    me: {
        kValueMaterial1: 10, // nexus
        kValueMaterial2: 0.01, // sweat
        kValueRefined: 0.1, // mind essence
        kRefined: 100100
    },
    lme: {
        kValueMaterial1: 10, // nexus
        kValueMaterial2: 10, // diluted
        kValueRefined: 0.1, // light mind essence
        kRefined: 200000
    },
    nb: {
        kValueMaterial1: 10, // sweetstuff
        kValueMaterial2: 0.01, // fuit
        kValueRefined: 10, // nutrio bar
        kRefined: 1001
    }
}

function initialCalc(material: string): RefinedCalculatorState {
    return {
       in: initialStateIn[material],
        out: calc(initialStateIn[material], calcConst[material])
    }
}

interface RefinedCalculatorConst {
    kValueMaterial1: number // value in PED of 1k
    kValueMaterial2: number // value in PED of 1k
    kValueRefined: number // value in PED of 1k
    kRefined: number // ammout received for 1k+1k of input materials
}

function auctionFee(difference: number): number {
    return Math.round(50 + difference * 4.9) / 100
}

function calc(state: RefinedCalculatorStateIn, c: RefinedCalculatorConst): RefinedCalculatorStateOut {
    const refiner = 0.15 // PED for 1k refined

    const buyoutValue = Number(state.value)
    const markup = Number(state.markup)
    const markupMaterial1 = Number(state.markupMaterial1)
    const markupMaterial2 = Number(state.markupMaterial2)
    const pedMaterial = 1000 / c.kValueRefined

    const amount = Math.ceil(buyoutValue / (markup + 0.005) * 100 * pedMaterial)
    const buyoutFee = auctionFee(buyoutValue - amount / pedMaterial)
    const costMaterials = markupMaterial1 * c.kValueMaterial1 + markupMaterial2 * c.kValueMaterial2 * c.kValueMaterial2
    const cost = (refiner + costMaterials) * pedMaterial / c.kRefined
    const auctionCost = amount * cost / pedMaterial + buyoutFee
    const profitSale = buyoutValue - auctionCost
    const profitK = profitSale / (amount / c.kRefined)
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

const setState = (state: RefinedState, inState: RefinedState): RefinedState => inState

const setRefinedExpanded = (state: RefinedState, material: string, expanded: boolean): RefinedState => {
    const inState = { ...state }
    inState[material] = {
        ...inState[material],
        expanded
    }
    return inState
}

const refinedValueChanged = (state: RefinedState, material: string, value: string): RefinedState => {
    const inState = { ...state }
    inState[material].calculator.in = {
        ...inState[material].calculator.in,
        value
    }
    return inState
}

const refinedMarkupChanged = (state: RefinedState, material: string, markup: string): RefinedState => {
    const inState = { ...state }
    inState[material].calculator.in = {
        ...inState[material].calculator.in,
        markup
    }
    return inState
}

const refinedSell = (state: RefinedState, material: string): RefinedState => {
    const inState = { ...state }
    inState[material] = {
        ...inState[material]
    }
    return inState
}

const cleanForSave = (state: RefinedState): RefinedState => {
    const inState = { ...state }
    inState.me.calculator.out = undefined
    inState.lme.calculator.out = undefined
    inState.nb.calculator.out = undefined
    return inState
}

export {
    refinedTitle,
    initialState,
    setState,
    setRefinedExpanded,
    refinedValueChanged,
    refinedMarkupChanged,
    refinedSell,
    cleanForSave,
}
