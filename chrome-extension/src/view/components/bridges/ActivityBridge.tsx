import { useEffect, useRef } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useSelector, useDispatch } from 'react-redux'
import {
    activityAtom,
    activityLoadingAtom,
    initializeActivityAtom,
    addActionsAtom,
    addInventoryAndActionsAtom,
    setLastProcessedKeyAtom,
    setLastProcessedLogSerialAtom,
    mergeLootWithInventoryAtom,
    updateSessionInventoryAtom,
    subscribeToActivityAtom,
    updateActionBudgetNameAtom
} from '../../application/atoms/activity'
import { historyComputedAtom } from '../../application/atoms/history'
import { lastComputedAtom } from '../../application/atoms/last'
import { getGameLog } from '../../application/selectors/log'
import { getBudget } from '../../application/selectors/budget'
import { addBudgetItemPendingLines, setBudgetFromSheet } from '../../application/actions/budget'
import { inferBudgetLinesFromActions } from '../../application/helpers/budgetInference'
import { inferActions, matchLootWithInventory } from '../../application/helpers/actionInference'
import { InferredAction, StoredAction, ActivityItem } from '../../application/state/activity'
import { GameLogData } from '../../../background/client/gameLogData'

export function ActivityBridge() {
    const dispatch = useDispatch()

    // Redux selectors
    const gameLog: GameLogData = useSelector(getGameLog)
    // Jotai atoms
    const history = useAtomValue(historyComputedAtom)
    const budget = useSelector(getBudget)
    const last = useAtomValue(lastComputedAtom)

    // Jotai atoms
    const [activity] = useAtom(activityAtom)
    const isLoading = useAtomValue(activityLoadingAtom)
    const initializeActivity = useSetAtom(initializeActivityAtom)
    const addActions = useSetAtom(addActionsAtom)
    const addInventoryAndActions = useSetAtom(addInventoryAndActionsAtom)
    const setLastProcessedKey = useSetAtom(setLastProcessedKeyAtom)
    const setLastProcessedLogSerial = useSetAtom(setLastProcessedLogSerialAtom)
    const mergeLootWithInventory = useSetAtom(mergeLootWithInventoryAtom)
    const updateSessionInventory = useSetAtom(updateSessionInventoryAtom)
    const subscribe = useSetAtom(subscribeToActivityAtom)
    const updateActionBudgetName = useSetAtom(updateActionBudgetNameAtom)

    // Refs to track previous values for comparison
    const prevGameLogRef = useRef<GameLogData | null>(null)
    const prevHistoryRef = useRef(history)
    const budgetRef = useRef(budget)
    const lastRef = useRef(last)

    // Keep refs updated
    useEffect(() => {
        budgetRef.current = budget
    }, [budget])

    useEffect(() => {
        lastRef.current = last
    }, [last])

    // Initialize activity state from storage
    useEffect(() => {
        initializeActivity()
    }, [initializeActivity])

    // Subscribe to activity changes for budget and notification integration
    useEffect(() => {
        if (isLoading) return

        subscribe({
            onActionsAdded: (actions: StoredAction[]) => {
                // Budget integration
                const currentBudget = budgetRef.current
                const results = inferBudgetLinesFromActions(actions, currentBudget, activity.data.items)

                for (const result of results) {
                    dispatch(addBudgetItemPendingLines(result.budgetName, [result.budgetLine]))
                    // Update action with budget name in Jotai
                    updateActionBudgetName({ actionId: result.action.id, budgetName: result.budgetName })
                }
            },
            onActionsRemoved: (_actionIds: string[], removedActions: StoredAction[]) => {
                // Budget cleanup on action removal
                const currentBudget = budgetRef.current
                for (const action of removedActions) {
                    if (action.budgetName) {
                        // Remove budgetList entries for this item from all materials
                        const updatedMap = { ...currentBudget.materials.map }
                        for (const materialName of Object.keys(updatedMap)) {
                            updatedMap[materialName] = {
                                ...updatedMap[materialName],
                                budgetList: updatedMap[materialName].budgetList.filter(
                                    (b: { itemName: string }) => b.itemName !== action.budgetName
                                )
                            }
                        }
                        dispatch(setBudgetFromSheet(updatedMap, currentBudget.list.items, currentBudget.loadPercentage))
                    }
                }
            }
        })
    }, [isLoading, subscribe, dispatch, updateActionBudgetName])

    // Process game log changes (equivalent to SET_CURRENT_GAME_LOG handling)
    useEffect(() => {
        if (isLoading) return
        if (!gameLog?.raw || gameLog.raw.length === 0) return

        // Only process if game log actually changed
        if (prevGameLogRef.current === gameLog) return
        prevGameLogRef.current = gameLog

        const prevLastLogSerial = activity.lastProcessed.clientLogSerial

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
        for (const lootItems of lootByTimestamp.values()) {
            const minSerial = Math.min(...lootItems.map(item => item.serial))

            const storedAction: StoredAction = {
                type: 'loot',
                relatedItems: { items: [] }, // Will be populated when merged with inventory items
                id: `loot-${minSerial}`,
                sources: ['client']
            }
            newLootActions.push(storedAction)
        }

        if (newLootActions.length > 0) {
            addActions(newLootActions)
        }

        // Update lastProcessedLogSerial
        if (maxSerial > (prevLastLogSerial || 0)) {
            setLastProcessedLogSerial(maxSerial)
        }
    }, [gameLog, isLoading, activity.lastProcessed.clientLogSerial, addActions, setLastProcessedLogSerial])

    // Process history changes (equivalent to SET_HISTORY_LIST handling)
    useEffect(() => {
        if (isLoading) return
        if (!activity) return
        if (!history?.list || history.list.length === 0) return

        // Only process if history actually changed
        if (prevHistoryRef.current === history) return
        prevHistoryRef.current = history

        const prevLastKey = activity.lastProcessed.inventoryKey

        // Get existing loot actions (type 'loot' with 'client' source, not yet merged with inventory)
        const existingLootActions = (activity.data.autoActions ?? []).filter(
            act => act.type === 'loot' && act.sources.includes('client')
        )

        // Find new inventory items that haven't been processed yet
        const newInventoryItems: ActivityItem[] = []
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
                inventory.key, // inventory timestamp
                undefined,
                activity.data.items
            )

            // Merge matched items
            for (const match of matchResult.matches) {
                for (const actionId of match.lootActionIds) {
                    mergeLootWithInventory({ actionId, inventoryItem: match.inventoryItem })
                }
            }

            // Create ActivityItem objects from the unmatched diff items
            const inventoryStartIndex = activity.data.items.length + newInventoryItems.length
            for (const diffItem of matchResult.unmatched) {
                const inventoryItem: ActivityItem = {
                    id: inventoryStartIndex + newInventoryItems.length, // Serial ID
                    name: diffItem.n,
                    quantity: parseFloat(diffItem.q),
                    value: parseFloat(diffItem.v),
                    container: diffItem.c,
                    timestamp: inventory.key,
                    source: 'inventory'
                }
                newInventoryItems.push(inventoryItem)
            }

            // Infer actions from unmatched items
            if (matchResult.unmatched.length > 0) {
                const inferredActions = inferActions(matchResult.unmatched)

                // Helper to map indices to actual inventory IDs in the relatedItems structure
                const mapIndicesToIds = (relatedItems: InferredAction['relatedItems']): any => {
                    const result: any = {}
                    for (const [key, value] of Object.entries(relatedItems)) {
                        if (typeof value === 'number') {
                            result[key] = inventoryStartIndex + value
                        } else if (Array.isArray(value)) {
                            result[key] = value.map(index => inventoryStartIndex + index)
                        }
                    }
                    return result
                }

                // Convert InferredAction to StoredAction
                for (const inferredAction of inferredActions) {
                    const storedAction: StoredAction = {
                        type: inferredAction.type,
                        relatedItems: mapIndicesToIds(inferredAction.relatedItems),
                        id: `${inventory.key}-${inferredAction.type}-${Date.now()}`,
                        sources: ['inventory']
                    }
                    newActions.push(storedAction)
                }
            }
        }

        // Save inventory items and actions
        if (newInventoryItems.length > 0 || newActions.length > 0) {
            addInventoryAndActions({ inventoryItems: newInventoryItems, actions: newActions })
        }

        // Update lastProcessedInventoryKey
        if (history.list.length > 0) {
            const latestKey = Math.max(...history.list.map(i => i.key))
            if (prevLastKey === undefined || latestKey > prevLastKey) {
                setLastProcessedKey(latestKey)
            }
        }

        // Update session inventory data
        const sessions = activity.data.sessions
        for (const session of sessions) {
            const sessionIndex = sessions.indexOf(session)
            const endTime = sessions[sessionIndex + 1]?.startTime || Date.now()

            // Find the latest inventory within this session's time range
            let latestInventory: any = null
            for (let i = history.list.length - 1; i >= 0; i--) {
                const item = history.list[i]
                if (item.key <= endTime && item.key >= session.startTime) {
                    latestInventory = item
                    break
                }
            }

            const inventoryData = latestInventory && latestInventory.rawInventory ? {
                total: Number(latestInventory.rawInventory.meta.total) || 0,
                items: latestInventory.rawInventory.itemlist?.length || 0
            } : undefined

            if (inventoryData) {
                updateSessionInventory({ sessionId: session.id, inventory: inventoryData })
            }
        }
    }, [history, isLoading, activity.lastProcessed.inventoryKey, activity.data.items, activity.data.sessions, addActions, setLastProcessedKey, mergeLootWithInventory])

    // This component doesn't render anything
    return null
}
