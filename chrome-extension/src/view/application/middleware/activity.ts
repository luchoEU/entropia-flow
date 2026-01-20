import { SET_HISTORY_LIST } from '../actions/history'
import { addActions, setLastProcessedKey, ADD_ACTIONS, CLEAR_ACTIONS, SET_LAST_PROCESSED_KEY, CREATE_NEW_SESSION, UPDATE_SESSION_NAME, UPDATE_SESSION_TYPE, UPDATE_EXPANDED_SESSIONS, UPDATE_EXPANDED_ACTION_ROWS, UPDATE_SESSION_INVENTORY, SET_SHOW_ACTIONS, REINFER_SESSION_ACTIONS, REMOVE_ACTIONS, removeActions, updateSessionInventory, setActionsState } from '../actions/activity'
import { ActivityState, StoredAction } from '../state/activity'
import { HistoryState } from '../state/history'
import { AppAction } from '../slice/app'
import { getActivity } from '../selectors/activity'
import { getHistory } from '../selectors/history'
import { inferActions, reverseInferActions } from '../helpers/actionInference'

const actionsMiddleware = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const prevActionsState = getActivity(getState())
    const prevLastKey = prevActionsState.lastProcessedInventoryKey

    await next(action)

    switch (action.type) {
        case AppAction.INITIALIZE: {
            const actionsState = await api.storage.loadActions()
            if (actionsState)
                dispatch(setActionsState(actionsState))
            break
        }
        case ADD_ACTIONS:
        case CLEAR_ACTIONS:
        case SET_LAST_PROCESSED_KEY:
        case UPDATE_SESSION_NAME:
        case UPDATE_SESSION_TYPE:
        case UPDATE_EXPANDED_SESSIONS:
        case UPDATE_EXPANDED_ACTION_ROWS:
        case UPDATE_SESSION_INVENTORY:
        case SET_SHOW_ACTIONS: {
            const actionsState = getActivity(getState())
            await api.storage.saveActions(actionsState)
            break
        }
        case REINFER_SESSION_ACTIONS: {
            const actionsState = getActivity(getState())
            const session = actionsState.sessions.find(s => s.id === action.payload.sessionId)
            if (!session) break

            const sessionIndex = actionsState.sessions.indexOf(session)
            const nextSession = actionsState.sessions[sessionIndex + 1]
            const endTime = nextSession ? nextSession.startTime : Date.now()

            // Find actions in this session
            const sessionActions = actionsState.list.filter(act =>
                act.timestamp >= session.startTime && act.timestamp < endTime
            )

            if (sessionActions.length === 0) break

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
                // Reverse infer to get items for this timestamp
                const items = reverseInferActions(acts)

                // Re-infer actions
                const newInferredActions = inferActions(items)

                // Create new StoredActions
                const timestampActions: StoredAction[] = newInferredActions.map(inferred => ({
                    ...inferred,
                    id: crypto.randomUUID(), // Use random UUID for new actions
                    timestamp,
                    sources: ['inventory'] as const
                }))

                newStoredActions.push(...timestampActions)
            }

            // Dispatch remove old actions and add new ones
            dispatch(removeActions(sessionActions.map(act => act.id)))
            dispatch(addActions(newStoredActions))

            // Save state after updates
            const updatedActionsState = getActivity(getState())
            await api.storage.saveActions(updatedActionsState)
            break
        }
        case CREATE_NEW_SESSION: {
            const actionsState = getActivity(getState())
            const history = getHistory(getState())

            // Set inventory for new session from latest history element
            let inventory = undefined
            if (history.list.length > 0) {
                const latestInventory = history.list[history.list.length - 1]
                if (latestInventory.rawInventory) {
                    inventory = {
                        total: Number(latestInventory.rawInventory.meta.total) || 0,
                        items: latestInventory.rawInventory.itemlist?.length || 0
                    }
                }
            }
            // Find the newly created session (most recently added)
            const newSession = actionsState.sessions[actionsState.sessions.length - 1]
            if (newSession && inventory) {
                dispatch(updateSessionInventory(newSession.id, inventory))
            }

            await api.storage.saveActions(actionsState)
            break
        }
        case SET_HISTORY_LIST: {
            const history = getHistory(getState())

            // Find new inventory items that haven't been processed yet
            const newActions: StoredAction[] = []

            for (const inventory of history.list) {
                // Skip if already processed
                if (prevLastKey !== undefined && inventory.key <= prevLastKey) {
                    continue
                }

                // Skip if no actions inferred
                if (!inventory.actions || inventory.actions.length === 0) {
                    continue
                }

                // Convert InferredAction to StoredAction
                for (const inferredAction of inventory.actions) {
                    const storedAction: StoredAction = {
                        ...inferredAction,
                        id: `${inventory.key}-${inferredAction.type}-${inferredAction.item}`,
                        timestamp: inventory.key, // The inventory key is the timestamp
                        sources: ['inventory']
                    }
                    newActions.push(storedAction)
                }
            }

            if (newActions.length > 0) {
                dispatch(addActions(newActions))
            }

            // Update lastProcessedInventoryKey
            if (history.list.length > 0) {
                const latestKey = Math.max(...history.list.map(i => i.key))
                if (prevLastKey === undefined || latestKey > prevLastKey) {
                    dispatch(setLastProcessedKey(latestKey))
                }
            }

            // Update session inventory data
            const actionsState = getActivity(getState())
            const sessions = actionsState.sessions

            for (const session of sessions) {
                const endTime = sessions[sessions.indexOf(session) + 1]?.startTime || Date.now()

                // Find the latest inventory within this session's time range
                let latestInventory: any = null
                for (let i = history.list.length - 1; i >= 0; i--) {
                    const item = history.list[i]
                    if (item.key <= endTime && item.key >= session.startTime) {
                        latestInventory = item
                        break
                    }
                }

                const inventory = latestInventory && latestInventory.rawInventory ? {
                    total: Number(latestInventory.rawInventory.meta.total) || 0,
                    items: latestInventory.rawInventory.itemlist?.length || 0
                } : undefined

                if (inventory) {
                    dispatch(updateSessionInventory(session.id, inventory))
                }
            }
            break
        }
    }
}

export default [
    actionsMiddleware
]
