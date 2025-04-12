import { MarkupUnit, MaterialsState, MaterialStateWebData } from '../state/materials'

const SET_MATERIALS_STATE = '[material] set state'
const MATERIAL_BUY_MARKUP_CHANGED = '[material] buy markup changed'
const MATERIAL_ORDER_MARKUP_CHANGED = '[material] order markup changed'
const MATERIAL_USE_AMOUNT_CHANGED = '[material] use amount changed'
const MATERIAL_REFINE_AMOUNT_CHANGED = '[material] refine amount changed'
const MATERIAL_BUY_AMOUNT_CHANGED = '[material] buy amount changed'
const MATERIAL_ORDER_VALUE_CHANGED = '[material] order value changed'
const MATERIAL_NOTES_VALUE_CHANGED = '[material] notes value changed'
const MATERIAL_RESERVE_VALUE_CHANGED = '[material] reserve value changed'
const SET_MATERIAL_PARTIAL_WEB_DATA = '[material] set partial web data'
const LOAD_MATERIAL_RAW_MATERIALS = '[material] load raw materials'
const LOAD_MATERIAL_DATA = '[material] load data'
const LOAD_ITEM_USAGE_DATA = '[material] load item usage data'
const SET_MATERIAL_CALCULATOR_QUANTITY = '[material] set calculator quantity'
const SET_MATERIAL_CALCULATOR_TOTAL = '[material] set calculator total'
const SET_MATERIAL_CALCULATOR_TOTAL_MU = '[material] set calculator total mu'
const SET_MATERIAL_MARKUP_UNIT = '[material] set markup unit'

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

const materialNotesValueChanged = (material: string) => (value: string) => ({
    type: MATERIAL_NOTES_VALUE_CHANGED,
    payload: {
        material,
        value
    }
})

const materialReserveValueChanged = (material: string) => (reserveAmount: string) => ({
    type: MATERIAL_RESERVE_VALUE_CHANGED,
    payload: {
        material,
        reserveAmount
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

const loadMaterialData = (material: string, url?: string) => ({
    type: LOAD_MATERIAL_DATA,
    payload: {
        material,
        url
    }
})

const loadItemUsageData = (item: string) => ({
    type: LOAD_ITEM_USAGE_DATA,
    payload: {
        item
    }
})

const setMaterialCalculatorQuantity = (material: string, quantity: string) => ({
    type: SET_MATERIAL_CALCULATOR_QUANTITY,
    payload: {
        material,
        quantity
    }
})

const setMaterialCalculatorTotal = (material: string, total: string) => ({
    type: SET_MATERIAL_CALCULATOR_TOTAL,
    payload: {
        material,
        total
    }
})

const setMaterialCalculatorTotalMU = (material: string, totalMU: string) => ({
    type: SET_MATERIAL_CALCULATOR_TOTAL_MU,
    payload: {
        material,
        totalMU
    }
})

const setMaterialMarkupUnit = (material: string, unit: MarkupUnit) => ({
    type: SET_MATERIAL_MARKUP_UNIT,
    payload: {
        material,
        unit
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
    MATERIAL_NOTES_VALUE_CHANGED,
    MATERIAL_RESERVE_VALUE_CHANGED,
    SET_MATERIAL_PARTIAL_WEB_DATA,
    LOAD_MATERIAL_RAW_MATERIALS,
    LOAD_MATERIAL_DATA,
    LOAD_ITEM_USAGE_DATA,
    SET_MATERIAL_CALCULATOR_QUANTITY,
    SET_MATERIAL_CALCULATOR_TOTAL,
    SET_MATERIAL_CALCULATOR_TOTAL_MU,
    SET_MATERIAL_MARKUP_UNIT,
    setMaterialsState,
    materialBuyMarkupChanged,
    materialOrderMarkupChanged,
    materialUseAmountChanged,
    materialRefineAmountChanged,
    materialBuyAmountChanged,
    materialOrderValueChanged,
    materialNotesValueChanged,
    materialReserveValueChanged,
    setMaterialPartialWebData,
    loadMaterialRawMaterials,
    loadMaterialData,
    loadItemUsageData,
    setMaterialCalculatorQuantity,
    setMaterialCalculatorTotal,
    setMaterialCalculatorTotalMU,
    setMaterialMarkupUnit,
}
