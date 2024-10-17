import { objectMap } from "../../../common/object"
import { BudgetInfoData } from "../../services/api/sheets/sheetsBudget"
import { getMaterial } from "../selectors/materials"
import { getOneRefined } from "../selectors/refined"
import { MaterialsMap } from "../state/materials"
import { RefinedCalculatorStateIn, RefinedCalculatorStateOut, RefinedOneState, RefinedRefine, RefinedState } from "../state/refined"
import { MATERIAL_DW, MATERIAL_FT, MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_NX, MATERIAL_PED, MATERIAL_ST, MATERIAL_SW, refinedInitialMap, UNIT_PED_K, UNIT_PERCENTAGE } from "./materials"

const initialStateIn: { [n: string]: RefinedCalculatorStateIn } = {
    [MATERIAL_ME]: {
        value: '120',
        refinedMaterial: MATERIAL_ME,
        sourceMaterials: [ MATERIAL_NX, MATERIAL_SW
        ]
    },
    [MATERIAL_LME]: {
        value: '49',
        refinedMaterial: MATERIAL_LME,
        sourceMaterials: [ MATERIAL_NX, MATERIAL_DW
        ]
    },
    [MATERIAL_NB]: {
        value: '49',
        refinedMaterial: MATERIAL_NB,
        sourceMaterials: [ MATERIAL_ST, MATERIAL_FT ]
    },
}

const initialStateRefined: { [n: string]: RefinedRefine[] } = {
    [MATERIAL_ME]: [
        {
            name: MATERIAL_PED,
            mult: -0.00015
        },
        {
            name: MATERIAL_ME,
            mult: 100.1
        },
        {
            name: MATERIAL_NX,
            mult: -1
        },
        {
            name: MATERIAL_SW,
            mult: -1
        }
    ],
    [MATERIAL_LME]: [
        {
            name: MATERIAL_PED,
            mult: -0.00015
        },
        {
            name: MATERIAL_LME,
            mult: 200
        },
        {
            name: MATERIAL_NX,
            mult: -1
        },
        {
            name: MATERIAL_DW,
            mult: -1
        }
    ],
    [MATERIAL_NB]: [
        {
            name: MATERIAL_PED,
            mult: -0.00015
        },
        {
            name: MATERIAL_NB,
            mult: 1.001
        },
        {
            name: MATERIAL_ST,
            mult: -1
        },
        {
            name: MATERIAL_FT,
            mult: -1
        }
    ]
}

const initialState: RefinedState = ({
    map: objectMap(initialStateIn, st => ({
        name: st.refinedMaterial,
        expanded: true,
        calculator: {
            in: st,
            out: calc(st, refinedInitialMap)
        },
        refine: initialStateRefined[st.refinedMaterial]
    }))
})

function calc(state: RefinedCalculatorStateIn, m: MaterialsMap): RefinedCalculatorStateOut {
    const auctionFee = (difference: number): number => Math.round(50 + difference * 4.9) / 100
    const unitMult = (unit: string): number => {
        switch (unit) {
            case UNIT_PED_K:
                return 100
            case UNIT_PERCENTAGE:
                return 0.01
        }
    }

    const refiner = 0.15 // PED for 1k refined

    const buyoutValue = Number(state.value) //120
    const markup = Number(m[state.refinedMaterial].buyMarkup) //119.99
    const pedMaterial = 1000 / m[state.refinedMaterial].c.kValue // 10000
    const costMaterials = state.sourceMaterials.reduce((acc, name) => acc + Number(m[name].buyMarkup) * m[name].c.kValue * unitMult(m[name].c.unit), 0) // 11.493
    const kRefined = state.sourceMaterials.reduce((acc, name) => acc + m[name].c.kValue, 0) / m[state.refinedMaterial].c.kValue * 1000 // 100100

    const amount = Math.ceil(buyoutValue / (markup + 0.005) * 100 * pedMaterial) // 100042
    const buyoutFee = auctionFee(buyoutValue - amount / pedMaterial) // 1.48
    const cost = (refiner + costMaterials) * pedMaterial / kRefined // 1.6331..
    const auctionCost = amount * cost / pedMaterial + buyoutFee // 117.7985..
    const profitSale = buyoutValue - auctionCost // 2.2014
    const profitK = profitSale / (amount / kRefined) // 0.2203
    const openingValue = Math.ceil(buyoutValue - profitSale) // 118
    const openingFee = auctionFee(openingValue - amount / pedMaterial) // 1.38

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

const changeMaterial = (state: RefinedState, material: string, change: any): RefinedState => {
    const inState = JSON.parse(JSON.stringify(state))
    inState.map[material] = {
        ...inState.map[material],
        ...change
    }
    return inState
}

const changeCalculator = (state: RefinedState, material: string, change: any, m: MaterialsMap): RefinedState => {
    const inState = JSON.parse(JSON.stringify(state))
    const inCalcState = {
        ...inState.map[material].calculator.in,
        ...change
    }
    inState.map[material].calculator = {
        in: inCalcState,
        out: calc(inCalcState, m)
    }
    return inState
}

const setRefinedExpanded = (state: RefinedState, material: string, expanded: boolean): RefinedState =>
    changeMaterial(state, material, { expanded })

const refinedValueChanged = (state: RefinedState, material: string, value: string, m: MaterialsMap): RefinedState =>
    changeCalculator(state, material, { value }, m)

const refinedMarkupChanged = (state: RefinedState, material: string, markup: string, m: MaterialsMap): RefinedState =>
    changeCalculator(state, material, { markup }, m)

const refinedMaterialChanged = (state: RefinedState, m: MaterialsMap): RefinedState => {
    const inState = JSON.parse(JSON.stringify(state))
    Object.keys(inState.map).forEach(k => inState.map[k].calculator.out = calc(inState.map[k].calculator.in, m))
    return inState
}

const cleanForSave = (state: RefinedState): RefinedState => {
    const cState = JSON.parse(JSON.stringify(state))
    Object.keys(cState.map).forEach(k => cState.map[k].calculator.out = undefined)
    return cState
}

function budgetGetCreateParams(state: any, material: string): any[] {
    const oneState: RefinedOneState = getOneRefined(material)(state)
    const calc = oneState.calculator.in
    const info: BudgetInfoData = {
        itemName: material,
        materials: [ calc.refinedMaterial, ...calc.sourceMaterials ].map(m => ({
            name: m,
            unitValue: getMaterial(m)(state).c.kValue / 1000
        }))
    }
    return [ info, true ]
}

export {
    initialState,
    setState,
    setRefinedExpanded,
    refinedValueChanged,
    refinedMarkupChanged,
    refinedMaterialChanged,
    cleanForSave,
    budgetGetCreateParams,
}
