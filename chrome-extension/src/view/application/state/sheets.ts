interface SheetsState {
    pending: Array<SheetsPending>,
    timeoutId: NodeJS.Timeout
}

interface SheetsPending {
    operation: number,
    changeFunc: (sheet: any) => number,
    doneFunc: (row: number) => Array<any>
}

export {
    SheetsState
}
