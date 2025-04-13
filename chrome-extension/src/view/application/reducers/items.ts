import { ITEM_BUY_AMOUNT_CHANGED, ITEM_BUY_MARKUP_CHANGED, ITEM_NOTES_VALUE_CHANGED, ITEM_ORDER_MARKUP_CHANGED, ITEM_ORDER_VALUE_CHANGED, ITEM_REFINE_AMOUNT_CHANGED, ITEM_RESERVE_VALUE_CHANGED, ITEM_USE_AMOUNT_CHANGED, SET_ITEM_CALCULATOR_QUANTITY, SET_ITEM_CALCULATOR_TOTAL, SET_ITEM_CALCULATOR_TOTAL_MU, SET_ITEM_MARKUP_UNIT, SET_ITEM_PARTIAL_WEB_DATA, SET_ITEMS_STATE } from "../actions/items"
import { initialState, reduceItemBuyAmountChanged, reduceItemBuyMarkupChanged, reduceItemNotesValueChanged, reduceItemOrderMarkupChanged, reduceItemOrderValueChanged, reduceItemRefineAmountChanged, reduceItemReserveValueChanged, reduceItemUseAmountChanged, reduceSetItemCalculatorQuantity, reduceSetItemCalculatorTotal, reduceSetItemCalculatorTotalMU, reduceSetItemMarkupUnit, reduceSetItemPartialWebData, reduceSetState } from "../helpers/items"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_ITEMS_STATE: return reduceSetState(state, action.payload.state)
        case ITEM_BUY_MARKUP_CHANGED: return reduceItemBuyMarkupChanged(state, action.payload.item, action.payload.value)
        case ITEM_ORDER_MARKUP_CHANGED: return reduceItemOrderMarkupChanged(state, action.payload.item, action.payload.value)
        case ITEM_USE_AMOUNT_CHANGED: return reduceItemUseAmountChanged(state, action.payload.item, action.payload.value)
        case ITEM_REFINE_AMOUNT_CHANGED: return reduceItemRefineAmountChanged(state, action.payload.item, action.payload.value)
        case ITEM_BUY_AMOUNT_CHANGED: return reduceItemBuyAmountChanged(state, action.payload.item, action.payload.value)
        case ITEM_RESERVE_VALUE_CHANGED: return reduceItemReserveValueChanged(state, action.payload.item, action.payload.reserveAmount)
        case SET_ITEM_MARKUP_UNIT: return reduceSetItemMarkupUnit(state, action.payload.item, action.payload.unit)
        case ITEM_ORDER_VALUE_CHANGED: return reduceItemOrderValueChanged(state, action.payload.item, action.payload.value)
        case ITEM_NOTES_VALUE_CHANGED: return reduceItemNotesValueChanged(state, action.payload.item, action.payload.value)
        case SET_ITEM_PARTIAL_WEB_DATA: return reduceSetItemPartialWebData(state, action.payload.item, action.payload.change)
        case SET_ITEM_CALCULATOR_QUANTITY: return reduceSetItemCalculatorQuantity(state, action.payload.item, action.payload.quantity)
        case SET_ITEM_CALCULATOR_TOTAL: return reduceSetItemCalculatorTotal(state, action.payload.item, action.payload.total)
        case SET_ITEM_CALCULATOR_TOTAL_MU: return reduceSetItemCalculatorTotalMU(state, action.payload.item, action.payload.totalMU)
        default: return state
    }
}
