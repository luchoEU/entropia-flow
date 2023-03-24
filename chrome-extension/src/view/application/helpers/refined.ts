import { objectMap } from "../../../common/utils"
import { MaterialsState } from "../state/materials"
import { RefinedCalculatorStateIn, RefinedCalculatorStateOut, RefinedState } from "../state/refined"
import { MATERIAL_DW, MATERIAL_FT, MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_NX, MATERIAL_ST, MATERIAL_SW, refinedInitialMap } from "./materials"

const refinedTitle = {
    me: 'Mind Essence',
    lme: 'Light Mind Essence',
    nb: 'Nutrio Bar',
}

const initialStateIn: RefinedCalculatorStateIn[] = [
    {
        value: '120',
        refinedMaterial: MATERIAL_ME,
        sourceMaterials: [ MATERIAL_NX, MATERIAL_SW ]
    },
    {
        value: '49',
        refinedMaterial: MATERIAL_LME,
        sourceMaterials: [ MATERIAL_NX, MATERIAL_DW ]
    },
    {
        value: '49',
        refinedMaterial: MATERIAL_NB,
        sourceMaterials: [ MATERIAL_ST, MATERIAL_FT ]
    }, 
]

/*
interface RefinedCalculatorConst {
    kValueMaterial1: number // value in PED of 1k
    kValueMaterial2: number // value in PED of 1k
    kValueRefined: number // value in PED of 1k
    kRefined: number // ammout received for 1k+1k of input materials
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
*/

const initialState: RefinedState = ({
    map: objectMap(refinedInitialMap, st => ({
        name: st.refinedMaterial,
        expanded: true,
        calculator: {
            in: st,
            out: calc(st, { map: refinedInitialMap })
        }
    }))
})

function auctionFee(difference: number): number {
    return Math.round(50 + difference * 4.9) / 100
}

function calc(state: RefinedCalculatorStateIn, m: MaterialsState): RefinedCalculatorStateOut {
    const refiner = 0.15 // PED for 1k refined

    const buyoutValue = Number(state.value)
    const markup = Number(m[state.refinedMaterial].markup)
    const pedMaterial = 1000 / m[state.refinedMaterial].kValue
    const costMaterials = state.sourceMaterials.reduce((acc, name) => acc + Number(m[name].markup) * m[name].kValue, 0)
    const kRefined = state.sourceMaterials.reduce((acc, name) => acc + m[name].kValue, 0) / m[state.refinedMaterial].kValue

    const amount = Math.ceil(buyoutValue / (markup + 0.005) * 100 * pedMaterial)
    const buyoutFee = auctionFee(buyoutValue - amount / pedMaterial)
    const cost = (refiner + costMaterials) * pedMaterial / kRefined
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
    Object.keys(inState.map).forEach(k => inState.map[k].calculator.out = undefined)
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
