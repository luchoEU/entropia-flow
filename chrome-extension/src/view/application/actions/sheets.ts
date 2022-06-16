const ADD_PENDING_CHANGE = "[sheets] add pending change"

const addPendingChange = (operation: number, changeFunc: (sheet: any) => Promise<void>, doneFunc: (row: number) => Array<any>) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operation,
        changeFunc,
        doneFunc
    }
})

export {
    ADD_PENDING_CHANGE,
    addPendingChange
}
