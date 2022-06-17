const ADD_PENDING_CHANGE = "[sheets] add pending change"
const SET_TIMEOUT_ID = "[sheets] set timeout id"
const PERFORM_CHANGE = "[sheets] perform change"

const addPendingChange = (operation: number, changeFunc: (sheet: any) => Promise<number>, doneFunc: (row: number) => Array<any>) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operation,
        changeFunc,
        doneFunc
    }
})

const setTimeoutId = (timeoutId: NodeJS.Timeout) => ({
    type: SET_TIMEOUT_ID,
    payload: {
        timeoutId
    }
})

const performChange = {
    type: PERFORM_CHANGE
}

export {
    ADD_PENDING_CHANGE,
    SET_TIMEOUT_ID,
    PERFORM_CHANGE,
    addPendingChange,
    setTimeoutId,
    performChange
}
