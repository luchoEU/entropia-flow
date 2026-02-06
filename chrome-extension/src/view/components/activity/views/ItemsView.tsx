import React, { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { atom } from 'jotai'
import { activityAtom } from '../../../application/atoms/activity'
import { JotaiSortableTable } from '../../common/jotai/JotaiSortableTable'
import ItemText from '../../common/ItemText'

interface ItemsViewProps {
    sessionStartTime?: number
    sessionEndTime?: number
}

const ItemsView: React.FC<ItemsViewProps> = ({
    sessionStartTime = 0,
    sessionEndTime = Infinity,
}) => {
    const activity = useAtomValue(activityAtom)

    // Create atom for filtered items
    const itemsAtom = useMemo(() => {
        return atom((get) => {
            const act = get(activityAtom)
            return act.data.items
                .filter(item => item.timestamp >= sessionStartTime && item.timestamp < sessionEndTime)
                .map(item => ({
                    id: item.id,
                    timestamp: item.timestamp,
                    source: item.source,
                    name: item.name,
                    quantity: item.quantity ?? 0,
                    value: item.value ?? 0,
                    container: item.container
                }))
        })
    }, [sessionStartTime, sessionEndTime])

    // Column configuration
    const columns = useMemo(() => [
        {
            id: 'timestamp' as const,
            header: 'Time',
            width: 180,
            sortAccessor: (item: any) => item.timestamp,
            renderRowCell: (item: any) => {
                const date = new Date(item.timestamp)
                return !isNaN(date.getTime()) ? date.toLocaleString() : '-'
            }
        },
        {
            id: 'name' as const,
            header: 'Item',
            width: 150,
            sortAccessor: (item: any) => item.name,
            renderRowCell: (item: any) => <ItemText text={item.name} />
        },
        {
            id: 'quantity' as const,
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: any) => item.quantity,
            renderRowCell: (item: any) => item.quantity.toString(),
            justifyContent: 'end' as const
        },
        {
            id: 'value' as const,
            header: 'Value',
            width: 120,
            sortAccessor: (item: any) => item.value,
            renderRowCell: (item: any) => `${item.value.toFixed(2)} PED`,
            justifyContent: 'end' as const
        },
        {
            id: 'container' as const,
            header: 'Container',
            width: 150,
            sortAccessor: (item: any) => item.container,
            renderRowCell: (item: any) => item.container || '-'
        },
        {
            id: 'source' as const,
            header: 'Source',
            width: 120,
            sortAccessor: (item: any) => item.source,
            renderRowCell: (item: any) => item.source || '-'
        }
    ], [])

    return (
        <JotaiSortableTable
            itemsAtom={itemsAtom}
            config={{
                title: 'Items',
                columns,
                itemTypeName: 'item',
                getRowKey: (item: any) => item.id
            }}
        />
    )
}

export default ItemsView
