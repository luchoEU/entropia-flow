const ADD_PENDING_CHANGE = "[sheets] add pending change"
const CLEAR_PENDING_CHANGES = "[sheets] clear pending changes"
const SET_TIMEOUT_ID = "[sheets] set timeout id"
const PERFORM_CHANGE = "[sheets] perform change"
const DONE_PENDING_CHANGES = "[sheets] done pending changes"
const ADD_USE_TO_SHEET = "[sheet] add use sheet"

const addPendingChange = (operationType: number, material: string, parameters: any[]) => ({
    type: ADD_PENDING_CHANGE,
    payload: {
        operationType,
        material,
        parameters
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

const addUseToSheet = (material: string, amount: string) => ({
    type: ADD_USE_TO_SHEET,
    payload: {
        material,
        amount
    }
})

export {
    ADD_PENDING_CHANGE,
    CLEAR_PENDING_CHANGES,
    SET_TIMEOUT_ID,
    PERFORM_CHANGE,
    DONE_PENDING_CHANGES,
    ADD_USE_TO_SHEET,
    addPendingChange,
    setTimeoutId,
    performChange,
    clearPendingChanges,
    donePendingChanges,
    addUseToSheet,
}
