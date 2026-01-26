import { useEffect, useRef } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useSelector, useDispatch } from 'react-redux'
import {
    activityAtom,
    activityLoadingAtom,
    initializeActivityAtom,
    addActionsAtom,
    setLastProcessedKeyAtom,
    setLastProcessedLogSerialAtom,
    mergeLootWithInventoryAtom,
    updateSessionInventoryAtom,
    subscribeToActivityAtom,
    updateActionBudgetNameAtom
} from '../../application/atoms/activity'
import { getGameLog } from '../../application/selectors/log'
import { getHistory } from '../../application/selectors/history'
import { getBudget } from '../../application/selectors/budget'
import { getLast } from '../../application/selectors/last'
import { addBudgetItemPendingLines, setBudgetFromSheet } from '../../application/actions/budget'
import { addNotificationsDone } from '../../application/actions/last'
import { inferBudgetLinesFromActions } from '../../application/helpers/budgetInference'
import { inferActions, matchLootWithInventory } from '../../application/helpers/actionInference'
import { createBasicNotification } from '../../../common/notifications'
import { StoredAction } from '../../application/state/activity'
import { GameLogData } from '../../../background/client/gameLogData'
import { HistoryState, ViewItemData } from '../../application/state/history'

export function ActivityBridge() {
    const dispatch = useDispatch()

    // Redux selectors
    const gameLog: GameLogData = useSelector(getGameLog)
    const history: HistoryState = useSelector(getHistory)
    const budget = useSelector(getBudget)
    const last = useSelector(getLast)

    // Jotai atoms
    const [activity, setActivity] = useAtom(activityAtom)
    const isLoading = useAtomValue(activityLoadingAtom)
    const initializeActivity = useSetAtom(initializeActivityAtom)
    const addActions = useSetAtom(addActionsAtom)
    const setLastProcessedKey = useSetAtom(setLastProcessedKeyAtom)
    const setLastProcessedLogSerial = useSetAtom(setLastProcessedLogSerialAtom)
    const mergeLootWithInventory = useSetAtom(mergeLootWithInventoryAtom)
    const updateSessionInventory = useSetAtom(updateSessionInventoryAtom)
    const subscribe = useSetAtom(subscribeToActivityAtom)
    const updateActionBudgetName = useSetAtom(updateActionBudgetNameAtom)

    // Refs to track previous values for comparison
    const prevGameLogRef = useRef<GameLogData | null>(null)
    const prevHistoryRef = useRef<HistoryState | null>(null)
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
                const results = inferBudgetLinesFromActions(actions, currentBudget)

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

        const prevLastLogSerial = activity.lastProcessedLogSerial

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
            addActions(newLootActions)
        }

        // Update lastProcessedLogSerial
        if (maxSerial > (prevLastLogSerial || 0)) {
            setLastProcessedLogSerial(maxSerial)
        }
    }, [gameLog, isLoading, activity.lastProcessedLogSerial, addActions, setLastProcessedLogSerial])

    // Process history changes (equivalent to SET_HISTORY_LIST handling)
    useEffect(() => {
        if (isLoading) return
        if (!history?.list || history.list.length === 0) return

        // Only process if history actually changed
        if (prevHistoryRef.current === history) return
        prevHistoryRef.current = history

        const prevLastKey = activity.lastProcessedInventoryKey

        // Get existing loot actions (type 'loot' with 'client' source, not yet merged with inventory)
        const existingLootActions = activity.list.filter(
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

            // Merge matched items
            for (const match of matchResult.matches) {
                for (const actionId of match.lootActionIds) {
                    mergeLootWithInventory({ actionId, inventoryItem: match.inventoryItem })
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
                        timestamp: inventory.key,
                        sources: ['inventory']
                    }
                    newActions.push(storedAction)
                }
            }
        }

        if (newActions.length > 0) {
            addActions(newActions)
        }

        // Update lastProcessedInventoryKey
        if (history.list.length > 0) {
            const latestKey = Math.max(...history.list.map(i => i.key))
            if (prevLastKey === undefined || latestKey > prevLastKey) {
                setLastProcessedKey(latestKey)
            }
        }

        // Update session inventory data
        const sessions = activity.sessions
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
    }, [history, isLoading, activity.lastProcessedInventoryKey, activity.list, activity.sessions, addActions, setLastProcessedKey, mergeLootWithInventory, updateSessionInventory])

    // This component doesn't render anything
    return null
}
