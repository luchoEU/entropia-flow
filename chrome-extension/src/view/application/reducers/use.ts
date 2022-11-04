import { ADD_USE_TO_SHEET, ADD_USE_TO_SHEET_DONE, USE_AMOUNT_CHANGED, SET_USE_STATE } from "../actions/use"
import { addUseChanged, initialState, useAmountChanged, setState } from "../helpers/use"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_USE_STATE: return setState(state, action.payload.state)
        case USE_AMOUNT_CHANGED: return useAmountChanged(state, action.payload.material, action.payload.amount)
        case ADD_USE_TO_SHEET: return addUseChanged(state, action.payload.material, true)
        case ADD_USE_TO_SHEET_DONE: return addUseChanged(state, action.payload.material, false)
        default: return state
    }
}
