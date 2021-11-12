import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { ADD_REFINE_TO_SHEET, REFINE_AMOUNT_CHANGED, setRefineState } from "../actions/refine"
import { PAGE_LOADED } from "../actions/ui"
import { refineOperation, refineSheetsMethod } from "../helpers/refine"
import { getOneRefine, getRefine } from "../selectors/refine"
import { RefineOneState } from "../state/refine"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadRefine()
            if (state)
                dispatch(setRefineState(state))
            break
        }
        case REFINE_AMOUNT_CHANGED: {
            const state = getRefine(getState())
            await api.storage.saveRefine(state)
            break
        }
        case ADD_REFINE_TO_SHEET: {
            try {
                const m = action.payload.material
                const s: RefineOneState = getOneRefine(m)(getState())
                dispatch(startLoading(refineOperation[m]))
                const row = await api.sheets[refineSheetsMethod[m]](s.amount,
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