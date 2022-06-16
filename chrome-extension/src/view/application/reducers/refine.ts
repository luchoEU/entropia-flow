import { ADD_REFINE_TO_SHEET, ADD_REFINE_TO_SHEET_DONE, REFINE_AMOUNT_CHANGED, SET_REFINE_STATE } from "../actions/refine"
import { addRefineChanged, initialState, refineAmountChanged, setState } from "../helpers/refine"

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_REFINE_STATE: return setState(state, action.payload.state)
        case REFINE_AMOUNT_CHANGED: return refineAmountChanged(state, action.payload.material, action.payload.amount)
        case ADD_REFINE_TO_SHEET: return addRefineChanged(state, action.payload.material, true)
        case ADD_REFINE_TO_SHEET_DONE: return addRefineChanged(state, action.payload.material, false)
        default: return state
    }
}
