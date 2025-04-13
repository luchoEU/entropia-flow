import { BlueprintWebMaterial } from '../../../web/state'
import { MarkupUnit, ItemsState, ItemStateWebData } from '../state/items'

const SET_ITEMS_STATE = '[item] set state'
const ITEM_BUY_MARKUP_CHANGED = '[item] buy markup changed'
const ITEM_ORDER_MARKUP_CHANGED = '[item] order markup changed'
const ITEM_USE_AMOUNT_CHANGED = '[item] use amount changed'
const ITEM_REFINE_AMOUNT_CHANGED = '[item] refine amount changed'
const ITEM_BUY_AMOUNT_CHANGED = '[item] buy amount changed'
const ITEM_ORDER_VALUE_CHANGED = '[item] order value changed'
const ITEM_NOTES_VALUE_CHANGED = '[item] notes value changed'
const ITEM_RESERVE_VALUE_CHANGED = '[item] reserve value changed'
const SET_ITEM_PARTIAL_WEB_DATA = '[item] set partial web data'
const LOAD_ITEM_RAW_MATERIALS = '[item] load raw materials'
const LOAD_ITEM_DATA = '[item] load data'
const LOAD_ITEM_USAGE_DATA = '[item] load item usage data'
const SET_ITEM_CALCULATOR_QUANTITY = '[item] set calculator quantity'
const SET_ITEM_CALCULATOR_TOTAL = '[item] set calculator total'
const SET_ITEM_CALCULATOR_TOTAL_MU = '[item] set calculator total mu'
const SET_ITEM_MARKUP_UNIT = '[item] set markup unit'

const setItemsState = (state: ItemsState) => ({
    type: SET_ITEMS_STATE,
    payload: {
        state
    }
})

const itemBuyMarkupChanged = (item: string) => (value: string) => ({
    type: ITEM_BUY_MARKUP_CHANGED,
    payload: {
        item,
        value
    }
})

const itemOrderMarkupChanged = (item: string) => (value: string) => ({
    type: ITEM_ORDER_MARKUP_CHANGED,
    payload: {
        item,
        value
    }
})

const itemUseAmountChanged = (item: string) => (value: string) => ({
    type: ITEM_USE_AMOUNT_CHANGED,
    payload: {
        item,
        value
    }
})

const itemRefineAmountChanged = (item: string) => (value: string) => ({
    type: ITEM_REFINE_AMOUNT_CHANGED,
    payload: {
        item,
        value
    }
})

const itemBuyAmountChanged = (item: string, value: string) => ({
    type: ITEM_BUY_AMOUNT_CHANGED,
    payload: {
        item,
        value
    }
})

const itemOrderValueChanged = (item: string, value: string) => ({
    type: ITEM_ORDER_VALUE_CHANGED,
    payload: {
        item,
        value
    }
})

const itemNotesValueChanged = (item: string) => (value: string) => ({
    type: ITEM_NOTES_VALUE_CHANGED,
    payload: {
        item,
        value
    }
})

const itemReserveValueChanged = (item: string) => (reserveAmount: string) => ({
    type: ITEM_RESERVE_VALUE_CHANGED,
    payload: {
        item,
        reserveAmount
    }
})

const setItemPartialWebData = (item: string, change: Partial<ItemStateWebData>) => ({
    type: SET_ITEM_PARTIAL_WEB_DATA,
    payload: {
        item,
        change
    }
})

const loadItemRawMaterials = (item: string) => ({
    type: LOAD_ITEM_RAW_MATERIALS,
    payload: {
        item
    }
})

const loadItemData = (item: string, bpMaterial?: BlueprintWebMaterial) => ({
    type: LOAD_ITEM_DATA,
    payload: {
        item,
        bpMaterial
    }
})

const loadItemUsageData = (item: string) => ({
    type: LOAD_ITEM_USAGE_DATA,
    payload: {
        item
    }
})

const setItemCalculatorQuantity = (item: string, quantity: string) => ({
    type: SET_ITEM_CALCULATOR_QUANTITY,
    payload: {
        item,
        quantity
    }
})

const setItemCalculatorTotal = (item: string, total: string) => ({
    type: SET_ITEM_CALCULATOR_TOTAL,
    payload: {
        item,
        total
    }
})

const setItemCalculatorTotalMU = (item: string, totalMU: string) => ({
    type: SET_ITEM_CALCULATOR_TOTAL_MU,
    payload: {
        item,
        totalMU
    }
})

const setItemMarkupUnit = (item: string, unit: MarkupUnit) => ({
    type: SET_ITEM_MARKUP_UNIT,
    payload: {
        item,
        unit
    }
})

export {
    SET_ITEMS_STATE,
    ITEM_BUY_MARKUP_CHANGED,
    ITEM_ORDER_MARKUP_CHANGED,
    ITEM_USE_AMOUNT_CHANGED,
    ITEM_REFINE_AMOUNT_CHANGED,
    ITEM_BUY_AMOUNT_CHANGED,
    ITEM_ORDER_VALUE_CHANGED,
    ITEM_NOTES_VALUE_CHANGED,
    ITEM_RESERVE_VALUE_CHANGED,
    SET_ITEM_PARTIAL_WEB_DATA,
    LOAD_ITEM_RAW_MATERIALS,
    LOAD_ITEM_DATA,
    LOAD_ITEM_USAGE_DATA,
    SET_ITEM_CALCULATOR_QUANTITY,
    SET_ITEM_CALCULATOR_TOTAL,
    SET_ITEM_CALCULATOR_TOTAL_MU,
    SET_ITEM_MARKUP_UNIT,
    setItemsState,
    itemBuyMarkupChanged,
    itemOrderMarkupChanged,
    itemUseAmountChanged,
    itemRefineAmountChanged,
    itemBuyAmountChanged,
    itemOrderValueChanged,
    itemNotesValueChanged,
    itemReserveValueChanged,
    setItemPartialWebData,
    loadItemRawMaterials,
    loadItemData,
    loadItemUsageData,
    setItemCalculatorQuantity,
    setItemCalculatorTotal,
    setItemCalculatorTotalMU,
    setItemMarkupUnit,
}
