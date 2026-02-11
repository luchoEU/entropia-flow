import { useMemo } from 'react'
import { atom, useAtomValue } from "jotai"
import { ItemData } from "../../../common/state"
import { JotaiSortableTable } from '../common/jotai/JotaiSortableTable'
import { addZeroes } from '../craft/CraftBlueprint'
import { rawInventoryItemsAtom } from '../../application/atoms/inventory'
import { CollapsibleTradeItemDetailsSection } from '../common/CollapsibleTradeItemDetailsSection'

interface ItemInventoryProps {
    materialItems: string[]
}

const ItemInventory = ({ materialItems }: ItemInventoryProps) => {
    const rawItems = useAtomValue(rawInventoryItemsAtom)

    // Filter inventory items by the provided names
    const filteredItems = useMemo(() => {
        if (!rawItems || rawItems.length === 0) return []

        const nameSet = new Set(materialItems)
        const allItemsData = rawItems.map(item => item.data)
        return allItemsData.filter(item => nameSet.has(item.n))
    }, [rawItems, materialItems])

    const itemsAtom = useMemo(() => atom(filteredItems), [filteredItems])

    const columns = useMemo(() => [
        {
            id: 'name',
            header: 'Name',
            width: 200,
            sortAccessor: (item: ItemData) => item.n,
            filterAccessor: (item: ItemData) => item.n,
            renderRow: (item: ItemData) => ({
                type: 'text' as const,
                value: item.n
            })
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 100,
            sortAccessor: (item: ItemData) => Number(item.q),
            filterAccessor: (item: ItemData) => item.q,
            renderRow: (item: ItemData) => ({
                type: 'text' as const,
                value: item.q
            })
        },
        {
            id: 'value',
            header: 'Value',
            width: 100,
            sortAccessor: (item: ItemData) => Number(item.v),
            filterAccessor: (item: ItemData) => item.v,
            renderRow: (item: ItemData) => ({
                type: 'text' as const,
                value: addZeroes(Number(item.v))
            })
        },
        {
            id: 'container',
            header: 'Location',
            width: 250,
            sortAccessor: (item: ItemData) => item.c,
            filterAccessor: (item: ItemData) => item.c,
            renderRow: (item: ItemData) => ({
                type: 'text' as const,
                value: item.c
            })
        }
    ], [])

    if (materialItems.length === 0) {
        return (
            <CollapsibleTradeItemDetailsSection title='Inventory Materials' sectionKey='inventoryMaterials'>
                <p style={{ color: '#999' }}>None in inventory</p>
            </CollapsibleTradeItemDetailsSection>
        )
    }

    return (
        <CollapsibleTradeItemDetailsSection title='Inventory Materials' sectionKey='inventoryMaterials'>
            <JotaiSortableTable
                itemsAtom={itemsAtom}
                config={{ columns }}
                useFixedSizeList={false}
            />
        </CollapsibleTradeItemDetailsSection>
    )
}

export default ItemInventory
