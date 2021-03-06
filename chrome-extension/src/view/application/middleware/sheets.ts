import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { ADD_PENDING_CHANGE, donePendingChanges, performChange, PERFORM_CHANGE, setTimeoutId } from "../actions/sheets"
import { getSheets } from "../selectors/sheets"
import { OperationText } from "../state/actives"
import { SHEETS_STATE } from "../state/sheets"

const TIMEOUT_MILLISECONDS = 3000

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case ADD_PENDING_CHANGE: {
            const state: SHEETS_STATE = getSheets(getState())
            if (state.timeoutId !== undefined)
                clearTimeout(state.timeoutId)
            const timeoutId = setTimeout(
                () => { dispatch(performChange) },
                TIMEOUT_MILLISECONDS
            )
            dispatch(setTimeoutId(timeoutId))
            break
        }
        case PERFORM_CHANGE: {
            try {
                const state: SHEETS_STATE = getSheets(getState())
                const loadingMessage = state.pending.length === 1 ? OperationText[state.pending[0].operation] : `${state.pending.length} changes`
                dispatch(startLoading(loadingMessage))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.loadMELogSheet(setStage)
                const rows = []
                for (const c of state.pending) {
                    const row = c.changeFunc(sheet)
                    rows.push({ fn: c.doneFunc, row })
                }
                await sheet.save()
                for (const r of rows) {
                    for (const a of r.fn(r.row))
                        dispatch(a)
                }
                dispatch(endLoading)
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception changing sheet:')
                traceData(e)
            }
            dispatch(donePendingChanges)
            break
        }
    }
}

export default [
    requests
]
