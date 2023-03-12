import { addPendingChange } from "../actions/sheets"
import { addStackableToSheetDone, ADD_STACKABLE_TO_SHEET, setStackableState, STACKABLE_MARKUP_CHANGED, STACKABLE_TT_VALUE_CHANGED } from "../actions/stackable"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn, stackableOperation, stackableSheetsMethod } from "../helpers/stackable"
import { getOneStackableIn, getStackableIn } from "../selectors/stackable"
import { StackableOneStateIn, StackableStateIn } from "../state/stackable"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: StackableStateIn = await api.storage.loadStackable()
            if (state)
                dispatch(setStackableState({ ...initialStateIn, ...state }))
            break
        }
        case STACKABLE_TT_VALUE_CHANGED:
        case STACKABLE_MARKUP_CHANGED: {
            const state: StackableStateIn = getStackableIn(getState())
            await api.storage.saveStackable(state)
            break
        }
        case ADD_STACKABLE_TO_SHEET: {
            const m = action.payload.material
            const s: StackableOneStateIn = getOneStackableIn(m)(getState())
            dispatch(addPendingChange(
                stackableOperation[m],
                sheet => sheet[stackableSheetsMethod[m]](s.ttValue, s.markup),
                row => [ addStackableToSheetDone(m) ]
            ))
            break
        }
    }
}

export default [
    requests
]
