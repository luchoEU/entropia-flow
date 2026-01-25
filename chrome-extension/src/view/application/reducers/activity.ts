import { ActivityState, StoredAction, SessionType, ActionSource } from "../state/activity"
import { ViewItemData } from "../state/history"
import { ADD_ACTIONS, CLEAR_ACTIONS, SET_LAST_PROCESSED_KEY, SET_LAST_PROCESSED_LOG_SERIAL, CREATE_NEW_SESSION, UPDATE_SESSION_NAME, UPDATE_SESSION_TYPE, UPDATE_EXPANDED_SESSIONS, UPDATE_EXPANDED_ACTION_ROWS, UPDATE_SESSION_INVENTORY, UPDATE_ACTION_BUDGET_NAME, SET_SHOW_ACTIONS, SET_ACTIONS_STATE, REINFER_SESSION_ACTIONS, REMOVE_ACTIONS, EXCLUDE_ITEM, INCLUDE_ITEM, PERMANENT_EXCLUDE_ITEM, EXCLUDE_ACTION, INCLUDE_ACTION, PERMANENT_EXCLUDE_ACTION, MERGE_LOOT_WITH_INVENTORY } from "../actions/activity"
import { inferActions, reverseInferActions } from "../helpers/actionInference"

const initialState: ActivityState = {
    list: [],
    lastProcessedInventoryKey: undefined,
    lastProcessedLogSerial: undefined,
    sessions: [],
    expandedSessions: [],
    expandedActionRows: [],
    showActions: true,
    sessionBlacklist: {},
    sessionActionBlacklist: {},
    permanentItemBlacklist: { unknown: [], hunt: [], mine: [], craft: [] },
    permanentActionBlacklist: { unknown: [], hunt: [], mine: [], craft: [] }
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

interface SetLastProcessedLogSerialAction {
    type: typeof SET_LAST_PROCESSED_LOG_SERIAL
    payload: { serial: number }
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

interface UpdateActionBudgetNameAction {
    type: typeof UPDATE_ACTION_BUDGET_NAME
    payload: { actionId: string; budgetName: string }
}

interface SetShowActionsAction {
    type: typeof SET_SHOW_ACTIONS
    payload: { showActions: boolean }
}

interface SetActionsStateAction {
    type: typeof SET_ACTIONS_STATE
    payload: ActivityState
}

interface ReinferSessionActionsAction {
    type: typeof REINFER_SESSION_ACTIONS
    payload: { sessionId: string }
}

interface RemoveActionsAction {
    type: typeof REMOVE_ACTIONS
    payload: { actionIds: string[] }
}

interface ExcludeItemAction {
    type: typeof EXCLUDE_ITEM
    payload: { sessionId: string; itemName: string }
}

interface IncludeItemAction {
    type: typeof INCLUDE_ITEM
    payload: { sessionId: string; itemName: string }
}

interface PermanentExcludeItemAction {
    type: typeof PERMANENT_EXCLUDE_ITEM
    payload: { sessionType: SessionType; itemName: string; value: boolean }
}

interface ExcludeActionAction {
    type: typeof EXCLUDE_ACTION
    payload: { sessionId: string; actionId: string }
}

interface IncludeActionAction {
    type: typeof INCLUDE_ACTION
    payload: { sessionId: string; actionId: string }
}

interface PermanentExcludeActionAction {
    type: typeof PERMANENT_EXCLUDE_ACTION
    payload: { sessionType: SessionType; actionType: string; itemName: string; value: boolean }
}

interface MergeLootWithInventoryAction {
    type: typeof MERGE_LOOT_WITH_INVENTORY
    payload: { actionId: string; inventoryItem: ViewItemData }
}

type ActionsAction = AddActionsAction | ClearActionsAction | SetLastProcessedKeyAction | SetLastProcessedLogSerialAction | CreateNewSessionAction | UpdateSessionNameAction | UpdateSessionTypeAction | UpdateExpandedSessionsAction | UpdateExpandedActionRowsAction | UpdateSessionInventoryAction | UpdateActionBudgetNameAction | SetShowActionsAction | SetActionsStateAction | ReinferSessionActionsAction | RemoveActionsAction | ExcludeItemAction | IncludeItemAction | PermanentExcludeItemAction | ExcludeActionAction | IncludeActionAction | PermanentExcludeActionAction | MergeLootWithInventoryAction

export default (state = initialState, action: ActionsAction): ActivityState => {
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
        case SET_LAST_PROCESSED_LOG_SERIAL:
            return {
                ...state,
                lastProcessedLogSerial: action.payload.serial
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
        case UPDATE_ACTION_BUDGET_NAME:
            return {
                ...state,
                list: state.list.map(act =>
                    act.id === action.payload.actionId ? { ...act, budgetName: action.payload.budgetName } : act
                )
            }
        case SET_SHOW_ACTIONS:
            return {
                ...state,
                showActions: action.payload.showActions
            }
        case SET_ACTIONS_STATE:
            return action.payload
        case REMOVE_ACTIONS:
            return {
                ...state,
                list: state.list.filter(act => !action.payload.actionIds.includes(act.id))
            }
        case REINFER_SESSION_ACTIONS:
            // Logic handled in middleware
            return state
        case EXCLUDE_ITEM: {
            const { sessionId, itemName } = action.payload
            const currentList = state.sessionBlacklist?.[sessionId] || []
            if (currentList.includes(itemName)) return state
            return {
                ...state,
                sessionBlacklist: {
                    ...state.sessionBlacklist,
                    [sessionId]: [...currentList, itemName]
                }
            }
        }
        case INCLUDE_ITEM: {
            const { sessionId, itemName } = action.payload
            const currentList = state.sessionBlacklist?.[sessionId] || []
            return {
                ...state,
                sessionBlacklist: {
                    ...state.sessionBlacklist,
                    [sessionId]: currentList.filter(n => n !== itemName)
                }
            }
        }
        case PERMANENT_EXCLUDE_ITEM: {
            const { sessionType, itemName, value } = action.payload
            const currentList = state.permanentItemBlacklist?.[sessionType] || []
            if (value) {
                if (currentList.includes(itemName)) return state
                return {
                    ...state,
                    permanentItemBlacklist: {
                        ...state.permanentItemBlacklist,
                        [sessionType]: [...currentList, itemName]
                    }
                }
            } else {
                return {
                    ...state,
                    permanentItemBlacklist: {
                        ...state.permanentItemBlacklist,
                        [sessionType]: currentList.filter(n => n !== itemName)
                    }
                }
            }
        }
        case EXCLUDE_ACTION: {
            const { sessionId, actionId } = action.payload
            const currentList = state.sessionActionBlacklist?.[sessionId] || []
            if (currentList.includes(actionId)) return state
            return {
                ...state,
                sessionActionBlacklist: {
                    ...state.sessionActionBlacklist,
                    [sessionId]: [...currentList, actionId]
                }
            }
        }
        case INCLUDE_ACTION: {
            const { sessionId, actionId } = action.payload
            const currentList = state.sessionActionBlacklist?.[sessionId] || []
            return {
                ...state,
                sessionActionBlacklist: {
                    ...state.sessionActionBlacklist,
                    [sessionId]: currentList.filter(id => id !== actionId)
                }
            }
        }
        case PERMANENT_EXCLUDE_ACTION: {
            const { sessionType, actionType, itemName, value } = action.payload
            const key = `${actionType}:${itemName}`
            const currentList = state.permanentActionBlacklist?.[sessionType] || []
            if (value) {
                if (currentList.includes(key)) return state
                return {
                    ...state,
                    permanentActionBlacklist: {
                        ...state.permanentActionBlacklist,
                        [sessionType]: [...currentList, key]
                    }
                }
            } else {
                return {
                    ...state,
                    permanentActionBlacklist: {
                        ...state.permanentActionBlacklist,
                        [sessionType]: currentList.filter(t => t !== key)
                    }
                }
            }
        }
        case MERGE_LOOT_WITH_INVENTORY: {
            const { actionId, inventoryItem } = action.payload
            return {
                ...state,
                list: state.list.map(act => {
                    if (act.id !== actionId) return act

                    // Add 'inventory' to sources if not present
                    const newSources: ActionSource[] = act.sources.includes('inventory')
                        ? [...act.sources]
                        : [...act.sources, 'inventory']

                    // Update relatedItems: for matching items, change container from LOOT to "CARRIED +LOOT"
                    const newRelatedItems = act.relatedItems.map(item => {
                        if (item.n === inventoryItem.n && item.c === 'LOOT') {
                            return {
                                ...item,
                                c: `${inventoryItem.c} +LOOT`
                            }
                        }
                        return item
                    })

                    return {
                        ...act,
                        sources: newSources,
                        relatedItems: newRelatedItems
                    }
                })
            }
        }
        default:
            return state
    }
}

export { initialState }
