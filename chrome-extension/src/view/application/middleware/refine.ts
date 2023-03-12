import { addRefineToSheetDone, ADD_REFINE_TO_SHEET, REFINE_AMOUNT_CHANGED, setRefineState } from "../actions/refine"
import { addPendingChange } from "../actions/sheets"
import { PAGE_LOADED } from "../actions/ui"
import { initialState, refineOperation, refineSheetsMethod } from "../helpers/refine"
import { getOneRefine, getRefine } from "../selectors/refine"
import { RefineOneState, RefineState } from "../state/refine"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: RefineState = await api.storage.loadRefine()
            if (state)
                dispatch(setRefineState({ ...initialState, ...state }))
            break
        }
        case REFINE_AMOUNT_CHANGED: {
            const state: RefineState = getRefine(getState())
            await api.storage.saveRefine(state)
            break
        }
        case ADD_REFINE_TO_SHEET: {
            const m = action.payload.material
            const s: RefineOneState = getOneRefine(m)(getState())
            dispatch(addPendingChange(
                refineOperation[m],
                sheet => sheet[refineSheetsMethod[m]](s.amount),
                row => [ addRefineToSheetDone(m) ]
            ))
            break
        }
    }
}

export default [
    requests
]
