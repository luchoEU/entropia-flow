import { addOrderToList, addOrderToSheetDone, ADD_ORDER_TO_SHEET, ORDER_MARKUP_CHANGED, ORDER_VALUE_CHANGED, setOrderState } from "../actions/order"
import { addPendingChange } from "../actions/sheets"
import { PAGE_LOADED } from "../actions/ui"
import { getOrder } from "../selectors/order"
import { OPERATION_ADD_ORDER } from "../state/actives"
import { OrderState } from "../state/order"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadOrder()
            if (state)
                dispatch(setOrderState(state))
            break
        }
        case ORDER_MARKUP_CHANGED:
        case ORDER_VALUE_CHANGED: {
            const state = getOrder(getState())
            await api.storage.saveOrder(state)
            break
        }
        case ADD_ORDER_TO_SHEET: {
            const s: OrderState = getOrder(getState())
            dispatch(addPendingChange(
                OPERATION_ADD_ORDER,
                sheet => api.sheets.orderNexus(sheet, s.markup, s.value),
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
