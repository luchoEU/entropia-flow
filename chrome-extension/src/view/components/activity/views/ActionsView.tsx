import React, { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { atom } from 'jotai'
import { StoredAction, ActivityItem } from '../../../application/state/activity'
import { ViewItemData } from '../../../application/state/history'
import { formatDate, formatTime } from '../../../../common/time'
import { activityAtom } from '../../../application/atoms/activity'
import { getSessionActions } from '../activityUtils'
import { JotaiSortableTable } from '../../common/jotai/JotaiSortableTable'
import { CellElement } from '../../common/jotai/cellDSL'
import { JotaiTableColumn } from '../../common/jotai/JotaiTableTypes'
import ItemText from '../../common/ItemText'
import InferenceRuleEditor from '../InferenceRuleEditor'
import { calculateActionTotal, calculateViewItemsTotal } from '../calculateActionTotal'
import { suggestEmojiForAction } from '../../../../common/emojiSuggester'

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
    sessionStartTime?: number
    sessionEndTime?: number
}

interface ActionRowData {
    id: string
    timestamp: number
    total: number
    type: 'user' | 'unknown'
    userData?: {
        action: any
        actionTypeDef?: any
    }
    unknownData?: {
        itemIds: number[]
        items: ViewItemData[]
    }
}

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
    sessionStartTime,
    sessionEndTime,
}) => {
    const activity = useAtomValue(activityAtom)
    const sessionActions = getSessionActions(sessionId, activity)
    const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())
    const [editingActionId, setEditingActionId] = useState<string | null>(null)
    const [editingEmoji, setEditingEmoji] = useState('')
    const [editingName, setEditingName] = useState('')
    const [editingRule, setEditingRule] = useState<any | null>(null)

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

    // Group unassigned items by timestamp, filtering by session time range
    const unknownActionsByTimestamp = new Map<number, number[]>()
    Array.from(unassignedItemIds).forEach(itemId => {
        const item = getInventoryItemWithFallback(itemId)
        const timestamp = item.timestamp

        // Only include items within the session's time range
        const withinRange = (sessionStartTime === undefined || timestamp >= sessionStartTime) &&
                            (sessionEndTime === undefined || timestamp <= sessionEndTime)

        if (withinRange) {
            if (!unknownActionsByTimestamp.has(timestamp)) {
                unknownActionsByTimestamp.set(timestamp, [])
            }
            unknownActionsByTimestamp.get(timestamp)!.push(itemId)
        }
    })

    // Merge all actions (user actions + unknown actions)
    const mergedActions: ActionRowData[] = []

    // Add user actions
    userActions.forEach(action => {
        const actionId = action.id || ''
        const actionTypeDef = actionTypeDefinitions.find(def => def.id === action.type)
        const itemIds = getAllItemIds(action)
        const total = calculateActionTotal(itemIds, getInventoryItem)

        mergedActions.push({
            id: actionId,
            timestamp: action.timestamp || 0,
            total,
            type: 'user',
            userData: {
                action,
                actionTypeDef
            }
        })
    })

    // Add unknown actions
    unknownActionsByTimestamp.forEach((itemIds, timestamp) => {
        const unassignedItems: ViewItemData[] = itemIds.map(itemId => {
            const item = getInventoryItemWithFallback(itemId)
            return {
                key: item.id,
                t: item.timestamp,
                n: item.name,
                q: (item.quantity ?? 0).toString(),
                v: (item.value ?? 0).toFixed(2),
                c: item.container,
                s: item.source
            }
        })
        const total = calculateViewItemsTotal(unassignedItems)
        const actionId = `unknown-${timestamp}`

        mergedActions.push({
            id: actionId,
            timestamp,
            total,
            type: 'unknown',
            unknownData: {
                itemIds,
                items: unassignedItems
            }
        })
    })

    // Sort by timestamp (newest first)
    mergedActions.sort((a, b) => b.timestamp - a.timestamp)

    // Group actions by date
    const dateGroups: Map<string, ActionRowData[]> = new Map()
    mergedActions.forEach(action => {
        const date = formatDate(action.timestamp)
        if (!dateGroups.has(date)) {
            dateGroups.set(date, [])
        }
        dateGroups.get(date)!.push(action)
    })

    // Helper functions
    const handleStartEdit = (actionId: string, emoji: string, name: string, rule?: any) => {
        setEditingActionId(actionId)
        setEditingEmoji(emoji)
        setEditingName(name)
        setEditingRule(rule || null)
    }

    const handleCancelEdit = () => {
        setEditingActionId(null)
        setEditingEmoji('')
        setEditingName('')
        setEditingRule(null)
    }

    const handleSaveUserAction = async (actionId: string) => {
        if (!editingName.trim()) return
        const validEmoji = editingEmoji.trim() || '🎯'
        if (!isValidEmoji(validEmoji)) return

        const action = userActions.find(a => a.id === actionId)
        if (!action) return

        const updatedActionType = {
            ...action.type,
            emoji: validEmoji,
            name: editingName,
            ...(editingRule && { inferenceRule: editingRule })
        }

        if (onSaveActionType) {
            await onSaveActionType(updatedActionType)
        }

        handleCancelEdit()
    }

    const handleSaveUnknownAction = async (actionId: string) => {
        if (!editingName.trim()) return
        const validEmoji = editingEmoji.trim() || '🎯'
        if (!isValidEmoji(validEmoji)) return

        const row = mergedActions.find(r => r.id === actionId)
        if (!row || row.type !== 'unknown') return

        const items = row.unknownData!.items
        await onCreateAction(validEmoji, editingName, items)
        handleCancelEdit()
    }

    const renderExpandedItems = (itemIds: number[]): React.ReactNode => {
        if (!itemIds || itemIds.length === 0) return null

        return (
            <div style={{ marginTop: '8px', marginLeft: '20px' }}>
                <table className='table-diff' style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Value</th>
                            <th>Container</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemIds.map((itemId: number, idx: number) => {
                            const item = getInventoryItem(itemId)
                            if (!item) return null
                            return (
                                <tr key={idx} className='item-row'>
                                    <td><ItemText text={item.name} /></td>
                                    <td>{item.quantity} </td>
                                    <td>{(item.value ?? 0).toFixed(2)} PED</td>
                                    <td>{item.container}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    if (mergedActions.length === 0) {
        return <p style={{ color: '#999', fontSize: '12px' }}>No actions recorded.</p>
    }

    return (
        <>
            {Array.from(dateGroups.entries()).map(([date, dateActions]) => {
                const dateGroupAtom = useMemo(() => atom(dateActions), [dateActions])

                const columns = useMemo((): JotaiTableColumn<ActionRowData>[] => [
                    {
                        id: 'expand',
                        header: '',
                        minWidth: 30,
                        sortAccessor: undefined,
                        renderRow: (item: ActionRowData): CellElement => {
                            const isExpanded = expandedActions.has(item.id)
                            return {
                                type: 'text' as const,
                                value: isExpanded ? '▼' : '▶',
                                style: { cursor: 'pointer' },
                                onClick: () => {
                                    const newSet = new Set(expandedActions)
                                    if (newSet.has(item.id)) {
                                        newSet.delete(item.id)
                                    } else {
                                        newSet.add(item.id)
                                    }
                                    setExpandedActions(newSet)
                                }
                            }
                        }
                    },
                    {
                        id: 'time',
                        header: 'Time',
                        sortAccessor: (item: ActionRowData) => item.timestamp,
                        renderRow: (item: ActionRowData): CellElement => ({
                            type: 'text' as const,
                            value: formatTime(item.timestamp)
                        })
                    },
                    {
                        id: 'total',
                        header: 'Total',
                        sortAccessor: (item: ActionRowData) => item.total,
                        renderRow: (item: ActionRowData): CellElement => ({
                            type: 'text' as const,
                            value: `${item.total.toFixed(2)} PED`
                        })
                    },
                    {
                        id: 'name',
                        header: 'Action',
                        flex: 1,
                        sortAccessor: (item: ActionRowData) => {
                            if (item.type === 'user') {
                                const def = item.userData?.actionTypeDef
                                return `${def?.emoji || '?'} ${def?.name || ''}`
                            } else {
                                return '❓ Unassigned items'
                            }
                        },
                        renderRow: (item: ActionRowData): CellElement => {
                            const isEditing = editingActionId === item.id

                            if (isEditing) {
                                return {
                                    type: 'row' as const,
                                    gap: 5,
                                    children: [
                                        {
                                            type: 'input' as const,
                                            inputType: 'text',
                                            value: editingEmoji,
                                            onChange: (value) => setEditingEmoji(value),
                                            placeholder: 'Emoji',
                                            width: 60,
                                            style: {
                                                padding: '5px 8px',
                                                fontSize: '14px',
                                                borderColor: editingEmoji && !isValidEmoji(editingEmoji) ? '#ff6b6b' : 'inherit',
                                                border: '1px solid #ccc',
                                                borderRadius: '3px'
                                            }
                                        },
                                        {
                                            type: 'input' as const,
                                            inputType: 'text',
                                            value: editingName,
                                            onChange: (value) => {
                                                setEditingName(value)
                                                if (value.trim()) {
                                                    const suggested = suggestEmojiForAction(value)
                                                    if (suggested && !editingEmoji.trim()) {
                                                        setEditingEmoji(suggested)
                                                    }
                                                }
                                            },
                                            placeholder: 'Action name',
                                            width: 'flex',
                                            style: {
                                                padding: '5px 8px',
                                                fontSize: '14px',
                                                flex: 1,
                                                border: '1px solid #ccc',
                                                borderRadius: '3px'
                                            }
                                        }
                                    ]
                                }
                            }

                            if (item.type === 'user') {
                                const def = item.userData?.actionTypeDef
                                const itemCount = item.userData?.action ? getAllItemIds(item.userData.action).length : 0
                                return {
                                    type: 'text' as const,
                                    value: `${def?.emoji || '?'} ${def?.name || ''} (${itemCount})`
                                }
                            } else {
                                const itemCount = item.unknownData?.itemIds.length || 0
                                return {
                                    type: 'text' as const,
                                    value: `❓ Unassigned items (${itemCount})`
                                }
                            }
                        }
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        sortAccessor: undefined,
                        renderRow: (item: ActionRowData): CellElement => {
                            const isEditing = editingActionId === item.id
                            const hasValidEmoji = !editingEmoji.trim() || isValidEmoji(editingEmoji)

                            if (isEditing) {
                                return {
                                    type: 'row' as const,
                                    gap: 5,
                                    children: [
                                        {
                                            type: 'textButton' as const,
                                            text: '✅ Save',
                                            onClick: async () => {
                                                if (item.type === 'user') {
                                                    await handleSaveUserAction(item.id)
                                                } else {
                                                    await handleSaveUnknownAction(item.id)
                                                }
                                            },
                                            style: {
                                                cursor: hasValidEmoji && editingName.trim() ? 'pointer' : 'not-allowed',
                                                opacity: hasValidEmoji && editingName.trim() ? 1 : 0.5
                                            }
                                        },
                                        {
                                            type: 'textButton' as const,
                                            text: '❌ Cancel',
                                            onClick: () => handleCancelEdit(),
                                            style: { cursor: 'pointer' }
                                        }
                                    ]
                                }
                            }

                            const buttons: CellElement[] = [
                                {
                                    type: 'button' as const,
                                    icon: 'img/edit.png',
                                    width: 20,
                                    title: 'Edit action',
                                    onClick: () => {
                                        if (item.type === 'user') {
                                            const def = item.userData?.actionTypeDef
                                            handleStartEdit(item.id, def?.emoji || '', def?.name || '', def?.inferenceRule)
                                        } else {
                                            handleStartEdit(item.id, '', '')
                                        }
                                    }
                                }
                            ]

                            if (item.type === 'user') {
                                buttons.push({
                                    type: 'button' as const,
                                    icon: 'img/trash.png',
                                    width: 20,
                                    title: 'Delete action',
                                    onClick: () => onRemoveUserAction(item.id)
                                })
                            }

                            return {
                                type: 'row' as const,
                                gap: 5,
                                children: buttons
                            }
                        }
                    }
                ], [editingActionId, editingEmoji, editingName, expandedActions])

                return (
                    <div key={date} style={{ marginTop: '10px' }}>
                        <h5 style={{ margin: '10px 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{date}</h5>
                        <JotaiSortableTable
                            itemsAtom={dateGroupAtom}
                            className='table-diff'
                            config={{
                                title: `Actions for ${date}`,
                                columns,
                                itemTypeName: 'action',
                                getRowKey: (item: ActionRowData) => item.id,
                                renderExpandedRow: (item: ActionRowData) => {
                                    const isExpanded = expandedActions.has(item.id)
                                    if (!isExpanded) return null

                                    if (item.type === 'user') {
                                        const itemIds = item.userData?.action ? getAllItemIds(item.userData.action) : []
                                        if (editingActionId === item.id) {
                                            return (
                                                <div style={{ padding: '0 20px 10px 40px' }}>
                                                    <InferenceRuleEditor
                                                        ruleData={editingRule}
                                                        items={itemIds}
                                                        getInventoryItem={getInventoryItem}
                                                        onRuleChange={setEditingRule}
                                                    />
                                                </div>
                                            )
                                        }
                                        return (
                                            <div style={{ padding: '0 20px 10px 40px' }}>
                                                {renderExpandedItems(itemIds)}
                                            </div>
                                        )
                                    } else {
                                        const itemIds = item.unknownData?.itemIds || []
                                        return (
                                            <div style={{ padding: '0 20px 10px 40px' }}>
                                                {renderExpandedItems(itemIds)}
                                            </div>
                                        )
                                    }
                                }
                            }}
                            useFixedSizeList={false}
                            itemHeight={20}
                        />
                    </div>
                )
            })}
        </>
    )
}

export default ActionsView
