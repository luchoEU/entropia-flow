import { addActive, removeActive } from "../actions/actives"
import { SheetsState } from "../state/sheets"
import { budgetGetCreateParams } from "./refined"

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

const setTimeoutId = (state: SheetsState, timeoutId: number) => ({
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

const loadSheetParams: { [n: string]: any } = {
    'loadBudgetSheet': budgetGetCreateParams,
}

const operationChangeFunc: string[] = [
    'addLine', // OPERATION_TYPE_REFINED_SOLD_ACTIVE
    'addLine', // OPERATION_TYPE_REFINED_AUCTION_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_BUY_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_ORDER_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_USE_MATERIAL
    'addLine', // OPERATION_TYPE_REFINED_REFINE_MATERIAL
]

const operationDoneFunc = [
    removeActive, // OPERATION_TYPE_REFINED_SOLD_ACTIVE
    addActive, // OPERATION_TYPE_REFINED_AUCTION_MATERIAL
    undefined, // OPERATION_TYPE_REFINED_BUY_MATERIAL
    undefined, // OPERATION_TYPE_REFINED_ORDER_MATERIAL
    undefined, // OPERATION_TYPE_REFINED_USE_MATERIAL
    undefined, // OPERATION_TYPE_REFINED_REFINE_MATERIAL
]

export {
    initialState,
    addPendingChange,
    setTimeoutId,
    clearPendingChanges,
    clearPendingChangeAndTimeoutId,
    loadSheetFunc,
    loadSheetParams,
    operationChangeFunc,
    operationDoneFunc,
}
