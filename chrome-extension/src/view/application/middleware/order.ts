import { mergeDeep } from "../../../common/utils"
import { addOrderToList, addOrderToSheetDone, ADD_ORDER_TO_SHEET, ORDER_MARKUP_CHANGED, ORDER_VALUE_CHANGED, setOrderState } from "../actions/order"
import { addPendingChange } from "../actions/sheets"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/order"
import { getOrder } from "../selectors/order"
import { OPERATION_ADD_ORDER } from "../state/actives"
import { OrderState } from "../state/order"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: OrderState = await api.storage.loadOrder()
            if (state)
                dispatch(setOrderState(mergeDeep(initialState, state)))
            break
        }
        case ORDER_MARKUP_CHANGED:
        case ORDER_VALUE_CHANGED: {
            const state: OrderState = getOrder(getState())
            await api.storage.saveOrder(state)
            break
        }
        case ADD_ORDER_TO_SHEET: {
            const s: OrderState = getOrder(getState())
            dispatch(addPendingChange(
                OPERATION_ADD_ORDER,
                sheet => sheet.orderNexus(s.markup, s.value),
                row => [
                    addOrderToList(row, s.markup, s.value),
                    addOrderToSheetDone
                ]
            ))
            break
        }
    }
}

export default [
    requests
]
