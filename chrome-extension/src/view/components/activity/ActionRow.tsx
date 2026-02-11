import React from 'react'
import { NavigateFunction } from 'react-router-dom'
import { StoredAction, ActivityItem, formatActionDescription, actionTypeInfo, SessionType, getActionTimestamp } from '../../application/state/activity'
import ItemText from '../common/ItemText'
import ImgButton from '../common/ImgButton'
import { TabId } from '../../application/state/navigation'
import { ItemExclusionConfig } from './SortableItemsTable'
import BaseActionRow from './BaseActionRow'

export interface ActionExclusionConfig {
    sessionId: string
    sessionType: SessionType
    isExcluded: boolean
    isPermanentlyExcluded: boolean
    onExclude: () => void
    onInclude: () => void
    onPermanentExclude: (value: boolean) => void
}

interface ActionRowProps {
    action: StoredAction
    isExpanded: boolean
    isEditing: boolean
    onToggle: () => void
    onStartEdit: () => void
    onUpdateType: (type: string) => void
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

const ActionRow: React.FC<ActionRowProps> = ({
    action,
    isExpanded,
    isEditing,
    onToggle,
    onStartEdit,
    onUpdateType,
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
    const itemIds = getAllItemIds(action)
    const total = itemIds.reduce((sum, itemId) => {
        const item = getInventoryItem(itemId)
        return sum + (item ? item.value : 0)
    }, 0)
    const excluded = exclusionConfig?.isExcluded ?? false
    const permanent = exclusionConfig?.isPermanentlyExcluded ?? false

    const normalNameContent = (
        <div>
            <ItemText text={formatActionDescription(action, getInventoryItem)} />
            {action.budgetName && isBudgetEnabled && (
                <span
                    style={{ marginLeft: '10px', textDecoration: 'underline', cursor: 'pointer', color: 'blue' }}
                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`${TabId.BUDGET}/${action.budgetName!}`)
                    }}
                >
                    [📊Budget]
                </span>
            )}
        </div>
    )

    const editNameContent = (
        <div>
            <select
                value={action.type}
                onChange={(e) => onUpdateType(e.target.value as any)}
                style={{ marginRight: '5px' }}
            >
                {Object.entries(actionTypeInfo).map(([type, info]) => (
                    <option key={type} value={type}>{info.icon} {info.name}</option>
                ))}
            </select>
            {action.budgetName && isBudgetEnabled && (
                <span
                    style={{ marginLeft: '10px', textDecoration: 'underline', cursor: 'pointer', color: 'blue' }}
                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`${TabId.BUDGET}/${action.budgetName!}`)
                    }}
                >
                    [📊Budget]
                </span>
            )}
        </div>
    )

    const actionsContent = (
        <div>
            <ImgButton
                title="Copy to clipboard"
                src="img/copy.png"
                className="img-btn-copy"
                clickPopup="Copied!"
                action={() => {
                    const text = buildCopyTextForAction(action)
                    copyToClipboard(text)
                }}
            />
            {exclusionConfig && (
                permanent ? (
                    <ImgButton
                        title='Remove permanent exclusion from the sum'
                        src='img/forbidden.png'
                        show
                        action={() => exclusionConfig.onPermanentExclude(false)}
                    />
                ) : excluded ? (
                    <>
                        <ImgButton
                            title='Include this action in the sum'
                            src='img/cross.png'
                            show
                            action={() => exclusionConfig.onInclude()}
                        />
                        <ImgButton
                            title='Permanently exclude this action type from the sum'
                            src='img/forbidden.png'
                            action={() => exclusionConfig.onPermanentExclude(true)}
                        />
                    </>
                ) : (
                    <ImgButton
                        title='Exclude this action from the sum'
                        src='img/cross.png'
                        action={() => exclusionConfig.onExclude()}
                    />
                )
            )}
            <span className='action-sources'>
                {action.sources.join(', ')}
            </span>
        </div>
    )

    return (
        <>
            <BaseActionRow
                timestamp={getActionTimestamp(action, getInventoryItem)}
                total={total}
                isExpanded={isExpanded}
                onToggleExpand={onToggle}
                isEditing={isEditing}
                onStartEdit={onStartEdit}
                editNameContent={editNameContent}
            >
                {[normalNameContent, actionsContent]}
            </BaseActionRow>
            {isExpanded && itemIds.length > 0 &&
                <tr>
                    <td></td>
                    <td colSpan={4}>
                        <table className='table-diff' style={{ paddingLeft: '40px' }}>
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
                    </td>
                </tr>
            }
        </>
    )
}

export default ActionRow
