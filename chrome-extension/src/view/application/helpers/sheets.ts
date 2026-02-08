import { SheetsState } from "../state/sheets"

const initialState: SheetsState = {
    pending: [],
    timeoutId: undefined
}

const addPendingChange = (state: SheetsState, operationType: number, date: number, material: string, parameters: any[], doneParameters: any): SheetsState => ({
    ...state,
    pending: [
        ...state.pending,
        {
            operationType,
            date,
            material,
            parameters,
            doneParameters,
        }
    ]
})

const clearPendingChanges = (state: SheetsState): SheetsState => ({
    ...state,
    pending: []
})

const setTimeoutId = (state: SheetsState, timeoutId: NodeJS.Timeout) => ({
    ...state,
    timeoutId
})

const clearPendingChangeAndTimeoutId = (state: SheetsState) => initialState

const loadSheetFunc: string[] = [
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_SOLD_ACTIVE
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_AUCTION_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_BUY_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_ORDER_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_USE_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_REFINE_MATERIAL
]

const operationChangeFunc: string[] = [
    'addLine', // OPERATION_TYPE_REFINED_SOLD_ACTIVE
    'addLine', // OPERATION_TYPE_REFINED_AUCTION_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_BUY_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_ORDER_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_USE_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_REFINE_MATERIAL
]

// operationDoneFunc removed - no longer used in Jotai-based implementation
// Previously mapped Redux actions to operation callbacks

export {
    initialState,
    addPendingChange,
    setTimeoutId,
    clearPendingChanges,
    clearPendingChangeAndTimeoutId,
    loadSheetFunc,
    operationChangeFunc,
}
