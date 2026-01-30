import React, { useState } from 'react'
import { useAtomValue } from 'jotai'
import { StoredAction, ActivityItem } from '../../../application/state/activity'
import { ViewItemData } from '../../../application/state/history'
import { formatDate } from '../../../../common/time'
import UnknownAction from '../UnknownAction'
import ActionItem from '../ActionItem'
import { activityAtom } from '../../../application/atoms/activity'
import { getSessionActions } from '../activityUtils'

interface ActionsViewProps {
    sessionId: string
    userActions: any[]
    actionTypeDefinitions: any[]
    onCreateAction: (emoji: string, name: string, items: ViewItemData[]) => void | Promise<void>
    onRemoveUserAction: (actionId: string) => void
    getInventoryItem: (id: number) => ActivityItem | undefined
    getInventoryItemWithFallback: (itemId: number, fallbackTimestamp?: number) => ActivityItem
    getAllItemIds: (action: StoredAction) => number[]
    isValidEmoji: (str: string) => boolean
    onSaveActionType?: (actionType: any) => Promise<void>
}

type MergedAction =
    | { type: 'user'; data: any; timestamp: number }
    | { type: 'unknown'; itemIds: number[]; timestamp: number }

const ActionsView: React.FC<ActionsViewProps> = ({
    sessionId,
    userActions,
    actionTypeDefinitions,
    onCreateAction,
    onRemoveUserAction,
    getInventoryItem,
    getInventoryItemWithFallback,
    getAllItemIds,
    isValidEmoji,
    onSaveActionType,
}) => {
    const activity = useAtomValue(activityAtom)
    const sessionActions = getSessionActions(sessionId, activity)
    const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())

    // Helper to check if item is in any user action
    const itemsInUserActions = new Set<number>()
    userActions.forEach(action => {
        const items = Array.isArray(action.relatedItems.items) ? action.relatedItems.items : [action.relatedItems.items]
        items.forEach((itemId: number) => itemsInUserActions.add(itemId))
    })

    // Extract all items from session actions not in user actions
    const unassignedItemIds = new Set<number>()
    sessionActions.forEach((action: StoredAction) => {
        getAllItemIds(action).forEach(itemId => {
            if (!itemsInUserActions.has(itemId)) {
                unassignedItemIds.add(itemId)
            }
        })
    })

    // Group unassigned items by timestamp
    const unknownActionsByTimestamp = new Map<number, number[]>()
    Array.from(unassignedItemIds).forEach(itemId => {
        const item = getInventoryItemWithFallback(itemId)
        const timestamp = item.timestamp
        if (!unknownActionsByTimestamp.has(timestamp)) {
            unknownActionsByTimestamp.set(timestamp, [])
        }
        unknownActionsByTimestamp.get(timestamp)!.push(itemId)
    })

    // Merge all actions (user actions + unknown actions)
    const mergedActions: MergedAction[] = []

    // Add user actions
    userActions.forEach(action => {
        mergedActions.push({
            type: 'user',
            data: action,
            timestamp: action.timestamp || 0
        })
    })

    // Add unknown actions
    unknownActionsByTimestamp.forEach((itemIds, timestamp) => {
        mergedActions.push({
            type: 'unknown',
            itemIds,
            timestamp
        })
    })

    // Sort by timestamp (newest first)
    mergedActions.sort((a, b) => b.timestamp - a.timestamp)

    // Group actions by date
    const dateGroups: Map<string, MergedAction[]> = new Map()
    mergedActions.forEach(action => {
        const date = formatDate(action.timestamp)
        if (!dateGroups.has(date)) {
            dateGroups.set(date, [])
        }
        dateGroups.get(date)!.push(action)
    })

    return (
        <>
            {mergedActions.length === 0 ? (
                <p style={{ color: '#999', fontSize: '12px' }}>No actions recorded.</p>
            ) : (
                Array.from(dateGroups.entries()).map(([date, dateActions]) => (
                    <div key={date}>
                        <h5 style={{ margin: '10px 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{date}</h5>
                        <table className='table-diff'>
                            <tbody>
                                {dateActions.map((action, index) => {
                                    if (action.type === 'user') {
                                        const actionTypeDef = actionTypeDefinitions.find(def => def.id === action.data.type)
                                        const actionId = action.data.id || ''

                                        return (
                                            <ActionItem
                                                key={`user-${actionId}`}
                                                action={action.data}
                                                actionTypeDef={actionTypeDef}
                                                onDelete={() => onRemoveUserAction(actionId)}
                                                getInventoryItem={getInventoryItem}
                                                getInventoryItemWithFallback={getInventoryItemWithFallback}
                                                onSaveActionType={onSaveActionType}
                                                isValidEmoji={isValidEmoji}
                                            />
                                        )
                                    } else {
                                        // Unknown action
                                        const unassignedItems: ViewItemData[] = action.itemIds.map(itemId => {
                                            const item = getInventoryItemWithFallback(itemId)
                                            return {
                                                key: item.id,
                                                n: item.name,
                                                q: (item.quantity ?? 0).toString(),
                                                v: (item.value ?? 0).toFixed(2),
                                                c: item.container
                                            }
                                        })

                                        const actionKey = `unknown-${action.timestamp}-${index}`
                                        const isExpanded = expandedActions.has(actionKey)

                                        return (
                                            <UnknownAction
                                                key={actionKey}
                                                items={unassignedItems}
                                                timestamp={action.timestamp}
                                                onCreateAction={onCreateAction}
                                                isValidEmoji={isValidEmoji}
                                                isExpanded={isExpanded}
                                                onToggleExpand={() => {
                                                    const newSet = new Set(expandedActions)
                                                    if (newSet.has(actionKey)) {
                                                        newSet.delete(actionKey)
                                                    } else {
                                                        newSet.add(actionKey)
                                                    }
                                                    setExpandedActions(newSet)
                                                }}
                                            />
                                        )
                                    }
                                })}
                            </tbody>
                        </table>
                    </div >
                ))
            )}
        </>
    )
}

export default ActionsView
