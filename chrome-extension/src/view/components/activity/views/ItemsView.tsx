import React from 'react'
import { ViewItemData } from '../../../application/state/history'
import { ItemExclusionConfig, SortableItemsTable } from '../SortableItemsTable'
import { StoredAction, ActivityItem } from '../../../application/state/activity'

interface ItemsViewProps {
    sessionActions: StoredAction[]
    itemExclusionConfig: ItemExclusionConfig
    getAllItemIds: (action: StoredAction) => number[]
    getInventoryItemWithFallback: (itemId: number, fallbackTimestamp?: number) => ActivityItem
}

const ItemsView: React.FC<ItemsViewProps> = ({
    sessionActions,
    itemExclusionConfig,
    getAllItemIds,
    getInventoryItemWithFallback,
}) => {
    // Extract all unique items from session actions
    const itemIds = new Set<number>()
    sessionActions.forEach(action => {
        getAllItemIds(action).forEach(itemId => itemIds.add(itemId))
    })

    const items: ViewItemData[] = Array.from(itemIds).map(itemId => {
        const item = getInventoryItemWithFallback(itemId)
        return {
            key: item.id,
            n: item.name,
            q: (item.quantity ?? 0).toString(),
            v: (item.value ?? 0).toFixed(2),
            c: item.container
        }
    })

    return (
        <SortableItemsTable
            items={items}
            exclusionConfig={itemExclusionConfig}
        />
    )
}

export default ItemsView
