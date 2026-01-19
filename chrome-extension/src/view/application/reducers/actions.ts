import { ActionsState, StoredAction, SessionType } from "../state/actions"
import { ADD_ACTIONS, CLEAR_ACTIONS, SET_LAST_PROCESSED_KEY, CREATE_NEW_SESSION, UPDATE_SESSION_NAME, UPDATE_SESSION_TYPE, UPDATE_EXPANDED_SESSIONS, UPDATE_EXPANDED_ACTION_ROWS, UPDATE_SESSION_INVENTORY, SET_ACTIONS_STATE } from "../actions/actions"

const initialState: ActionsState = {
    list: [],
    lastProcessedInventoryKey: undefined,
    sessions: [],
    expandedSessions: [],
    expandedActionRows: []
}

interface AddActionsAction {
    type: typeof ADD_ACTIONS
    payload: { actions: StoredAction[] }
}

interface ClearActionsAction {
    type: typeof CLEAR_ACTIONS
}

interface SetLastProcessedKeyAction {
    type: typeof SET_LAST_PROCESSED_KEY
    payload: { key: number }
}

interface CreateNewSessionAction {
    type: typeof CREATE_NEW_SESSION
}

interface UpdateSessionNameAction {
    type: typeof UPDATE_SESSION_NAME
    payload: { sessionId: string; name: string }
}

interface UpdateSessionTypeAction {
    type: typeof UPDATE_SESSION_TYPE
    payload: { sessionId: string; sessionType: SessionType }
}

interface UpdateExpandedSessionsAction {
    type: typeof UPDATE_EXPANDED_SESSIONS
    payload: { expanded: string[] }
}

interface UpdateExpandedActionRowsAction {
    type: typeof UPDATE_EXPANDED_ACTION_ROWS
    payload: { expanded: string[] }
}

interface UpdateSessionInventoryAction {
    type: typeof UPDATE_SESSION_INVENTORY
    payload: { sessionId: string; inventory?: { total: number; items: number } }
}

interface SetActionsStateAction {
    type: typeof SET_ACTIONS_STATE
    payload: ActionsState
}

type ActionsAction = AddActionsAction | ClearActionsAction | SetLastProcessedKeyAction | CreateNewSessionAction | UpdateSessionNameAction | UpdateSessionTypeAction | UpdateExpandedSessionsAction | UpdateExpandedActionRowsAction | UpdateSessionInventoryAction | SetActionsStateAction

export default (state = initialState, action: ActionsAction): ActionsState => {
    switch (action.type) {
        case ADD_ACTIONS:
            return {
                ...state,
                list: [...action.payload.actions, ...state.list]
            }
        case CLEAR_ACTIONS:
            return {
                ...state,
                list: [],
                lastProcessedInventoryKey: undefined
            }
        case SET_LAST_PROCESSED_KEY:
            return {
                ...state,
                lastProcessedInventoryKey: action.payload.key
            }
        case CREATE_NEW_SESSION:
            const nextSessionNumber = state.sessions.length + 1
            const newSession = {
                id: crypto.randomUUID(),
                name: `Session ${nextSessionNumber}`,
                type: 'unknown' as const,
                startTime: Date.now()
            }
            
            // Get the latest inventory from history to set initial inventory totals
            // Note: This will be updated in the middleware when SET_HISTORY_LIST is called
            return {
                ...state,
                sessions: [...state.sessions, newSession].sort((a, b) => a.startTime - b.startTime),
                expandedSessions: [...state.expandedSessions, newSession.id]
            }
        case UPDATE_SESSION_NAME:
            return {
                ...state,
                sessions: state.sessions.map(s =>
                    s.id === action.payload.sessionId ? { ...s, name: action.payload.name } : s
                )
            }
        case UPDATE_SESSION_TYPE:
            return {
                ...state,
                sessions: state.sessions.map(s =>
                    s.id === action.payload.sessionId ? { ...s, type: action.payload.sessionType } : s
                )
            }
        case UPDATE_EXPANDED_SESSIONS:
            return {
                ...state,
                expandedSessions: action.payload.expanded
            }
        case UPDATE_EXPANDED_ACTION_ROWS:
            return {
                ...state,
                expandedActionRows: action.payload.expanded
            }
        case UPDATE_SESSION_INVENTORY:
            return {
                ...state,
                sessions: state.sessions.map(s =>
                    s.id === action.payload.sessionId ? { ...s, inventory: action.payload.inventory } : s
                )
            }
        case SET_ACTIONS_STATE:
            return action.payload
        default:
            return state
    }
}

export { initialState }
