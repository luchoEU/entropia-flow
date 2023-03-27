import { MaterialsMap, MaterialsState, MaterialState } from "../state/materials"

const MATERIAL_ME = 'Mind Essence'
const MATERIAL_LME = 'Light Mind Essence'
const MATERIAL_NB = 'Nutrio Bar'
const MATERIAL_NX = 'Force Nexus'
const MATERIAL_SW = 'Vibrant Sweat'
const MATERIAL_DW = 'Diluted Sweat'
const MATERIAL_ST = 'Sweetstuff'
const MATERIAL_FT = 'Fruit'

const UNIT_PERCENTAGE = '%'
const UNIT_PED_K = 'PED/k'

const refinedInitialMap: MaterialsMap = {
    [MATERIAL_ME]: {
        markup: '120',
        buyAmount: '100000',
        c: {
            name: MATERIAL_ME,        
            unit: UNIT_PERCENTAGE,
            kValue: 0.1,
        }
    },
    [MATERIAL_LME]: {
        markup: '110',
        buyAmount: '100000',
        c: {
            name: MATERIAL_LME,
            unit: UNIT_PERCENTAGE,
            kValue: 0.1,
        }
    },
    [MATERIAL_NB]: {
        markup: '150',
        buyAmount: '1000',
        c: {
            name: MATERIAL_NB,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_NX]: {
        markup: '101',
        buyAmount: '10000',
        c: {
            name: MATERIAL_NX,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_SW]: {
        markup: '1.35',
        buyAmount: '1000',
        c: {
            name: MATERIAL_SW,
            unit: UNIT_PED_K,
            kValue: 0.01,
        }
    },
    [MATERIAL_DW]: {
        markup: '101',
        buyAmount: '10000',
        c: {
            name: MATERIAL_DW,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_ST]: {
        markup: '110',
        buyAmount: '10000',
        c: {
            name: MATERIAL_ST,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_FT]: {
        markup: '2.8',
        buyAmount: '1000',
        c: {
            name: MATERIAL_FT,
            unit: UNIT_PED_K,
            kValue: 0.01,
        }
    },
}

const initialState: MaterialsState = {
    map: refinedInitialMap
}

const setState = (state: MaterialsState, inState: MaterialsState): MaterialsState => inState

const materialChanged = (state: MaterialsState, material: string, change: any): MaterialsState => ({
    ...state,
    map: {
        ...state.map,
        [material]: {
            ...state.map[material],
            ...change
        }
    }
})

const materialMarkupChanged = (state: MaterialsState, material: string, markup: string): MaterialsState =>
    materialChanged(state, material, { markup })

const materialBuyAmountChanged = (state: MaterialsState, material: string, buyAmount: string): MaterialsState =>
    materialChanged(state, material, { buyAmount })

const cleanForSave = (state: MaterialsState): MaterialsState => {
    const cState = JSON.parse(JSON.stringify(state))
    Object.keys(cState).forEach(k => {
        delete cState[k].c
    })
    return cState
}

export {
    initialState,
    refinedInitialMap,
    setState,
    materialMarkupChanged,
    materialBuyAmountChanged,
    cleanForSave,
    MATERIAL_ME,
    MATERIAL_LME,
    MATERIAL_NB,
    MATERIAL_NX,
    MATERIAL_SW,
    MATERIAL_DW,
    MATERIAL_ST,
    MATERIAL_FT,
    UNIT_PERCENTAGE,
    UNIT_PED_K,
}
