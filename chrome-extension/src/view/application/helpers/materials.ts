import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { MaterialsMap, MaterialsState } from "../state/materials"

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
    map: refinedInitialMap,
    craftBudget: {
        expanded: false,
        stage: STAGE_INITIALIZING,
        map: { }
    }
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

const materialBuyMarkupChanged = (state: MaterialsState, material: string, buyMarkup: string): MaterialsState =>
    materialChanged(state, material, { buyMarkup })

const materialOrderMarkupChanged = (state: MaterialsState, material: string, orderMarkup: string): MaterialsState =>
    materialChanged(state, material, { orderMarkup })

const materialUseAmountChanged = (state: MaterialsState, material: string, useAmount: string): MaterialsState =>
    materialChanged(state, material, { useAmount })

const materialRefineAmountChanged = (state: MaterialsState, material: string, refineAmount: string): MaterialsState =>
    materialChanged(state, material, { refineAmount })

const materialBuyAmountChanged = (state: MaterialsState, material: string, buyAmount: string): MaterialsState =>
    materialChanged(state, material, { buyAmount })

const materialOrderValueChanged = (state: MaterialsState, material: string, orderValue: string): MaterialsState =>
    materialChanged(state, material, { orderValue })

const cleanForSave = (state: MaterialsState): MaterialsState => {
    const cState: MaterialsState = JSON.parse(JSON.stringify(state))
    Object.keys(cState.map).forEach(k => {
        delete cState.map[k].c
    })
    cState.craftBudget.stage = STAGE_INITIALIZING
    return cState
}

const setMaterialCraftListExpanded = (state: MaterialsState, expanded: boolean) => ({
    ...state,
    craftBudget: {
        ...state.craftBudget,
        expanded
    }
})

const setMaterialCraftExpanded = (state: MaterialsState, material: string, expanded: boolean): MaterialsState => {
    const cState: MaterialsState = JSON.parse(JSON.stringify(state))
    cState.craftBudget.map[material].expanded = expanded
    return cState
}

const setMaterialCraftBudgetStage = (state: MaterialsState, stage: number) => ({
    ...state,
    craftBudget: {
        ...state.craftBudget,
        stage
    }
})

export {
    initialState,
    materialMap,
    refinedInitialMap,
    setState,
    materialBuyMarkupChanged,
    materialOrderMarkupChanged,
    materialUseAmountChanged,
    materialRefineAmountChanged,
    materialBuyAmountChanged,
    materialOrderValueChanged,
    cleanForSave,
    setMaterialCraftListExpanded,
    setMaterialCraftExpanded,
    setMaterialCraftBudgetStage,
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
