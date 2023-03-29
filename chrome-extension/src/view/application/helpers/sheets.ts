import { SheetsState } from "../state/sheets"
import { MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_SW } from "./materials"

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

const operationChangeFunc = [
    { // OPERATION_TYPE_USE
        [MATERIAL_ME]: 'useME',
        [MATERIAL_LME]: 'useLME',
        [MATERIAL_NB]: 'useNB',
    },
    { // OPERATION_TYPE_BUY
        [MATERIAL_SW]: 'buySweat'
    }
]

const operationDoneFunc = [
    undefined, // OPERATION_TYPE_USE
    undefined, // OPERATION_TYPE_BUY
]

export {
    initialState,
    addPendingChange,
    setTimeoutId,
    clearPendingChanges,
    clearPendingChangeAndTimeoutId,
    operationChangeFunc,
    operationDoneFunc,
}
