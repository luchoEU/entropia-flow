import { atom } from 'jotai'
import { ActivityState, StoredAction, ActivityItem, ActivitySession, SessionType, ActionType, ActionSource, ShowActionsType } from '../state/activity'
import { ViewItemData } from '../state/history'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { STORAGE_VIEW_ACTIVITY } from '../../../common/const'
import { lastPersistedAtom, lastComputedAtom } from './last'
import messagesApi from '../../services/api/messages'

// Initial state
const initialActivityState: ActivityState = {
    schema: 1,
    data: {
        items: [],
        autoActions: [],
        userActions: [],
        sessions: []
    },
    lastProcessed: {
        inventoryKey: undefined,
        clientLogSerial: undefined
    },
    ui: {
        expanded: {
            sessions: [],
            actionRows: []
        },
        showActions: 'items'
    },
    blacklist: {
        session: {},
        sessionAction: {},
        permanentItem: { unknown: [], hunt: [], mine: [], craft: [] },
        permanentAction: { unknown: [], hunt: [], mine: [], craft: [] }
    }
}

// Writable atom for deleted session
export const lastDeletedSessionAtom = atom<
    { session: ActivitySession; actions: StoredAction[] } | null,
    [{ session: ActivitySession; actions: StoredAction[] } | null],
    void
>(
    null,
    (_get, set, newValue) => {
        set(lastDeletedSessionAtom as any, newValue)
    }
)

// Base atom for activity state
export const activityAtom = atom<ActivityState>(initialActivityState)

// Loading state atom
export const activityLoadingAtom = atom<boolean>(true)

// Persistence helper - saves state to chrome storage
const saveToStorage = async (state: ActivityState) => {
    await LOCAL_STORAGE.set(STORAGE_VIEW_ACTIVITY, state)
}

// Load from storage helper
const loadFromStorage = async (): Promise<ActivityState | null> => {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_ACTIVITY)
}

// Subscription system for cross-domain communication
type ActionsAddedCallback = (actions: StoredAction[]) => void
type ActionsRemovedCallback = (actionIds: string[], removedActions: StoredAction[]) => void

interface ActivitySubscribers {
    onActionsAdded: ActionsAddedCallback[]
    onActionsRemoved: ActionsRemovedCallback[]
}

export const activitySubscribersAtom = atom<ActivitySubscribers>({
    onActionsAdded: [],
    onActionsRemoved: []
})

// Subscribe to activity changes
export const subscribeToActivityAtom = atom(
    null,
    (get, set, callbacks: { onActionsAdded?: ActionsAddedCallback; onActionsRemoved?: ActionsRemovedCallback }) => {
        const current = get(activitySubscribersAtom)
        const newOnActionsAdded = callbacks.onActionsAdded
            ? [...current.onActionsAdded, callbacks.onActionsAdded]
            : current.onActionsAdded
        const newOnActionsRemoved = callbacks.onActionsRemoved
            ? [...current.onActionsRemoved, callbacks.onActionsRemoved]
            : current.onActionsRemoved
        set(activitySubscribersAtom, {
            onActionsAdded: newOnActionsAdded,
            onActionsRemoved: newOnActionsRemoved
        })
    }
)

// Initialize activity state from storage
export const initializeActivityAtom = atom(
    null,
    async (get, set) => {
        const stored = await loadFromStorage()
        if (stored && stored.schema === initialActivityState.schema) {
            // Merge with initial state to ensure all properties exist (handles migrations)
            set(activityAtom, { ...initialActivityState, ...stored })
        } else {
            set(activityAtom, initialActivityState)
        }
        set(activityLoadingAtom, false)
    }
)

// Write atoms (replacing action creators)

export const addInventoryAndActionsAtom = atom(
    null,
    async (get, set, { inventoryItems, actions }: { inventoryItems: ActivityItem[], actions: StoredAction[] }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                items: [...inventoryItems, ...current.data.items],
                autoActions: [...actions, ...current.data.autoActions]
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)

        // Notify subscribers
        const subscribers = get(activitySubscribersAtom)
        subscribers.onActionsAdded.forEach(cb => cb(actions))
    }
)

export const addActionsAtom = atom(
    null,
    async (get, set, actions: StoredAction[]) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                autoActions: [...actions, ...current.data.autoActions]
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)

        // Notify subscribers
        const subscribers = get(activitySubscribersAtom)
        subscribers.onActionsAdded.forEach(cb => cb(actions))
    }
)

