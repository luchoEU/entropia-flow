import { ActivityItem } from '../../application/state/activity'
import { ViewItemData } from '../../application/state/history'

export const calculateActionTotal = (
    itemIds: number[],
    getInventoryItem: (id: number) => ActivityItem | undefined
): number => {
    return itemIds.reduce((sum, itemId) => {
        const item = getInventoryItem(itemId)
        return sum + (item ? item.value : 0)
    }, 0)
}

export const calculateViewItemsTotal = (items: ViewItemData[]): number => {
    return items.reduce((sum, item) => sum + (Number(item.v) ?? 0), 0)
}
