import { SET_HISTORY_LIST } from '../actions/history'
import { SET_CURRENT_GAME_LOG } from '../actions/log'
import { addActions, setLastProcessedKey, setLastProcessedLogSerial, ADD_ACTIONS, CLEAR_ACTIONS, SET_LAST_PROCESSED_KEY, SET_LAST_PROCESSED_LOG_SERIAL, CREATE_NEW_SESSION, UPDATE_SESSION_NAME, UPDATE_SESSION_TYPE, UPDATE_EXPANDED_SESSIONS, UPDATE_EXPANDED_ACTION_ROWS, UPDATE_SESSION_INVENTORY, SET_SHOW_ACTIONS, REINFER_SESSION_ACTIONS, REMOVE_ACTIONS, MERGE_LOOT_WITH_INVENTORY, removeActions, updateSessionInventory, setActionsState, mergeLootWithInventory } from '../actions/activity'
import { StoredAction } from '../state/activity'
import { AppAction } from '../slice/app'
import { getActivity } from '../selectors/activity'
import { getHistory } from '../selectors/history'
import { getGameLog } from '../selectors/log'
import { inferActions, reverseInferActions, matchLootWithInventory } from '../helpers/actionInference'
import { GameLogData } from '../../../background/client/gameLogData'

const actionsMiddleware = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    const prevActionsState = getActivity(getState())
    const prevLastKey = prevActionsState.lastProcessedInventoryKey
    const prevLastLogSerial = prevActionsState.lastProcessedLogSerial

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
        case SET_LAST_PROCESSED_LOG_SERIAL:
        case UPDATE_SESSION_NAME:
        case UPDATE_SESSION_TYPE:
        case UPDATE_EXPANDED_SESSIONS:
        case UPDATE_EXPANDED_ACTION_ROWS:
        case UPDATE_SESSION_INVENTORY:
        case SET_SHOW_ACTIONS:
        case MERGE_LOOT_WITH_INVENTORY: {
            const actionsState = getActivity(getState())
            await api.storage.saveActions(actionsState)
            break
        }
        case SET_CURRENT_GAME_LOG: {
            const gameLog: GameLogData = action.payload.gameLog
            if (!gameLog.raw || gameLog.raw.length === 0) break

            // Group loot events by timestamp
            const lootByTimestamp = new Map<number, { serial: number; loot: { name: string; quantity: number; value: number } }[]>()
            let maxSerial = prevLastLogSerial || 0

            for (const line of gameLog.raw) {
                // Skip if already processed
                if (prevLastLogSerial !== undefined && line.serial <= prevLastLogSerial) {
                    continue
                }

                // Collect loot events grouped by timestamp
                if (line.data.loot) {
                    if (!lootByTimestamp.has(line.time)) {
                        lootByTimestamp.set(line.time, [])
                    }
                    lootByTimestamp.get(line.time)!.push({
                        serial: line.serial,
                        loot: line.data.loot
                    })
                }

                if (line.serial > maxSerial) {
                    maxSerial = line.serial
                }
            }

            // Create one action per timestamp with all loot items
            const newLootActions: StoredAction[] = []
            for (const [timestamp, lootItems] of lootByTimestamp) {
                const totalValue = lootItems.reduce((sum, item) => sum + item.loot.value, 0)
                const relatedItems = lootItems.map(item => ({
                    key: item.serial,
                    n: item.loot.name,
                    q: String(item.loot.quantity),
                    v: item.loot.value.toFixed(2),
                    c: 'LOOT'
                }))
                const minSerial = Math.min(...lootItems.map(item => item.serial))

                const itemNames = lootItems.map(item => item.loot.name)
                const displayName = itemNames.length > 3
                    ? `${itemNames.slice(0, 3).join(', ')} and ${itemNames.length - 3} more`
                    : itemNames.join(', ')

                const storedAction: StoredAction = {
                    type: 'loot',
                    item: displayName,
                    amount: lootItems.reduce((sum, item) => sum + item.loot.value, 0),
                    value: totalValue,
                    relatedItems,
                    id: `loot-${minSerial}`,
                    timestamp,
                    sources: ['client']
                }
                newLootActions.push(storedAction)
            }

            if (newLootActions.length > 0) {
                dispatch(addActions(newLootActions))
            }

            // Update lastProcessedLogSerial
            if (maxSerial > (prevLastLogSerial || 0)) {
                dispatch(setLastProcessedLogSerial(maxSerial))
            }
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
            const actionsState = getActivity(getState())

            // Get existing loot actions (type 'loot' with 'client' source, not yet merged with inventory)
            const existingLootActions = actionsState.list.filter(
                act => act.type === 'loot' && act.sources.includes('client')
            )

            // Find new inventory items that haven't been processed yet
            const newActions: StoredAction[] = []

            for (const inventory of history.list) {
                // Skip if already processed
                if (prevLastKey !== undefined && inventory.key <= prevLastKey) {
                    continue
                }

                // Skip if no diff available
                if (!inventory.diff || inventory.diff.length === 0) {
                    continue
                }

                // Match inventory items to existing loot actions
                const matchResult = matchLootWithInventory(
                    inventory.diff,
                    existingLootActions,
                    inventory.key // inventory timestamp
                )

                // Dispatch merge actions for matched items
                for (const match of matchResult.matches) {
                    for (const actionId of match.lootActionIds) {
                        dispatch(mergeLootWithInventory(actionId, match.inventoryItem))
                    }
                }

                // Infer actions only for unmatched items
                if (matchResult.unmatched.length > 0) {
                    const inferredActions = inferActions(matchResult.unmatched)

                    // Convert InferredAction to StoredAction
                    for (const inferredAction of inferredActions) {
                        const storedAction: StoredAction = {
                            ...inferredAction,
                            id: `${inventory.key}-${inferredAction.type}-${inferredAction.item}`,
                            timestamp: inventory.key, // The inventory key is the timestamp
                            sources: ['inventory']
                        }
                        newActions.push(storedAction)
                    }
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
            const updatedActionsState = getActivity(getState())
            const sessions = updatedActionsState.sessions

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