export const removeActionsAtom = atom(
    null,
    async (get, set, actionIds: string[]) => {
        const current = get(activityAtom)
        const removedActions = current.data.autoActions.filter(act => actionIds.includes(act.id))
        const newState = {
            ...current,
            data: {
                ...current.data,
                autoActions: current.data.autoActions.filter(act => !actionIds.includes(act.id))
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)

        // Notify subscribers
        const subscribers = get(activitySubscribersAtom)
        subscribers.onActionsRemoved.forEach(cb => cb(actionIds, removedActions))
    }
)

export const clearActionsAtom = atom(
    null,
    async (get, set) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                items: []
            },
            lastProcessed: {
                ...current.lastProcessed,
                inventoryKey: undefined
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const resetAllActivityDataAtom = atom(
    null,
    async (_get, set) => {
        // Completely reset to initial state
        set(activityAtom, initialActivityState)
        await saveToStorage(initialActivityState)
    }
)

export const setLastProcessedKeyAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            lastProcessed: {
                ...current.lastProcessed,
                inventoryKey: key
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const setLastProcessedLogSerialAtom = atom(
    null,
    async (get, set, serial: number) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            lastProcessed: {
                ...current.lastProcessed,
                clientLogSerial: serial
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const createNewSessionAtom = atom(
    null,
    async (get, set) => {
        // Also set current inventory as session start (same as setLastAtom)
        const lastComputed = get(lastComputedAtom)
        if (lastComputed.latestInventoryKey) {
            messagesApi.requestSetLast(true, lastComputed.latestInventoryKey)
        }
        // Reset last UI state
        const lastPersisted = get(lastPersistedAtom)
        const newLastState = {
            ...lastPersisted,
            expanded: false,
            peds: [],
            notificationsDone: []
        }
        set(lastPersistedAtom, newLastState)
        await LOCAL_STORAGE.set('view.last', newLastState)

        // Create new activity session
        // If not initialized yet, load from storage to avoid overwriting existing sessions
        const isLoading = get(activityLoadingAtom)
        let current = get(activityAtom)
        if (isLoading) {
            const stored = await loadFromStorage()
            if (stored) {
                current = stored
                set(activityAtom, stored)
                set(activityLoadingAtom, false)
            }
        }

        const nextSessionNumber = current.data.sessions.length + 1
        const newSession: ActivitySession = {
            id: crypto.randomUUID(),
            name: `Session ${nextSessionNumber}`,
            type: 'unknown',
            startTime: Date.now()
        }
        const newState = {
            ...current,
            data: {
                ...current.data,
                sessions: [...current.data.sessions, newSession].sort((a, b) => a.startTime - b.startTime)
            },
            ui: {
                ...current.ui,
                expanded: {
                    ...current.ui.expanded,
                    sessions: [...current.ui.expanded.sessions, newSession.id]
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
        return newSession
    }
)

export const updateSessionNameAtom = atom(
    null,
    async (get, set, { sessionId, name }: { sessionId: string; name: string }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                sessions: current.data.sessions.map(s =>
                    s.id === sessionId ? { ...s, name } : s
                )
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const updateSessionTypeAtom = atom(
    null,
    async (get, set, { sessionId, sessionType }: { sessionId: string; sessionType: SessionType }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                sessions: current.data.sessions.map(s =>
                    s.id === sessionId ? { ...s, type: sessionType } : s
                )
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const deleteSessionAtom = atom(
    null,
    async (get, set, sessionId: string) => {
        const current = get(activityAtom)
        const session = current.data.sessions.find(s => s.id === sessionId)
        if (!session) return

        // Find actions in this session
        const sessionIndex = current.data.sessions.indexOf(session)
        const nextSession = current.data.sessions[sessionIndex + 1]
        const endTime = nextSession ? nextSession.startTime : Date.now()
        const sessionActions = current.data.autoActions.filter(act =>
            act.timestamp >= session.startTime && act.timestamp < endTime
        )

        // Remove session and actions
        const newSessions = current.data.sessions.filter(s => s.id !== sessionId)
        const newAutoActions = current.data.autoActions.filter(act => !sessionActions.includes(act))

        // Clean up blacklists
        const { [sessionId]: _, ...newSessionBlacklist } = current.blacklist.session
        const { [sessionId]: __, ...newSessionActionBlacklist } = current.blacklist.sessionAction

        const newState = {
            ...current,
            data: {
                ...current.data,
                sessions: newSessions,
                autoActions: newAutoActions
            },
            blacklist: {
                ...current.blacklist,
                session: newSessionBlacklist,
                sessionAction: newSessionActionBlacklist
            },
            ui: {
                ...current.ui,
                expanded: {
                    ...current.ui.expanded,
                    sessions: current.ui.expanded.sessions.filter(id => id !== sessionId)
                }
            }
        }

        // Store deleted session separately for undo
        set(lastDeletedSessionAtom, { session, actions: sessionActions })
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const undoDeleteSessionAtom = atom(
    null,
    async (get, set) => {
        const current = get(activityAtom)
        const deleted = get(lastDeletedSessionAtom)
        if (!deleted) return

        const { session, actions } = deleted
        const newSessions = [...current.data.sessions, session].sort((a, b) => a.startTime - b.startTime)
        const newAutoActions = [...actions, ...current.data.autoActions]

        const newState = {
            ...current,
            data: {
                ...current.data,
                sessions: newSessions,
                autoActions: newAutoActions
            }
        }
        set(activityAtom, newState)
        set(lastDeletedSessionAtom, null)
        await saveToStorage(newState)
    }
)

export const updateExpandedSessionsAtom = atom(
    null,
    async (get, set, expanded: string[]) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            ui: {
                ...current.ui,
                expanded: {
                    ...current.ui.expanded,
                    sessions: expanded
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const updateExpandedActionRowsAtom = atom(
    null,
    async (get, set, expanded: string[]) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            ui: {
                ...current.ui,
                expanded: {
                    ...current.ui.expanded,
                    actionRows: expanded
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const updateSessionInventoryAtom = atom(
    null,
    async (get, set, { sessionId, inventory }: { sessionId: string; inventory?: { total: number; items: number } }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                sessions: current.data.sessions.map(s =>
                    s.id === sessionId ? { ...s, inventory } : s
                )
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const updateActionBudgetNameAtom = atom(
    null,
    async (get, set, { actionId, budgetName }: { actionId: string; budgetName: string }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                autoActions: current.data.autoActions.map(act =>
                    act.id === actionId ? { ...act, budgetName } : act
                )
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const setShowActionsAtom = atom(
    null,
    async (get, set, showActions: ShowActionsType) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            ui: {
                ...current.ui,
                showActions
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const excludeItemAtom = atom(
    null,
    async (get, set, { sessionId, itemName }: { sessionId: string; itemName: string }) => {
        const current = get(activityAtom)
        const currentList = current.blacklist.session?.[sessionId] || []
        if (currentList.includes(itemName)) return

        const newState = {
            ...current,
            blacklist: {
                ...current.blacklist,
                session: {
                    ...current.blacklist.session,
                    [sessionId]: [...currentList, itemName]
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const includeItemAtom = atom(
    null,
    async (get, set, { sessionId, itemName }: { sessionId: string; itemName: string }) => {
        const current = get(activityAtom)
        const currentList = current.blacklist.session?.[sessionId] || []
        const newState = {
            ...current,
            blacklist: {
                ...current.blacklist,
                session: {
                    ...current.blacklist.session,
                    [sessionId]: currentList.filter(n => n !== itemName)
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const permanentExcludeItemAtom = atom(
    null,
    async (get, set, { sessionType, itemName, value }: { sessionType: SessionType; itemName: string; value: boolean }) => {
        const current = get(activityAtom)
        const currentList = current.blacklist.permanentItem?.[sessionType] || []

        let newList: string[]
        if (value) {
            if (currentList.includes(itemName)) return
            newList = [...currentList, itemName]
        } else {
            newList = currentList.filter(n => n !== itemName)
        }

        const newState = {
            ...current,
            blacklist: {
                ...current.blacklist,
                permanentItem: {
                    ...current.blacklist.permanentItem,
                    [sessionType]: newList
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const excludeActionAtom = atom(
    null,
    async (get, set, { sessionId, actionId }: { sessionId: string; actionId: string }) => {
        const current = get(activityAtom)
        const currentList = current.blacklist.sessionAction?.[sessionId] || []
        if (currentList.includes(actionId)) return

        const newState = {
            ...current,
            blacklist: {
                ...current.blacklist,
                sessionAction: {
                    ...current.blacklist.sessionAction,
                    [sessionId]: [...currentList, actionId]
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const includeActionAtom = atom(
    null,
    async (get, set, { sessionId, actionId }: { sessionId: string; actionId: string }) => {
        const current = get(activityAtom)
        const currentList = current.blacklist.sessionAction?.[sessionId] || []
        const newState = {
            ...current,
            blacklist: {
                ...current.blacklist,
                sessionAction: {
                    ...current.blacklist.sessionAction,
                    [sessionId]: currentList.filter(id => id !== actionId)
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const permanentExcludeActionAtom = atom(
    null,
    async (get, set, { sessionType, actionType, itemName, value }: { sessionType: SessionType; actionType: string; itemName: string; value: boolean }) => {
        const current = get(activityAtom)
        const key = `${actionType}:${itemName}`
        const currentList = current.blacklist.permanentAction?.[sessionType] || []

        let newList: string[]
        if (value) {
            if (currentList.includes(key)) return
            newList = [...currentList, key]
        } else {
            newList = currentList.filter(t => t !== key)
        }

        const newState = {
            ...current,
            blacklist: {
                ...current.blacklist,
                permanentAction: {
                    ...current.blacklist.permanentAction,
                    [sessionType]: newList
                }
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

// TODO: Implement for new dual storage structure
export const mergeLootWithInventoryAtom = atom(
    null,
    async (get, set, { actionId, inventoryItem }: { actionId: string; inventoryItem: ViewItemData }) => {
        /*const current = get(activityAtom)
        const newState = {
            ...current,
            list: current.list.map(act => {
                if (act.id !== actionId) return act

                const newSources: ActionSource[] = act.sources.includes('inventory')
                    ? [...act.sources]
                    : [...act.sources, 'inventory']

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
        set(activityAtom, newState)
        await saveToStorage(newState)*/
        // Temporarily disabled during refactoring
        console.warn('mergeLootWithInventoryAtom not yet implemented for new structure')
    }
)

export const updateActionTypeAtom = atom(
    null,
    async (get, set, { actionId, type }: { actionId: string; type: ActionType }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            data: {
                ...current.data,
                autoActions: current.data.autoActions.map(act =>
                    act.id === actionId ? { ...act, type } : act
                )
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

// TODO: Update for new dual storage architecture
export const updateActionItemAtom = atom(
    null,
    async (get, set, { actionId, item }: { actionId: string; item: string }) => {
        // Temporarily disabled - actions no longer have individual item names
        console.warn('updateActionItemAtom not implemented for new structure')
    }
)

// TODO: Update for new dual storage architecture
export const updateActionItemsAtom = atom(
    null,
    async (get, set, { actionId, relatedItems }: { actionId: string; relatedItems: ViewItemData[] }) => {
        // Temporarily disabled - relatedItems are now number[] IDs
        console.warn('updateActionItemsAtom not implemented for new structure')
    }
)

// Re-infer session actions (complex operation - needs session boundaries)
// TODO: Implement for new dual storage structure
export const reinferSessionActionsAtom = atom(
    null,
    async (get, set, sessionId: string) => {
        // Import helpers inline to avoid circular dependencies
        /*const { inferActions, reverseInferActions } = await import('../helpers/actionInference')

        const current = get(activityAtom)
        const session = current.sessions.find(s => s.id === sessionId)
        if (!session) return

        const sessionIndex = current.sessions.indexOf(session)
        const nextSession = current.sessions[sessionIndex + 1]
        const endTime = nextSession ? nextSession.startTime : Date.now()

        // Find actions in this session
        const sessionActions = current.list.filter(act =>
            act.timestamp >= session.startTime && act.timestamp < endTime
        )

        if (sessionActions.length === 0) return

        // Group actions by timestamp
        const actionsByTimestamp = new Map<number, StoredAction[]>()
        for (const act of sessionActions) {
            if (!actionsByTimestamp.has(act.timestamp)) {
                actionsByTimestamp.set(act.timestamp, [])
            }
            actionsByTimestamp.get(act.timestamp)!.push(act)
        }

        // Re-infer for each timestamp
        const newStoredActions: StoredAction[] = []
        for (const [timestamp, acts] of actionsByTimestamp) {
            const items = reverseInferActions(acts)
            const newInferredActions = inferActions(items)

            const timestampActions: StoredAction[] = newInferredActions.map(inferred => ({
                ...inferred,
                id: crypto.randomUUID(),
                timestamp,
                sources: ['inventory'] as ActionSource[]
            }))

            newStoredActions.push(...timestampActions)
        }

        // Remove old actions and add new ones
        const oldActionIds = sessionActions.map(act => act.id)
        const subscribers = get(activitySubscribersAtom)

        // Notify about removal
        subscribers.onActionsRemoved.forEach(cb => cb(oldActionIds, sessionActions))

        const newState = {
            ...current,
            list: [
                ...newStoredActions,
                ...current.list.filter(act => !oldActionIds.includes(act.id))
            ]
        }
        set(activityAtom, newState)
        await saveToStorage(newState)

        // Notify about addition
        subscribers.onActionsAdded.forEach(cb => cb(newStoredActions))*/
        // Temporarily disabled during refactoring
        console.warn('reinferSessionActionsAtom not yet implemented for new structure')
    }
)
