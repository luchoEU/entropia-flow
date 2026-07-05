import React, { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { atom } from 'jotai'
import { StoredAction, ActivityItem, getActionTimestamp, formatActionDescription } from '../../../application/state/activity'
import { formatDate, formatTime } from '../../../../common/time'
import { ActionExclusionConfig } from '../ActionRow'
import { ItemExclusionConfig } from '../SortableItemsTable'
import { NavigateFunction } from 'react-router-dom'
import { activityAtom } from '../../../application/atoms/activity'
import { buildActivitySessionBuckets } from '../activityUtils'
import { JotaiSortableTable } from '../../common/jotai/JotaiSortableTable'
import { CellElement } from '../../common/jotai/cellDSL'
import ItemText from '../../common/ItemText'
import ImgButton from '../../common/ImgButton'
import { TabId } from '../../../application/state/navigation'
import { JotaiTableColumn } from '../../common/jotai/JotaiTableTypes'

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

interface AutoActionsDateGroupSectionProps {
    date: string
    dateActions: ActionRowData[]
    expandedActionRows: Set<string>
    editingActionId: string | null
    onToggleActionRow: (actionId: string) => void
    onStartEditAction: (actionId: string) => void
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

const AutoActionsDateGroupSection: React.FC<AutoActionsDateGroupSectionProps> = ({
    date,
    dateActions,
    expandedActionRows,
    editingActionId,
    onToggleActionRow,
    onStartEditAction,
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
    const dateGroupAtom = useMemo(() => atom(dateActions), [dateActions])

    const columns = useMemo((): JotaiTableColumn<ActionRowData>[] => [
        {
            id: 'expand',
            header: '',
            minWidth: 30,
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
    ], [editingActionId, exclusionConfig, buildCopyTextForAction, copyToClipboard, expandedActionRows, onToggleActionRow, onStartEditAction, isBudgetEnabled, navigate, getInventoryItem])

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
        <div style={{ marginTop: '10px' }}>
            <h5 style={{ margin: '10px 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{date}</h5>
            <JotaiSortableTable
                itemsAtom={dateGroupAtom}
                className='table-diff'
                config={{
                    title: `Actions for ${date}`,
                    columns,
                    itemTypeName: 'action',
                    getRowKey: (item: ActionRowData) => item.action.id,
                    renderExpandedRow: (item: ActionRowData) => {
                        const isExpanded = expandedActionRows.has(item.action.id)
                        if (!isExpanded) return null
                        const itemIds = getAllItemIds(item.action)
                        return (
                            <div style={{ padding: '0 20px 10px 40px' }}>
                                {renderExpandedItems(item.action, itemIds)}
                            </div>
                        )
                    }
                }}
                useFixedSizeList={expandedActionRows.size === 0 && !editingActionId}
                columnWidthMode='header'
                itemHeight={20}
            />
        </div>
    )
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
    const sessionBuckets = useMemo(
        () => buildActivitySessionBuckets(activity),
        [activity]
    )
    const sessionActions = sessionBuckets.actionsBySession.get(sessionId) ?? []

    const dateGroups = useMemo(() => {
        const sortedActions = [...sessionActions].sort(
            (a, b) => getActionTimestamp(b, getInventoryItem) - getActionTimestamp(a, getInventoryItem)
        )

        const groups = new Map<string, StoredAction[]>()
        sortedActions.forEach(action => {
            const timestamp = getActionTimestamp(action, getInventoryItem)
            const date = formatDate(timestamp)
            if (!groups.has(date)) {
                groups.set(date, [])
            }
            groups.get(date)!.push(action)
        })

        return Array.from(groups.entries())
    }, [sessionActions, getInventoryItem])

    return (
        <>
            {dateGroups.map(([date, dateActions]) => {
                const dateGroupData: ActionRowData[] = dateActions.map(action => ({
                    action,
                    timestamp: getActionTimestamp(action, getInventoryItem),
                    total: getAllItemIds(action).reduce((sum, itemId) => {
                        const item = getInventoryItem(itemId)
                        return sum + (item ? item.value : 0)
                    }, 0)
                }))

                return (
                    <AutoActionsDateGroupSection
                        key={date}
                        date={date}
                        dateActions={dateGroupData}
                        expandedActionRows={expandedActionRows}
                        editingActionId={editingActionId}
                        onToggleActionRow={onToggleActionRow}
                        onStartEditAction={onStartEditAction}
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
                )
            })}
        </>
    )
}

export default AutoActionsView
