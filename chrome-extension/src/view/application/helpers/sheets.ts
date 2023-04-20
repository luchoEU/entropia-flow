import { addActive, removeActive } from "../actions/actives"
import { addOrderToList } from "../actions/order"
import { SheetsState } from "../state/sheets"
import { MATERIAL_DW, MATERIAL_FT, MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_NX, MATERIAL_ST, MATERIAL_SW } from "./materials"
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
    'loadMELogSheet', // OPERATION_TYPE_USE
    'loadMELogSheet', // OPERATION_TYPE_BUY_PER_K
    'loadMELogSheet', // OPERATION_TYPE_BUY_STACKABLE
    'loadMELogSheet', // OPERATION_TYPE_REFINE
    'loadMELogSheet', // OPERATION_TYPE_ORDER
    'loadMELogSheet', // OPERATION_TYPE_AUCTION
    'loadMELogSheet', // OPERATION_TYPE_SOLD_ACTIVE
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_AUCTION_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_BUY_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_ORDER_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_USE_MATERIAL
    'loadBudgetSheet', // OPERATION_TYPE_REFINED_REFINE_MATERIAL
]

const loadSheetParams: { [n: string]: any } = {
    'loadMELogSheet': undefined,
    'loadBudgetSheet': budgetGetCreateParams,
}

const operationChangeFunc: { [n: string]: string }[] = [
    { // OPERATION_TYPE_USE
        [MATERIAL_ME]: 'useME',
        [MATERIAL_LME]: 'useLME',
        [MATERIAL_NB]: 'useNB',
    },
    { // OPERATION_TYPE_BUY_PER_K
        [MATERIAL_SW]: 'buySweat',
        [MATERIAL_FT]: 'buyFruit',
    },
    { // OPERATION_TYPE_BUY_STACKABLE
        [MATERIAL_NX]: 'buyNexus',
        [MATERIAL_ME]: 'buyME',
        [MATERIAL_LME]: 'buyLME',
        [MATERIAL_NB]: 'buyNB',
        [MATERIAL_DW]: 'buyDiluted',
        [MATERIAL_ST]: 'buySweetstuff',
    },
    { // OPERATION_TYPE_REFINE
        [MATERIAL_ME]: 'refineME',
        [MATERIAL_LME]: 'refineLME',
        [MATERIAL_NB]: 'refineNB',
    },
    { // OPERATION_TYPE_ORDER
        [MATERIAL_ME]: 'orderNexus',
    },
    { // OPERATION_TYPE_AUCTION
        [MATERIAL_ME]: 'sellME',
        [MATERIAL_LME]: 'sellLME',
        [MATERIAL_NB]: 'sellNB',
    },
    { // OPERATION_TYPE_SOLD_ACTIVE
        [MATERIAL_ME]: 'meSold',
        [MATERIAL_LME]: 'lmeSold',
        [MATERIAL_NB]: 'nbSold',
    },
    { // OPERATION_TYPE_REFINED_AUCTION_MATERIAL
        [MATERIAL_ME]: 'addLine',
        [MATERIAL_LME]: 'addLine',
        [MATERIAL_NB]: 'addLine',
    },
    { // OPERATION_TYPE_REFINED_BUY_MATERIAL
        [MATERIAL_ME]: '',
        [MATERIAL_LME]: '',
        [MATERIAL_NB]: '',
    },
    { // OPERATION_TYPE_REFINED_ORDER_MATERIAL
        [MATERIAL_ME]: '',
        [MATERIAL_LME]: '',
        [MATERIAL_NB]: '',
    },
    { // OPERATION_TYPE_REFINED_USE_MATERIAL
        [MATERIAL_ME]: '',
        [MATERIAL_LME]: '',
        [MATERIAL_NB]: '',
    },
    { // OPERATION_TYPE_REFINED_REFINE_MATERIAL
        [MATERIAL_ME]: '',
        [MATERIAL_LME]: '',
        [MATERIAL_NB]: '',
    },
]

const operationDoneFunc = [
    undefined, // OPERATION_TYPE_USE
    undefined, // OPERATION_TYPE_BUY_PER_K
    undefined, // OPERATION_TYPE_BUY_STACKABLE
    undefined, // OPERATION_TYPE_REFINE
    addOrderToList, // OPERATION_TYPE_ORDER
    addActive, // OPERATION_TYPE_AUCTION
    removeActive, // OPERATION_TYPE_SOLD_ACTIVE
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
