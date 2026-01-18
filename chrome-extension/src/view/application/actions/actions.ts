import { StoredAction } from "../state/actions"

const ADD_ACTIONS = "[actions] add actions"
const CLEAR_ACTIONS = "[actions] clear actions"
const SET_LAST_PROCESSED_KEY = "[actions] set last processed key"

const addActions = (actions: StoredAction[]) => ({
    type: ADD_ACTIONS,
    payload: { actions }
})

const clearActions = () => ({
    type: CLEAR_ACTIONS
})

const setLastProcessedKey = (key: number) => ({
    type: SET_LAST_PROCESSED_KEY,
    payload: { key }
})

export {
    ADD_ACTIONS,
    CLEAR_ACTIONS,
    SET_LAST_PROCESSED_KEY,
    addActions,
    clearActions,
    setLastProcessedKey
}
