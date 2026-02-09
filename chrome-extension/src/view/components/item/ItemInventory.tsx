import { useMemo } from 'react'
import { atom, useAtomValue } from "jotai"
import { ItemData } from "../../../common/state"
import { JotaiSortableTable } from '../common/jotai/JotaiSortableTable'
import { addZeroes } from '../craft/CraftBlueprint'
import { byStoreStateAtom } from '../../application/atoms/inventory'
import { itemsMapAtom } from '../../application/atoms/items'
import { getRefinedChainForItem } from '../../application/helpers/inventory'
import { getContainerBreadcrumb } from '../../application/helpers/inventory.byStore'

interface ItemInventoryProps {
    materialItems: string[]
}

const ItemInventory = ({ materialItems }: ItemInventoryProps) => {
    const byStore = useAtomValue(byStoreStateAtom)
    const itemsMap = useAtomValue(itemsMapAtom)

    // Filter inventory items by the provided names and calculate breadcrumbs
    const { filteredItems, breadcrumbMap } = useMemo(() => {
        if (!byStore || !byStore.items) return { filteredItems: [], breadcrumbMap: new Map() }

        const nameSet = new Set(materialItems)
        const items = byStore.items.filter(item => nameSet.has(item.n))

        // Precompute breadcrumbs for all filtered items
        const breadcrumbs = new Map<string, string[]>()
        items.forEach(item => {
            breadcrumbs.set(item.id, getContainerBreadcrumb(item, byStore.items))
        })

        return { filteredItems: items, breadcrumbMap: breadcrumbs }
    }, [byStore, materialItems])

    const itemsAtom = useMemo(() => atom(filteredItems), [filteredItems])

    const columns = useMemo(() => [
        {
            id: 'name',
            header: 'Name',
            width: 200,
            sortAccessor: (item: ItemData) => item.n,
            filterAccessor: (item: ItemData) => item.n,
            renderRowCell: (item: ItemData) => item.n
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: ItemData) => Number(item.q),
            filterAccessor: (item: ItemData) => item.q,
            renderRowCell: (item: ItemData) => item.q
        },
        {
            id: 'value',
            header: 'Value',
            width: 100,
            sortAccessor: (item: ItemData) => Number(item.v),
            filterAccessor: (item: ItemData) => item.v,
            renderRowCell: (item: ItemData) => addZeroes(Number(item.v))
        },
        {
            id: 'container',
            header: 'Location',
            width: 250,
            sortAccessor: (item: ItemData) => item.c,
            filterAccessor: (item: ItemData) => {
                const breadcrumb = breadcrumbMap.get(item.id) ?? []
                return breadcrumb.join(' ')
            },
            renderRowCell: (item: ItemData) => {
                const breadcrumb = breadcrumbMap.get(item.id) ?? []
                return breadcrumb.length > 0 ? breadcrumb.join(' → ') : item.c
            }
        }
    ], [breadcrumbMap, itemsMap])

    if (materialItems.length === 0) {
        return (
            <div style={{ marginTop: '12px' }}>
                <h3 style={{ marginBottom: '8px' }}>Inventory Materials</h3>
                <p style={{ color: '#999' }}>None in inventory</p>
            </div>
        )
    }

    return (
        <div style={{ marginTop: '12px' }}>
            <h3 style={{ marginBottom: '8px' }}>Inventory Materials</h3>
            <JotaiSortableTable
                itemsAtom={itemsAtom}
                config={{ columns }}
                useFixedSizeList={false}
            />
        </div>
    )
}

export default ItemInventory
