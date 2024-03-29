const ADD_PENDING_CHANGE = "[sheets] add pending change"
const CLEAR_PENDING_CHANGES = "[sheets] clear pending changes"
const SET_TIMEOUT_ID = "[sheets] set timeout id"
const PERFORM_CHANGE = "[sheets] perform change"
const DONE_PENDING_CHANGES = "[sheets] done pending changes"

const addPendingChange = (operation: number, changeFunc: (sheet: any) => number, doneFunc: (row: number) => Array<any>) => ({
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

const clearPendingChanges = {
    type: CLEAR_PENDING_CHANGES
}

const donePendingChanges = {
    type: DONE_PENDING_CHANGES
}

export {
    ADD_PENDING_CHANGE,
    CLEAR_PENDING_CHANGES,
    SET_TIMEOUT_ID,
    PERFORM_CHANGE,
    DONE_PENDING_CHANGES,
    addPendingChange,
    setTimeoutId,
    performChange,
    clearPendingChanges,
    donePendingChanges
}
