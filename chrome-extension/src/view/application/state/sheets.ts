interface SheetsState {
    pending: SheetsPending[],
    timeoutId: NodeJS.Timeout
}

interface SheetsPending {
    operationType: number,
    material: string,
    parameters: any[]
}

const OPERATION_TYPE_USE = 0
const OPERATOIN_TYPE_BUY = 1

export {
    OPERATION_TYPE_USE,
    OPERATOIN_TYPE_BUY,
    SheetsState,
}
