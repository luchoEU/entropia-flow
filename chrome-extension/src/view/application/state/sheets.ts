interface SHEETS_STATE {
    pending: Array<SHEETS_PENDING>,
    timeoutId: NodeJS.Timeout
}

interface SHEETS_PENDING {
    operation: number,
    changeFunc: (sheet: any) => Promise<number>,
    doneFunc: (row: number) => Array<any>
}

export {
    SHEETS_STATE
}
