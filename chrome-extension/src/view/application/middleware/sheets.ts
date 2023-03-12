import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { lmeSellDone, meSellDone } from "../actions/calculator"
import { addOrderToSheetDone } from "../actions/order"
import { addRefineToSheetDone } from "../actions/refine"
import { ADD_PENDING_CHANGE, CLEAR_PENDING_CHANGES, donePendingChanges, performChange, PERFORM_CHANGE, setTimeoutId } from "../actions/sheets"
import { addStackableToSheetDone } from "../actions/stackable"
import { addSweatToSheetDone } from "../actions/sweat"
import { STACKABLE_DILUTED, STACKABLE_LME, STACKABLE_ME, STACKABLE_NB, STACKABLE_NEXUS } from "../helpers/stackable"
import { getSettings } from "../selectors/settings"
import { getSheets } from "../selectors/sheets"
import { OperationText } from "../state/actives"
import { SettingsState } from "../state/settings"
import { SheetsState } from "../state/sheets"

const TIMEOUT_MILLISECONDS = 3000

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case ADD_PENDING_CHANGE: {
            const state: SheetsState = getSheets(getState())
            if (state?.timeoutId !== undefined)
                clearTimeout(state.timeoutId)
            const timeoutId = setTimeout(
                () => { dispatch(performChange) },
                TIMEOUT_MILLISECONDS
            )
            dispatch(setTimeoutId(timeoutId))
            break
        }
        case CLEAR_PENDING_CHANGES: {
            dispatch(meSellDone)
            dispatch(lmeSellDone)
            dispatch(addOrderToSheetDone)
            dispatch(addSweatToSheetDone)
            dispatch(addStackableToSheetDone(STACKABLE_NEXUS))
            dispatch(addStackableToSheetDone(STACKABLE_ME))
            dispatch(addStackableToSheetDone(STACKABLE_LME))
            dispatch(addStackableToSheetDone(STACKABLE_NB))
            dispatch(addStackableToSheetDone(STACKABLE_DILUTED))
            dispatch(addRefineToSheetDone(STACKABLE_ME))
            dispatch(addRefineToSheetDone(STACKABLE_LME))
            dispatch(addRefineToSheetDone(STACKABLE_NB))
            break
        }
        case PERFORM_CHANGE: {
            try {
                const state: SheetsState = getSheets(getState())
                const settings: SettingsState = getSettings(getState())
                const loadingMessage = state.pending.length === 1 ? OperationText[state.pending[0].operation] : `${state.pending.length} changes`
                dispatch(startLoading(loadingMessage))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.loadMELogSheet(settings.sheet, setStage)
                const rows = []
                for (const c of state.pending) {
                    const row = c.changeFunc(sheet)
                    rows.push({ fn: c.doneFunc, row })
                }
                await sheet.save()
                for (const r of rows) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    for (const a of r.fn(r.row))
                        dispatch(a)
                }
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception changing sheet:')
                traceData(e)
            } finally {
                dispatch(endLoading)
                dispatch(donePendingChanges)
            }
            break
        }
    }
}

export default [
    requests
]
