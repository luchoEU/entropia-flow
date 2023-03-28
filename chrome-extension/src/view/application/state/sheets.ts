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

export {
    OPERATION_TYPE_USE,
    SheetsState,
}
