import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { ADD_PENDING_CHANGE, donePendingChanges, performChange, PERFORM_CHANGE, setTimeoutId } from "../actions/sheets"
import { operationChangeFunc, operationDoneFunc } from "../helpers/sheets"
import { getSettings } from "../selectors/settings"
import { getSheets } from "../selectors/sheets"
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
        case PERFORM_CHANGE: {
            try {
                const state: SheetsState = getSheets(getState())
                const settings: SettingsState = getSettings(getState())
                const loadingMessage = `${state.pending.length} changes`
                dispatch(startLoading(loadingMessage))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.loadMELogSheet(settings.sheet, setStage)
                const doneList: {
                    fn: string,
                    row: number,
                }[] = []
                for (const c of state.pending) {
                    const row = sheet[operationChangeFunc[c.operationType][c.material]].apply(c.parameters)
                    const doneFn = operationDoneFunc[c.operationType]
                    if (doneFn)
                        doneList.push({ fn: doneFn, row })
                }
                await sheet.save()
                for (const aDone of doneList) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    dispatch(window[aDone.fn](aDone.row))
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
