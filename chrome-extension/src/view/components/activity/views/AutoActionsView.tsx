import React from 'react'
import { useAtomValue } from 'jotai'
import { StoredAction, ActivityItem, SessionType, getActionTimestamp } from '../../../application/state/activity'
import { formatDate } from '../../../../common/time'
import ActionRow, { ActionExclusionConfig } from '../ActionRow'
import { ItemExclusionConfig } from '../SortableItemsTable'
import { NavigateFunction } from 'react-router-dom'
import { activityAtom } from '../../../application/atoms/activity'
import { getSessionActions } from '../activityUtils'

interface AutoActionsViewProps {
    sessionId: string
    expandedActionRows: Set<string>
    editingActionId: string | null
    onToggleActionRow: (actionId: string) => void
    onStartEditAction: (actionId: string) => void
    onUpdateActionType: (actionId: string, type: string) => void
    exclusionConfig?: ActionExclusionConfig
    itemExclusionConfig?: ItemExclusionConfig
    isBudgetEnabled: boolean
    navigate: NavigateFunction
    getInventoryItem: (id: number) => ActivityItem | undefined
    getInventoryItemWithFallback: (itemId: number, fallbackTimestamp?: number) => ActivityItem
    getAllItemIds: (action: StoredAction) => number[]
    buildCopyTextForAction: (action: StoredAction) => string
    copyToClipboard: (text: string) => Promise<void>
}

const AutoActionsView: React.FC<AutoActionsViewProps> = ({
    sessionId,
    expandedActionRows,
    editingActionId,
    onToggleActionRow,
    onStartEditAction,
    onUpdateActionType,
    exclusionConfig,
    itemExclusionConfig,
    isBudgetEnabled,
    navigate,
    getInventoryItem,
    getInventoryItemWithFallback,
    getAllItemIds,
    buildCopyTextForAction,
    copyToClipboard,
}) => {
    const activity = useAtomValue(activityAtom)
    const sessionActions = getSessionActions(sessionId, activity)

    // Group actions by date
    const dateGroups: Map<string, StoredAction[]> = new Map()
    sessionActions.sort((a, b) => getActionTimestamp(b, getInventoryItem) - getActionTimestamp(a, getInventoryItem)).forEach(action => {
        const timestamp = getActionTimestamp(action, getInventoryItem)
        const date = formatDate(timestamp)
        if (!dateGroups.has(date)) {
            dateGroups.set(date, [])
        }
        dateGroups.get(date)!.push(action)
    })

    return (
        <>
            {Array.from(dateGroups.entries()).map(([date, dateActions]) => (
                <div key={date}>
                    <h5 style={{ margin: '10px 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{date}</h5>
                    <table className='table-diff'>
                        <tbody>
                            {dateActions.map((action, idx) => (
                                <ActionRow
                                    key={action.id || idx}
                                    action={action}
                                    isExpanded={expandedActionRows.has(action.id)}
                                    isEditing={editingActionId === action.id}
                                    onToggle={() => onToggleActionRow(action.id)}
                                    onStartEdit={() => onStartEditAction(action.id)}
                                    onUpdateType={(type: string) => onUpdateActionType(action.id, type)}
                                    exclusionConfig={exclusionConfig}
                                    itemExclusionConfig={itemExclusionConfig}
                                    isBudgetEnabled={isBudgetEnabled}
                                    navigate={navigate}
                                    getInventoryItem={getInventoryItem}
                                    getInventoryItemWithFallback={getInventoryItemWithFallback}
                                    getAllItemIds={getAllItemIds}
                                    buildCopyTextForAction={buildCopyTextForAction}
                                    copyToClipboard={copyToClipboard}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </>
    )
}

export default AutoActionsView
