import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { lmeSellDone, meSellDone } from "../actions/calculator"
import { addOrderToSheetDone } from "../actions/order"
import { addRefineToSheetDone } from "../actions/refine"
import { addPendingChange, ADD_BUY_TO_SHEET, ADD_PENDING_CHANGE, ADD_REFINE_TO_SHEET, ADD_STACKABLE_TO_SHEET, ADD_USE_TO_SHEET, CLEAR_PENDING_CHANGES, donePendingChanges, performChange, PERFORM_CHANGE, setTimeoutId } from "../actions/sheets"
import { addStackableToSheetDone } from "../actions/stackable"
import { addSweatToSheetDone } from "../actions/sweat"
import { operationChangeFunc, operationDoneFunc } from "../helpers/sheets"
import { STACKABLE_DILUTED, STACKABLE_LME, STACKABLE_ME, STACKABLE_NB, STACKABLE_NEXUS } from "../helpers/stackable"
import { getCalculatorOut } from "../selectors/calculator"
import { getSettings } from "../selectors/settings"
import { getSheets } from "../selectors/sheets"
import { OperationText } from "../state/actives"
import { CalculatorStateOut1 } from "../state/calculator"
import { SettingsState } from "../state/settings"
import { OPERATION_TYPE_BUY_PER_K, OPERATION_TYPE_BUY_STACKABLE, OPERATION_TYPE_USE, SheetsState } from "../state/sheets"

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
                const loadingMessage = `${state.pending.length} changes`
                dispatch(startLoading(loadingMessage))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.loadMELogSheet(settings.sheet, setStage)
                const doneList = []
                for (const c of state.pending) {
                    const row = sheet[operationChangeFunc[c.operationType][c.material]].apply(c.parameters)
                    const doneFn = operationDoneFunc[c.operationType]
                    if (doneFn)
                        doneList.push({ fn: doneFn, row })
                }
                await sheet.save()
                for (const aDone of doneList) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    for (const a of aDone.fn(aDone.row))
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
