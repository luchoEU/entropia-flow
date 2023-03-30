import { SheetsState } from "../state/sheets"
import { MATERIAL_DW, MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_NX, MATERIAL_ST, MATERIAL_SW } from "./materials"

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
    { // OPERATION_TYPE_BUY_PER_K
        [MATERIAL_SW]: 'buySweat'
    },
    { // OPERATION_TYPE_BUY_STACKABLE
        [MATERIAL_NX]: 'buyNexus',
        [MATERIAL_ME]: 'buyME',
        [MATERIAL_LME]: 'buyLME',
        [MATERIAL_NB]: 'buyNB',
        [MATERIAL_DW]: 'buyDiluted',
        [MATERIAL_ST]: 'buySweetstuff',
    },
]

const operationDoneFunc = [
    undefined, // OPERATION_TYPE_USE
    undefined, // OPERATION_TYPE_BUY_PER_K
    undefined, // OPERATION_TYPE_BUY_STACKABLE
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
