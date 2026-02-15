import { useEffect, useRef } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    activityAtom,
    activityLoadingAtom,
    initializeActivityAtom,
    addActionsAndItemsAtom,
    setLastProcessedLogSerialAtom,
    subscribeToActivityAtom,
    updateActionBudgetNameAtom,
    onHistoryChangeAtom
} from '../../application/atoms/activity'
import { historyAtom } from '../../application/atoms/history'
import { lastComputedAtom } from '../../application/atoms/last'
import { currentGameLogDataAtom, initializeGameLogAtom } from '../../application/atoms/gameLog'
import { budgetStateAtom, addBudgetItemPendingLinesAtom, setBudgetFromSheetAtom } from '../../application/atoms/budget'
import { inferBudgetLinesFromActions } from '../../application/helpers/budgetInference'
import { StoredAction, ActivityItem } from '../../application/state/activity'
import { GameLogData } from '../../../background/client/gameLogData'

export function ActivityBridge() {
    // Jotai atoms
    const gameLog = useAtomValue(currentGameLogDataAtom)
    const history = useAtomValue(historyAtom)
    const budget = useAtomValue(budgetStateAtom)
    const last = useAtomValue(lastComputedAtom)

    // Jotai atoms
    const [activity] = useAtom(activityAtom)
    const isLoading = useAtomValue(activityLoadingAtom)
    const initializeActivity = useSetAtom(initializeActivityAtom)
    const initializeGameLog = useSetAtom(initializeGameLogAtom)
    const addActionsAndItems = useSetAtom(addActionsAndItemsAtom)
    const setLastProcessedLogSerial = useSetAtom(setLastProcessedLogSerialAtom)
    const subscribe = useSetAtom(subscribeToActivityAtom)
    const updateActionBudgetName = useSetAtom(updateActionBudgetNameAtom)
    const processHistoryChange = useSetAtom(onHistoryChangeAtom)
    const addBudgetItemPendingLines = useSetAtom(addBudgetItemPendingLinesAtom)
    const setBudgetFromSheet = useSetAtom(setBudgetFromSheetAtom)

    // Refs to track previous values for comparison
    const prevGameLogRef = useRef<GameLogData | null>(null)
    const prevHistoryRef = useRef(history)
    const budgetRef = useRef(budget)
    const lastRef = useRef(last)
    const prevLastLogSerialRef = useRef<number | undefined>(activity.lastProcessed.clientLogSerial)
    const subscribedRef = useRef(false)

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
        initializeGameLog()
    }, [initializeActivity, initializeGameLog])

    // Subscribe to activity changes for budget and notification integration
    // Only subscribe once to prevent duplicate callbacks from being registered on every render
    useEffect(() => {
        if (isLoading || subscribedRef.current) return

        subscribedRef.current = true

        const handleActionsAdded = (actions: StoredAction[]) => {
            // Budget integration
            const currentBudget = budgetRef.current
            const results = inferBudgetLinesFromActions(actions, currentBudget, activity.data.items)

            for (const result of results) {
                addBudgetItemPendingLines(result.budgetName, [result.budgetLine])
                // Update action with budget name in Jotai
                updateActionBudgetName({ actionId: result.action.id, budgetName: result.budgetName })
            }
        }

        const handleActionsRemoved = (_actionIds: string[], removedActions: StoredAction[]) => {
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
                    setBudgetFromSheet(updatedMap, currentBudget.list.items, currentBudget.loadPercentage)
                }
            }
        }

        subscribe({
            onActionsAdded: handleActionsAdded,
            onActionsRemoved: handleActionsRemoved
        })
    }, [isLoading, subscribe, updateActionBudgetName, addBudgetItemPendingLines, setBudgetFromSheet, activity.data.items])

    // Keep ref to lastProcessedLogSerial updated
    useEffect(() => {
        prevLastLogSerialRef.current = activity.lastProcessed.clientLogSerial
    }, [activity.lastProcessed.clientLogSerial])

    // Process game log changes (equivalent to SET_CURRENT_GAME_LOG handling)
    useEffect(() => {
        if (isLoading) return
        if (!gameLog?.raw || gameLog.raw.length === 0) return

        // Only process if game log actually changed
        if (prevGameLogRef.current === gameLog) return
        prevGameLogRef.current = gameLog

        const prevLastLogSerial = prevLastLogSerialRef.current

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
        const newLootItems: ActivityItem[] = []
        let nextItemId = Math.max(0, ...activity.data.items.map(item => item.id)) + 1

        for (const [timestamp, lootItems] of lootByTimestamp.entries()) {
            const minSerial = Math.min(...lootItems.map(item => item.serial))
            const itemIds: number[] = []

            // Create ActivityItems for each loot entry
            for (const { loot } of lootItems) {
                const itemId = nextItemId++
                itemIds.push(itemId)
                newLootItems.push({
                    id: itemId,
                    name: loot.name,
                    quantity: loot.quantity,
                    value: loot.value,
                    container: 'LOOT',
                    timestamp,
                    source: 'client'
                })
            }

            const storedAction: StoredAction = {
                type: 'loot',
                relatedItems: { items: itemIds },
                id: `loot-${minSerial}`,
                sources: ['client']
            }
            newLootActions.push(storedAction)
        }

        if (newLootActions.length > 0 || newLootItems.length > 0) {
            addActionsAndItems({ actions: newLootActions, items: newLootItems })
        }

        // Update lastProcessedLogSerial
        if (maxSerial > (prevLastLogSerial || 0)) {
            setLastProcessedLogSerial(maxSerial)
        }
    }, [gameLog, isLoading, addActionsAndItems, setLastProcessedLogSerial])

    // Process history changes
    useEffect(() => {
        if (isLoading) return
        if (!history?.list || history.list.length === 0) return

        // Only process if history actually changed
        if (prevHistoryRef.current === history) return
        prevHistoryRef.current = history

        processHistoryChange()
    }, [history, isLoading, processHistoryChange])

    // This component doesn't render anything
    return null
}
