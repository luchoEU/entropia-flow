import React, { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { atom } from 'jotai'
import { StoredAction, ActivityItem, getActionTimestamp, formatActionDescription, actionTypeInfo } from '../../../application/state/activity'
import { formatDate, formatTime } from '../../../../common/time'
import { ActionExclusionConfig } from '../ActionRow'
import { ItemExclusionConfig } from '../SortableItemsTable'
import { NavigateFunction } from 'react-router-dom'
import { activityAtom } from '../../../application/atoms/activity'
import { getSessionActions } from '../activityUtils'
import { JotaiSortableTable } from '../../common/jotai/JotaiSortableTable'
import { CellElement } from '../../common/jotai/cellDSL'
import ItemText from '../../common/ItemText'
import ImgButton from '../../common/ImgButton'
import { TabId } from '../../../application/state/navigation'

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

interface ActionRowData {
    action: StoredAction
    timestamp: number
    total: number
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

    const renderExpandedItems = (action: StoredAction, itemIds: number[]): React.ReactNode => {
        if (itemIds.length === 0) return null

        return (
            <div style={{ marginTop: '8px', marginLeft: '20px' }}>
                <table className='table-diff' style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Item</th>
                            {itemExclusionConfig && <th></th>}
                            <th>Quantity</th>
                            <th>Value</th>
                            <th>Container</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemIds.map((itemId: number, idx: number) => {
                            const item = getInventoryItemWithFallback(itemId, getActionTimestamp(action, getInventoryItem))
                            const itemExcluded = itemExclusionConfig?.sessionBlacklist?.includes(item.name) ?? false
                            const itemPermanent = itemExclusionConfig?.permanentBlacklist?.includes(item.name) ?? false
                            const isItemExcludedOrPermanent = itemExcluded || itemPermanent
                            return (
                                <tr key={idx} className={`item-row ${isItemExcludedOrPermanent ? 'item-row-excluded' : ''}`}>
                                    <td><ItemText text={item.name} /></td>
                                    {itemExclusionConfig && (
                                        <td>
                                            {itemPermanent ? (
                                                <ImgButton
                                                    title='Remove permanent exclusion from the sum'
                                                    src='img/forbidden.png'
                                                    show
                                                    action={() => itemExclusionConfig.onPermanentExclude(item.name, false)}
                                                />
                                            ) : itemExcluded ? (
                                                <>
                                                    <ImgButton
                                                        title='Include this item in the sum'
                                                        src='img/cross.png'
                                                        show
                                                        action={() => itemExclusionConfig.onInclude(item.name)}
                                                    />
                                                    <ImgButton
                                                        title='Permanently exclude this item from the sum'
                                                        src='img/forbidden.png'
                                                        action={() => itemExclusionConfig.onPermanentExclude(item.name, true)}
                                                    />
                                                </>
                                            ) : (
                                                <ImgButton
                                                    title='Exclude this item from the sum'
                                                    src='img/cross.png'
                                                    action={() => itemExclusionConfig.onExclude(item.name)}
                                                />
                                            )}
                                        </td>
                                    )}
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

    return (
        <>
            {Array.from(dateGroups.entries()).map(([date, dateActions]) => {
                // Create data for this date group
                const dateGroupData: ActionRowData[] = dateActions.map(action => ({
                    action,
                    timestamp: getActionTimestamp(action, getInventoryItem),
                    total: getAllItemIds(action).reduce((sum, itemId) => {
                        const item = getInventoryItem(itemId)
                        return sum + (item ? item.value : 0)
                    }, 0)
                }))

                // Create atom for this date group
                const dateGroupAtom = useMemo(() => atom(dateGroupData), [dateGroupData])

                // Render columns
                const columns = useMemo(() => [
                    {
                        id: 'expand',
                        header: '',
                        width: 30,
                        sortAccessor: undefined,
                        renderRow: (item: ActionRowData): CellElement => {
                            const isExpanded = expandedActionRows.has(item.action.id)
                            return {
                                type: 'text' as const,
                                value: isExpanded ? '▼' : '▶',
                                style: { cursor: 'pointer' },
                                onClick: () => onToggleActionRow(item.action.id)
                            }
                        }
                    },
                    {
                        id: 'time',
                        header: 'Time',
                        width: 100,
                        sortAccessor: (item: ActionRowData) => item.timestamp,
                        renderRow: (item: ActionRowData): CellElement => ({
                            type: 'text' as const,
                            value: formatTime(item.timestamp)
                        })
                    },
                    {
                        id: 'total',
                        header: 'Total',
                        width: 100,
                        sortAccessor: (item: ActionRowData) => item.total,
                        renderRow: (item: ActionRowData): CellElement => ({
                            type: 'text' as const,
                            value: `${item.total.toFixed(2)} PED`
                        })
                    },
                    {
                        id: 'name',
                        header: 'Action',
                        width: 250,
                        sortAccessor: (item: ActionRowData) => formatActionDescription(item.action, getInventoryItem),
                        renderRow: (item: ActionRowData): CellElement => {
                            const nameText = formatActionDescription(item.action, getInventoryItem)
                            const hasBudget = item.action.budgetName && isBudgetEnabled

                            if (!hasBudget) {
                                return {
                                    type: 'text' as const,
                                    value: nameText
                                }
                            }

                            // Return a row with name and budget link
                            return {
                                type: 'row' as const,
                                gap: 10,
                                children: [
                                    {
                                        type: 'text' as const,
                                        value: nameText
                                    },
                                    {
                                        type: 'text' as const,
                                        value: '[📊Budget]',
                                        style: {
                                            color: 'blue',
                                            cursor: 'pointer'
                                        },
                                        onClick: () => navigate(`${TabId.BUDGET}/${item.action.budgetName!}`)
                                    }
                                ]
                            }
                        }
                    },
                    {
                        id: 'actions',
                        header: 'Actions',
                        width: 200,
                        sortAccessor: undefined,
                        renderRow: (item: ActionRowData): CellElement => {
                            const excluded = exclusionConfig?.isExcluded ?? false
                            const permanent = exclusionConfig?.isPermanentlyExcluded ?? false

                            const buttons: CellElement[] = [
                                {
                                    type: 'button' as const,
                                    icon: 'img/edit.png',
                                    width: 20,
                                    title: 'Edit action item',
                                    onClick: () => onStartEditAction(item.action.id)
                                },
                                {
                                    type: 'button' as const,
                                    icon: 'img/copy.png',
                                    width: 20,
                                    title: 'Copy to clipboard',
                                    onClick: async () => {
                                        const text = buildCopyTextForAction(item.action)
                                        await copyToClipboard(text)
                                    }
                                }
                            ]

                            if (exclusionConfig) {
                                if (permanent) {
                                    buttons.push({
                                        type: 'button' as const,
                                        icon: 'img/forbidden.png',
                                        width: 20,
                                        show: true,
                                        title: 'Remove permanent exclusion from the sum',
                                        onClick: () => exclusionConfig.onPermanentExclude(false)
                                    })
                                } else if (excluded) {
                                    buttons.push({
                                        type: 'button' as const,
                                        icon: 'img/cross.png',
                                        width: 20,
                                        show: true,
                                        title: 'Include this action in the sum',
                                        onClick: () => exclusionConfig.onInclude()
                                    })
                                    buttons.push({
                                        type: 'button' as const,
                                        icon: 'img/forbidden.png',
                                        width: 20,
                                        title: 'Permanently exclude this action type from the sum',
                                        onClick: () => exclusionConfig.onPermanentExclude(true)
                                    })
                                } else {
                                    buttons.push({
                                        type: 'button' as const,
                                        icon: 'img/cross.png',
                                        width: 20,
                                        title: 'Exclude this action from the sum',
                                        onClick: () => exclusionConfig.onExclude()
                                    })
                                }
                            }

                            return {
                                type: 'row' as const,
                                gap: 5,
                                children: buttons
                            }
                        }
                    }
                ], [editingActionId, exclusionConfig, buildCopyTextForAction, copyToClipboard])

                // Render expanded items for this date group
                const expandedContent = dateGroupData.map(item => {
                    const isExpanded = expandedActionRows.has(item.action.id)
                    const itemIds = getAllItemIds(item.action)
                    return isExpanded && (
                        <div key={`expanded-${item.action.id}`} style={{ padding: '0 20px 10px 40px' }}>
                            {renderExpandedItems(item.action, itemIds)}
                        </div>
                    )
                }).filter(Boolean)

                return (
                    <div key={date} style={{ marginTop: '10px' }}>
                        <h5 style={{ margin: '10px 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{date}</h5>
                        <div className='table-diff'>
                            <JotaiSortableTable
                                itemsAtom={dateGroupAtom}
                                config={{
                                    title: `Actions for ${date}`,
                                    columns,
                                    itemTypeName: 'action',
                                    getRowKey: (item: ActionRowData) => item.action.id
                                }}
                                useFixedSizeList={false}
                                itemHeight={32}
                            />
                        </div>
                        {expandedContent && expandedContent.length > 0 && (
                            <div style={{ marginLeft: '20px', marginTop: '-5px' }}>
                                {expandedContent}
                            </div>
                        )}
                    </div>
                )
            })}
        </>
    )
}

export default AutoActionsView
