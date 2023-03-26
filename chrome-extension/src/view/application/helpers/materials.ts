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
const UNIT_PED_K = 'ped/k'

const refinedInitialMap: MaterialsMap = {
    [MATERIAL_ME]: {
        name: MATERIAL_ME,        
        markup: '120',
        unit: UNIT_PERCENTAGE,
        kValue: 0.1,
    },
    [MATERIAL_LME]: {
        name: MATERIAL_LME,
        markup: '110',
        unit: UNIT_PERCENTAGE,
        kValue: 0.1,
    },
    [MATERIAL_NB]: {
        name: MATERIAL_NB,
        markup: '150',
        unit: UNIT_PERCENTAGE,
        kValue: 10,
    },
    [MATERIAL_NX]: {
        name: MATERIAL_NX,
        markup: '101',
        unit: UNIT_PERCENTAGE,
        kValue: 10,
    },
    [MATERIAL_SW]: {
        name: MATERIAL_SW,
        markup: '1.35',
        unit: UNIT_PED_K,
        kValue: 0.01,
    },
    [MATERIAL_DW]: {
        name: MATERIAL_DW,
        markup: '102',
        unit: UNIT_PERCENTAGE,
        kValue: 10,
    },
    [MATERIAL_ST]: {
        name: MATERIAL_ST,
        markup: '110',
        unit: UNIT_PERCENTAGE,
        kValue: 10,
    },
    [MATERIAL_FT]: {
        name: MATERIAL_FT,
        markup: '2.8',
        unit: UNIT_PED_K,
        kValue: 0.01,
    },
}

const initialState: MaterialsState = {
    map: refinedInitialMap
}

const setState = (state: MaterialsState, inState: MaterialsState): MaterialsState => inState

const materialMarkupChanged = (state: MaterialsState, material: string, markup: string): MaterialsState => ({
    ...state,
    map: {
        ...state.map,
        [material]: {
            ...state.map[material],
            markup
        }
    }
})

export {
    initialState,
    refinedInitialMap,
    setState,
    materialMarkupChanged,
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
