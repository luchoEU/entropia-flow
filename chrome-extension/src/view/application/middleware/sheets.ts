import { traceError } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { ADD_PENDING_CHANGE, donePendingChanges, performChange, PERFORM_CHANGE, setTimeoutId } from "../actions/sheets"
import { loadSheetFunc, loadSheetParams, operationChangeFunc, operationDoneFunc } from "../helpers/sheets"
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

                const sheetMap = { }                
                const doneList: {
                    fn: any,
                    row: number,
                    params: any[]
                }[] = []

                for (const c of state.pending) {
                    const sheetFuncName = loadSheetFunc[c.operationType]
                    const sheetFuncGetParams = loadSheetParams[sheetFuncName]
                    const sheetMapKey = sheetFuncName + sheetFuncGetParams === undefined ? '' : '+' + c.material
                    let sheet = sheetMap[sheetMapKey]
                    if (sheet === undefined) {
                        sheet = await api.sheets[sheetFuncName].call(api.sheets, settings.sheet, setStage, ...sheetFuncGetParams(getState(), c.material))
                        sheetMap[sheetMapKey] = sheet
                    }
                    const row = await sheet[operationChangeFunc[c.operationType]].call(sheet, ...c.parameters)
                    const doneFn = operationDoneFunc[c.operationType]
                    if (doneFn)
                        doneList.push({ fn: doneFn, row, params: c.doneParameters ?? c.parameters })
                }

                for (const sheetFuncName of Object.keys(sheetMap))
                    await sheetMap[sheetFuncName].save()

                for (const aDone of doneList) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    dispatch(aDone.fn(aDone.row, ...aDone.params))
                }
            } catch (e) {
                dispatch(setLoadingError(e.message))
                traceError('SheetMiddleware', 'exception changing sheet:', e)
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
