import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { ADD_STACKABLE_TO_SHEET, setStackableState, STACKABLE_MARKUP_CHANGED, STACKABLE_TT_VALUE_CHANGED } from "../actions/stackable"
import { PAGE_LOADED } from "../actions/ui"
import { stackableOperation, stackableSheetsMethod } from "../helpers/stackable"
import { getOneStackableIn, getStackableIn } from "../selectors/stackable"
import { StackableOneStateIn } from "../state/stackable"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadStackable()
            if (state)
                dispatch(setStackableState(state))
            break
        }
        case STACKABLE_TT_VALUE_CHANGED:
        case STACKABLE_MARKUP_CHANGED: {
            const state = getStackableIn(getState())
            await api.storage.saveStackable(state)
            break
        }
        case ADD_STACKABLE_TO_SHEET: {
            try {
                const m = action.payload.material
                const s: StackableOneStateIn = getOneStackableIn(m)(getState())
                dispatch(startLoading(stackableOperation[m]))
                const row = await api.sheets[stackableSheetsMethod[m]](s.ttValue, s.markup,
                    (stage: number) => dispatch(setLoadingStage(stage)))
                dispatch(endLoading)
                break
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception order:')
                traceData(e)
            }
        }
    }
}

export default [
    requests
]