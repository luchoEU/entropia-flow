import { SheetsState } from "../state/sheets"
import { MATERIAL_DW, MATERIAL_FT, MATERIAL_LME, MATERIAL_ME, MATERIAL_NB, MATERIAL_NX, MATERIAL_ST, MATERIAL_SW } from "./materials"

const initialState: SheetsState = {
    pending: [],
    timeoutId: undefined
}

const addPendingChange = (state: SheetsState, operationType: number, date: number, material: string, parameters: any[]): SheetsState => ({
    ...state,
    pending: [
        ...state.pending,
        {
            operationType,
            date,
            material,
            parameters,
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
]

const operationDoneFunc = [
    undefined, // OPERATION_TYPE_USE
    undefined, // OPERATION_TYPE_BUY_PER_K
    undefined, // OPERATION_TYPE_BUY_STACKABLE
    undefined, // OPERATION_TYPE_REFINE
    'addOrderToList', // OPERATION_TYPE_ORDER
    'addSale', // OPERATION_TYPE_AUCTION
    'removeActive', // OPERATION_TYPE_SOLD_ACTIVE
]

// addSale(row, OPERATION_ME_SOLD, 'Auction ME', s.amount, s.openingValue, s.buyoutValue, s.buyoutFee),
// removeActive(item.date)

export {
    initialState,
    addPendingChange,
    setTimeoutId,
    clearPendingChanges,
    clearPendingChangeAndTimeoutId,
    operationChangeFunc,
    operationDoneFunc,
}
