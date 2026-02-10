import React, { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { atom } from 'jotai'
import { activityAtom } from '../../../application/atoms/activity'
import { JotaiSortableTable } from '../../common/jotai/JotaiSortableTable'

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
            id: 'timestamp',
            header: 'Time',
            width: 180,
            sortAccessor: (item: any) => item.timestamp,
            renderRow: (item: any) => {
                const date = new Date(item.timestamp)
                const text = !isNaN(date.getTime()) ? date.toLocaleString() : '-'
                return { type: 'text' as const, value: text }
            }
        },
        {
            id: 'name',
            header: 'Item',
            width: 150,
            sortAccessor: (item: any) => item.name,
            renderRow: (item: any) => ({
                type: 'text' as const,
                value: item.name,
                title: item.name
            })
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: any) => item.quantity,
            renderRow: (item: any) => ({
                type: 'text' as const,
                value: item.quantity.toString()
            }),
            justifyContent: 'end' as const
        },
        {
            id: 'value',
            header: 'Value',
            width: 120,
            sortAccessor: (item: any) => item.value,
            renderRow: (item: any) => ({
                type: 'text' as const,
                value: `${item.value.toFixed(2)} PED`
            }),
            justifyContent: 'end' as const
        },
        {
            id: 'container',
            header: 'Container',
            width: 150,
            sortAccessor: (item: any) => item.container,
            renderRow: (item: any) => ({
                type: 'text' as const,
                value: item.container || '-'
            })
        },
        {
            id: 'source',
            header: 'Source',
            width: 120,
            sortAccessor: (item: any) => item.source,
            renderRow: (item: any) => ({
                type: 'text' as const,
                value: item.source || '-'
            })
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
