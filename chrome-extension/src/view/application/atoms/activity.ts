import { atom } from 'jotai'
import { ActivityState, StoredAction, SessionBoundary, SessionType, ActionType, ActionSource } from '../state/activity'
import { ViewItemData } from '../state/history'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { STORAGE_VIEW_ACTIVITY } from '../../../common/const'

// Initial state
const initialActivityState: ActivityState = {
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
        if (stored) {
            set(activityAtom, stored)
        }
        set(activityLoadingAtom, false)
    }
)

// Write atoms (replacing action creators)

export const addActionsAtom = atom(
    null,
    async (get, set, actions: StoredAction[]) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            list: [...actions, ...current.list]
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
        const removedActions = current.list.filter(act => actionIds.includes(act.id))
        const newState = {
            ...current,
            list: current.list.filter(act => !actionIds.includes(act.id))
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
            list: [],
            lastProcessedInventoryKey: undefined
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const setLastProcessedKeyAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            lastProcessedInventoryKey: key
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
            lastProcessedLogSerial: serial
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const createNewSessionAtom = atom(
    null,
    async (get, set) => {
        const current = get(activityAtom)
        const nextSessionNumber = current.sessions.length + 1
        const newSession: SessionBoundary = {
            id: crypto.randomUUID(),
            name: `Session ${nextSessionNumber}`,
            type: 'unknown',
            startTime: Date.now()
        }
        const newState = {
            ...current,
            sessions: [...current.sessions, newSession].sort((a, b) => a.startTime - b.startTime),
            expandedSessions: [...current.expandedSessions, newSession.id]
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
            sessions: current.sessions.map(s =>
                s.id === sessionId ? { ...s, name } : s
            )
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
            sessions: current.sessions.map(s =>
                s.id === sessionId ? { ...s, type: sessionType } : s
            )
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const updateExpandedSessionsAtom = atom(
    null,
    async (get, set, expanded: string[]) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            expandedSessions: expanded
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
            expandedActionRows: expanded
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
            sessions: current.sessions.map(s =>
                s.id === sessionId ? { ...s, inventory } : s
            )
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
            list: current.list.map(act =>
                act.id === actionId ? { ...act, budgetName } : act
            )
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const setShowActionsAtom = atom(
    null,
    async (get, set, showActions: boolean) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            showActions
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const excludeItemAtom = atom(
    null,
    async (get, set, { sessionId, itemName }: { sessionId: string; itemName: string }) => {
        const current = get(activityAtom)
        const currentList = current.sessionBlacklist?.[sessionId] || []
        if (currentList.includes(itemName)) return

        const newState = {
            ...current,
            sessionBlacklist: {
                ...current.sessionBlacklist,
                [sessionId]: [...currentList, itemName]
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
        const currentList = current.sessionBlacklist?.[sessionId] || []
        const newState = {
            ...current,
            sessionBlacklist: {
                ...current.sessionBlacklist,
                [sessionId]: currentList.filter(n => n !== itemName)
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
        const currentList = current.permanentItemBlacklist?.[sessionType] || []

        let newList: string[]
        if (value) {
            if (currentList.includes(itemName)) return
            newList = [...currentList, itemName]
        } else {
            newList = currentList.filter(n => n !== itemName)
        }

        const newState = {
            ...current,
            permanentItemBlacklist: {
                ...current.permanentItemBlacklist,
                [sessionType]: newList
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
        const currentList = current.sessionActionBlacklist?.[sessionId] || []
        if (currentList.includes(actionId)) return

        const newState = {
            ...current,
            sessionActionBlacklist: {
                ...current.sessionActionBlacklist,
                [sessionId]: [...currentList, actionId]
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
        const currentList = current.sessionActionBlacklist?.[sessionId] || []
        const newState = {
            ...current,
            sessionActionBlacklist: {
                ...current.sessionActionBlacklist,
                [sessionId]: currentList.filter(id => id !== actionId)
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
        const currentList = current.permanentActionBlacklist?.[sessionType] || []

        let newList: string[]
        if (value) {
            if (currentList.includes(key)) return
            newList = [...currentList, key]
        } else {
            newList = currentList.filter(t => t !== key)
        }

        const newState = {
            ...current,
            permanentActionBlacklist: {
                ...current.permanentActionBlacklist,
                [sessionType]: newList
            }
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const mergeLootWithInventoryAtom = atom(
    null,
    async (get, set, { actionId, inventoryItem }: { actionId: string; inventoryItem: ViewItemData }) => {
        const current = get(activityAtom)
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
        await saveToStorage(newState)
    }
)

export const updateActionTypeAtom = atom(
    null,
    async (get, set, { actionId, type }: { actionId: string; type: ActionType }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            list: current.list.map(act =>
                act.id === actionId ? { ...act, type } : act
            )
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const updateActionItemAtom = atom(
    null,
    async (get, set, { actionId, item }: { actionId: string; item: string }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            list: current.list.map(act =>
                act.id === actionId ? { ...act, item } : act
            )
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

export const updateActionItemsAtom = atom(
    null,
    async (get, set, { actionId, relatedItems }: { actionId: string; relatedItems: ViewItemData[] }) => {
        const current = get(activityAtom)
        const newState = {
            ...current,
            list: current.list.map(act =>
                act.id === actionId ? { ...act, relatedItems } : act
            )
        }
        set(activityAtom, newState)
        await saveToStorage(newState)
    }
)

// Re-infer session actions (complex operation - needs session boundaries)
export const reinferSessionActionsAtom = atom(
    null,
    async (get, set, sessionId: string) => {
        // Import helpers inline to avoid circular dependencies
        const { inferActions, reverseInferActions } = await import('../helpers/actionInference')

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
        subscribers.onActionsAdded.forEach(cb => cb(newStoredActions))
    }
)
