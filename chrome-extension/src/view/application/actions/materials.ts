import { MaterialsState, MaterialStateWebData } from '../state/materials'

const SET_MATERIALS_STATE = '[material] set state'
const MATERIAL_BUY_MARKUP_CHANGED = '[material] buy markup changed'
const MATERIAL_ORDER_MARKUP_CHANGED = '[material] order markup changed'
const MATERIAL_USE_AMOUNT_CHANGED = '[material] use amount changed'
const MATERIAL_REFINE_AMOUNT_CHANGED = '[material] refine amount changed'
const MATERIAL_BUY_AMOUNT_CHANGED = '[material] buy amount changed'
const MATERIAL_ORDER_VALUE_CHANGED = '[material] order value changed'
const SET_MATERIAL_PARTIAL_WEB_DATA = '[material] set partial web data'
const LOAD_MATERIAL_RAW_MATERIALS = '[material] load raw materials'

const setMaterialsState = (state: MaterialsState) => ({
    type: SET_MATERIALS_STATE,
    payload: {
        state
    }
})

const materialBuyMarkupChanged = (material: string) => (value: string) => ({
    type: MATERIAL_BUY_MARKUP_CHANGED,
    payload: {
        material,
        value
    }
})

const materialOrderMarkupChanged = (material: string) => (value: string) => ({
    type: MATERIAL_ORDER_MARKUP_CHANGED,
    payload: {
        material,
        value
    }
})

const materialUseAmountChanged = (material: string) => (value: string) => ({
    type: MATERIAL_USE_AMOUNT_CHANGED,
    payload: {
        material,
        value
    }
})

const materialRefineAmountChanged = (material: string) => (value: string) => ({
    type: MATERIAL_REFINE_AMOUNT_CHANGED,
    payload: {
        material,
        value
    }
})

const materialBuyAmountChanged = (material: string, value: string) => ({
    type: MATERIAL_BUY_AMOUNT_CHANGED,
    payload: {
        material,
        value
    }
})

const materialOrderValueChanged = (material: string, value: string) => ({
    type: MATERIAL_ORDER_VALUE_CHANGED,
    payload: {
        material,
        value
    }
})

const setMaterialPartialWebData = (material: string, change: Partial<MaterialStateWebData>) => ({
    type: SET_MATERIAL_PARTIAL_WEB_DATA,
    payload: {
        material,
        change
    }
})

const loadMaterialRawMaterials = (material: string) => ({
    type: LOAD_MATERIAL_RAW_MATERIALS,
    payload: {
        material
    }
})

export {
    SET_MATERIALS_STATE,
    MATERIAL_BUY_MARKUP_CHANGED,
    MATERIAL_ORDER_MARKUP_CHANGED,
    MATERIAL_USE_AMOUNT_CHANGED,
    MATERIAL_REFINE_AMOUNT_CHANGED,
    MATERIAL_BUY_AMOUNT_CHANGED,
    MATERIAL_ORDER_VALUE_CHANGED,
    SET_MATERIAL_PARTIAL_WEB_DATA,
    LOAD_MATERIAL_RAW_MATERIALS,
    setMaterialsState,
    materialBuyMarkupChanged,
    materialOrderMarkupChanged,
    materialUseAmountChanged,
    materialRefineAmountChanged,
    materialBuyAmountChanged,
    materialOrderValueChanged,
    setMaterialPartialWebData,
    loadMaterialRawMaterials,
}
