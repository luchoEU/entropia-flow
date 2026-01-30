import React from 'react'
import { useAtom } from 'jotai'
import { ViewItemData } from '../../../application/state/history'
import { ItemExclusionConfig, SortableItemsTable } from '../SortableItemsTable'
import { activityAtom } from '../../../application/atoms/activity'

interface ItemsViewProps {
    itemExclusionConfig: ItemExclusionConfig
    sessionStartTime?: number
    sessionEndTime?: number
}

const ItemsView: React.FC<ItemsViewProps> = ({
    itemExclusionConfig,
    sessionStartTime = 0,
    sessionEndTime = Infinity,
}) => {
    const [activity] = useAtom(activityAtom)

    const items: ViewItemData[] = activity.data.items
        .filter(item => item.timestamp >= sessionStartTime && item.timestamp < sessionEndTime)
        .map(item => ({
            t: item.timestamp,
            s: item.source,
            key: item.id,
            n: item.name,
            q: (item.quantity ?? 0).toString(),
            v: (item.value ?? 0).toFixed(2),
            c: item.container
        }))

    return (
        <SortableItemsTable
            items={items}
            exclusionConfig={itemExclusionConfig}
        />
    )
}

export default ItemsView
