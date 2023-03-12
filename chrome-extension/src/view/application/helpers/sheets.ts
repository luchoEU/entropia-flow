import { SheetsState } from "../state/sheets"

const initialState: SheetsState = {
    pending: [],
    timeoutId: undefined
}

const addPendingChange = (state: SheetsState, operation: number, changeFunc: (sheet: any) => number, doneFunc: (row: number) => Array<any>): SheetsState => ({
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

const clearPendingChanges = (state: SheetsState): SheetsState => ({
    ...state,
    pending: []
})

const setTimeoutId = (state: SheetsState, timeoutId: number) => ({
    ...state,
    timeoutId
})

const clearPendingChangeAndTimeoutId = (state: SheetsState) => initialState

export {
    initialState,
    addPendingChange,
    setTimeoutId,
    clearPendingChanges,
    clearPendingChangeAndTimeoutId,
}
