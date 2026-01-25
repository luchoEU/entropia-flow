import { StoredAction, SessionType, ActivityState } from "../state/activity"

const ADD_ACTIONS = "[actions] add actions"
const CLEAR_ACTIONS = "[actions] clear actions"
const SET_LAST_PROCESSED_KEY = "[actions] set last processed key"
const CREATE_NEW_SESSION = "[actions] create new session"
const UPDATE_SESSION_NAME = "[actions] update session name"
const UPDATE_SESSION_TYPE = "[actions] update session type"
const UPDATE_EXPANDED_SESSIONS = "[actions] update expanded sessions"
const UPDATE_EXPANDED_ACTION_ROWS = "[actions] update expanded action rows"
const UPDATE_SESSION_INVENTORY = "[actions] update session inventory"
const UPDATE_ACTION_BUDGET_NAME = "[actions] update action budget name"
const SET_SHOW_ACTIONS = "[actions] set show actions"
const SET_ACTIONS_STATE = "[actions] set state"
const REINFER_SESSION_ACTIONS = "[actions] re-infer session actions"
const REMOVE_ACTIONS = "[actions] remove actions"
const EXCLUDE_ITEM = "[actions] exclude item"
const INCLUDE_ITEM = "[actions] include item"
const PERMANENT_EXCLUDE_ITEM = "[actions] permanent exclude item"
const EXCLUDE_ACTION = "[actions] exclude action"
const INCLUDE_ACTION = "[actions] include action"
const PERMANENT_EXCLUDE_ACTION = "[actions] permanent exclude action"

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

const createNewSession = () => ({
    type: CREATE_NEW_SESSION
})

const updateSessionName = (sessionId: string, name: string) => ({
    type: UPDATE_SESSION_NAME,
    payload: { sessionId, name }
})

const updateSessionType = (sessionId: string, sessionType: SessionType) => ({
    type: UPDATE_SESSION_TYPE,
    payload: { sessionId, sessionType }
})

const updateExpandedSessions = (expanded: string[]) => ({
    type: UPDATE_EXPANDED_SESSIONS,
    payload: { expanded }
})

const updateExpandedActionRows = (expanded: string[]) => ({
    type: UPDATE_EXPANDED_ACTION_ROWS,
    payload: { expanded }
})

const updateSessionInventory = (sessionId: string, inventory: { total: number; items: number }) => ({
    type: UPDATE_SESSION_INVENTORY,
    payload: { sessionId, inventory }
})

const updateActionBudgetName = (actionId: string, budgetName: string) => ({
    type: UPDATE_ACTION_BUDGET_NAME,
    payload: { actionId, budgetName }
})

const setShowActions = (showActions: boolean) => ({
    type: SET_SHOW_ACTIONS,
    payload: { showActions }
})

const setActionsState = (state: ActivityState) => ({
    type: SET_ACTIONS_STATE,
    payload: state
})

const reinferSessionActions = (sessionId: string) => ({
    type: REINFER_SESSION_ACTIONS,
    payload: { sessionId }
})

const removeActions = (actionIds: string[]) => ({
    type: REMOVE_ACTIONS,
    payload: { actionIds }
})

const excludeItem = (sessionId: string, itemName: string) => ({
    type: EXCLUDE_ITEM,
    payload: { sessionId, itemName }
})

const includeItem = (sessionId: string, itemName: string) => ({
    type: INCLUDE_ITEM,
    payload: { sessionId, itemName }
})

const permanentExcludeItem = (sessionType: SessionType, itemName: string, value: boolean) => ({
    type: PERMANENT_EXCLUDE_ITEM,
    payload: { sessionType, itemName, value }
})

const excludeAction = (sessionId: string, actionId: string) => ({
    type: EXCLUDE_ACTION,
    payload: { sessionId, actionId }
})

const includeAction = (sessionId: string, actionId: string) => ({
    type: INCLUDE_ACTION,
    payload: { sessionId, actionId }
})

const permanentExcludeAction = (sessionType: SessionType, actionType: string, itemName: string, value: boolean) => ({
    type: PERMANENT_EXCLUDE_ACTION,
    payload: { sessionType, actionType, itemName, value }
})

export {
    ADD_ACTIONS,
    CLEAR_ACTIONS,
    SET_LAST_PROCESSED_KEY,
    CREATE_NEW_SESSION,
    UPDATE_SESSION_NAME,
    UPDATE_SESSION_TYPE,
    UPDATE_EXPANDED_SESSIONS,
    UPDATE_EXPANDED_ACTION_ROWS,
    UPDATE_SESSION_INVENTORY,
    UPDATE_ACTION_BUDGET_NAME,
    SET_SHOW_ACTIONS,
    SET_ACTIONS_STATE,
    REINFER_SESSION_ACTIONS,
    REMOVE_ACTIONS,
    EXCLUDE_ITEM,
    INCLUDE_ITEM,
    PERMANENT_EXCLUDE_ITEM,
    EXCLUDE_ACTION,
    INCLUDE_ACTION,
    PERMANENT_EXCLUDE_ACTION,
    addActions,
    clearActions,
    setLastProcessedKey,
    createNewSession,
    updateSessionName,
    updateSessionType,
    updateExpandedSessions,
    updateExpandedActionRows,
    updateSessionInventory,
    updateActionBudgetName,
    setShowActions,
    setActionsState,
    reinferSessionActions,
    removeActions,
    excludeItem,
    includeItem,
    permanentExcludeItem,
    excludeAction,
    includeAction,
    permanentExcludeAction
}
