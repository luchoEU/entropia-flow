import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { addOrderToList, ADD_ORDER_TO_SHEET, ORDER_MARKUP_CHANGED, ORDER_VALUE_CHANGED, setOrderState } from "../actions/order"
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
            try {
                const s: OrderState = getOrder(getState())
                dispatch(startLoading(OPERATION_ADD_ORDER))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.load(setStage)
                const row = await api.sheets.orderNexus(sheet, s.markup, s.value)
                await api.sheets.save(sheet, setStage)
                dispatch(addOrderToList(row, s.markup, s.value))
                dispatch(endLoading)
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception order:')
                traceData(e)
            }
            break
        }
    }
}

export default [
    requests
]