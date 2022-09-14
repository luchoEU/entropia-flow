import { SHEETS_STATE } from "../state/sheets"

const initialState: SHEETS_STATE = {
    pending: [],
    timeoutId: undefined
}

const addPendingChange = (state: SHEETS_STATE, operation: number, changeFunc: (sheet: any) => number, doneFunc: (row: number) => Array<any>): SHEETS_STATE => ({
    ...state,
    pending: [
        ...state.pending,
        {
            operation,
            changeFunc,
            doneFunc
        }
    ]
})

const clearPendingChanges = (state: SHEETS_STATE): SHEETS_STATE => ({
    ...state,
    pending: []
})

const setTimeoutId = (state: SHEETS_STATE, timeoutId: number) => ({
    ...state,
    timeoutId
})

const clearPendingChangeAndTimeoutId = (state: SHEETS_STATE) => initialState

export {
    initialState,
    addPendingChange,
    setTimeoutId,
    clearPendingChanges,
    clearPendingChangeAndTimeoutId,
}
