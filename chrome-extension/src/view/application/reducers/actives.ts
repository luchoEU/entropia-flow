import { ADD_ACTIVE, END_LOADING, ERROR_LOADING, REMOVE_ACTIVE, SET_ACTIVES, SET_LOADING_STAGE, START_LOADING } from "../actions/actives"
import { ADD_ORDER_TO_LIST } from "../actions/order"
import { addActive, endLoading, initialState, removeActive, setActives, setLoadingError, setLoadingStage, startLoading } from "../helpers/actives"

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOADING: return startLoading(state, action.payload.loadingText)
        case SET_LOADING_STAGE: return setLoadingStage(state, action.payload.stage)
        case END_LOADING: return endLoading(state)
        case ERROR_LOADING: return setLoadingError(state, action.payload.text)
        case ADD_ACTIVE: return addActive(state, action.payload.row, action.payload.material, action.payload.quantity, action.payload.opening, action.payload.buyout, action.payload.buyoutFee)
        case ADD_ORDER_TO_LIST: return addActive(state, action.payload.row, 'Order', action.payload.markup + '%', '', action.payload.value, '')
        case SET_ACTIVES: return setActives(state, action.payload.list)
        case REMOVE_ACTIVE: return removeActive(state, action.payload.date)
        default: return state
    }
}
