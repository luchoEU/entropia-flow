import { mergeDeep } from "../../../common/utils"
import { addOrderToList, ORDER_MARKUP_CHANGED, ORDER_VALUE_CHANGED, setOrderState } from "../actions/order"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/order"
import { getOrder } from "../selectors/order"
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
    }
}

export default [
    requests
]
