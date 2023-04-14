interface SheetsState {
    pending: SheetsPending[],
    timeoutId: NodeJS.Timeout
}

interface SheetsPending {
    operationType: number,
    date: number,
    material: string,
    parameters: any[],
    doneParameters?: any[],
}

const OPERATION_TYPE_USE = 0
const OPERATION_TYPE_BUY_PER_K = 1
const OPERATION_TYPE_BUY_STACKABLE = 2
const OPERATION_TYPE_REFINE = 3
const OPERATION_TYPE_ORDER = 4
const OPERATION_TYPE_AUCTION = 5
const OPERATION_TYPE_SOLD_ACTIVE = 6
const OPERATION_TYPE_REFINED_BUY_MATERIAL = 7
const OPERATION_TYPE_REFINED_ORDER_MATERIAL = 8
const OPERATION_TYPE_REFINED_USE_MATERIAL = 9
const OPERATION_TYPE_REFINED_REFINE_MATERIAL = 10

export {
    OPERATION_TYPE_USE,
    OPERATION_TYPE_BUY_PER_K,
    OPERATION_TYPE_BUY_STACKABLE,
    OPERATION_TYPE_REFINE,
    OPERATION_TYPE_ORDER,
    OPERATION_TYPE_AUCTION,
    OPERATION_TYPE_SOLD_ACTIVE,
    OPERATION_TYPE_REFINED_BUY_MATERIAL,
    OPERATION_TYPE_REFINED_ORDER_MATERIAL,
    OPERATION_TYPE_REFINED_USE_MATERIAL,
    OPERATION_TYPE_REFINED_REFINE_MATERIAL,
    SheetsState,
    SheetsPending,
}
