import { MaterialsMap, MaterialsState, MaterialState, MaterialStateWebData } from "../state/materials"

const MATERIAL_PED = 'PED'
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

const materialMap = {
    [MATERIAL_NX]: 'nexus',
    [MATERIAL_ME]: 'me',
    [MATERIAL_LME]: 'lme',
    [MATERIAL_NB]: 'nb',
    [MATERIAL_DW]: 'diluted',
    [MATERIAL_ST]: 'sweetstuff',
}

const refinedInitialMap: MaterialsMap = {
    [MATERIAL_ME]: {
        buyMarkup: '120',
        buyAmount: '100000',
        orderMarkup: '101',
        orderValue: '1000',
        useAmount: '10000',
        refineAmount: '100000',
        c: {
            name: MATERIAL_ME,
            unit: UNIT_PERCENTAGE,
            kValue: 0.1,
        }
    },
    [MATERIAL_LME]: {
        buyMarkup: '110',
        buyAmount: '100000',
        orderMarkup: '101',
        orderValue: '1000',
        useAmount: '10000',
        refineAmount: '100000',
        c: {
            name: MATERIAL_LME,
            unit: UNIT_PERCENTAGE,
            kValue: 0.1,
        }
    },
    [MATERIAL_NB]: {
        buyMarkup: '150',
        buyAmount: '1000',
        orderMarkup: '101',
        orderValue: '1000',
        useAmount: '1000',
        refineAmount: '1000',
        c: {
            name: MATERIAL_NB,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_NX]: {
        buyMarkup: '101',
        buyAmount: '10000',
        c: {
            name: MATERIAL_NX,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_SW]: {
        buyMarkup: '1.35',
        buyAmount: '1000',
        c: {
            name: MATERIAL_SW,
            unit: UNIT_PED_K,
            kValue: 0.01,
        }
    },
    [MATERIAL_DW]: {
        buyMarkup: '101',
        buyAmount: '10000',
        c: {
            name: MATERIAL_DW,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_ST]: {
        buyMarkup: '110',
        buyAmount: '10000',
        c: {
            name: MATERIAL_ST,
            unit: UNIT_PERCENTAGE,
            kValue: 10,
        }
    },
    [MATERIAL_FT]: {
        buyMarkup: '2.8',
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

const reduceSetState = (state: MaterialsState, inState: MaterialsState): MaterialsState => inState

const _materialChanged = (state: MaterialsState, material: string, change: Partial<MaterialState>): MaterialsState => ({
    ...state,
    map: {
        ...state.map,
        [material]: {
            ...state.map[material],
            ...change
        }
    }
})

const reduceMaterialBuyMarkupChanged = (state: MaterialsState, material: string, buyMarkup: string): MaterialsState =>
    _materialChanged(state, material, { buyMarkup })

const reduceMaterialOrderMarkupChanged = (state: MaterialsState, material: string, orderMarkup: string): MaterialsState =>
    _materialChanged(state, material, { orderMarkup })

const reduceMaterialUseAmountChanged = (state: MaterialsState, material: string, useAmount: string): MaterialsState =>
    _materialChanged(state, material, { useAmount })

const reduceMaterialRefineAmountChanged = (state: MaterialsState, material: string, refineAmount: string): MaterialsState =>
    _materialChanged(state, material, { refineAmount })

const reduceMaterialBuyAmountChanged = (state: MaterialsState, material: string, buyAmount: string): MaterialsState =>
    _materialChanged(state, material, { buyAmount })

const reduceMaterialOrderValueChanged = (state: MaterialsState, material: string, orderValue: string): MaterialsState =>
    _materialChanged(state, material, { orderValue })

const reduceSetMaterialPartialWebData = (state: MaterialsState, material: string, change: Partial<MaterialStateWebData>): MaterialsState => ({
    ...state,
    map: {
        ...state.map,
        [material]: {
            ...state.map[material],
            web: {
                ...state.map[material]?.web,
                ...change
            }
        }
    }
})

const cleanForSave = (state: MaterialsState): MaterialsState => {
    const cState: MaterialsState = JSON.parse(JSON.stringify(state))
    Object.values(cState.map).forEach(v => {
        if (v.web) {
            for (const k of Object.keys(v.web)) {
                if (v.web[k].loading)
                    delete v.web[k]
            }
        }
        delete v.c
    })
    return cState
}

export {
    initialState,
    materialMap,
    refinedInitialMap,
    reduceSetState,
    reduceMaterialBuyMarkupChanged,
    reduceMaterialOrderMarkupChanged,
    reduceMaterialUseAmountChanged,
    reduceMaterialRefineAmountChanged,
    reduceMaterialBuyAmountChanged,
    reduceMaterialOrderValueChanged,
    reduceSetMaterialPartialWebData,
    cleanForSave,
    MATERIAL_PED,
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
