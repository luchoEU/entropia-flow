import React, { useMemo } from 'react'
import { atom, Atom } from 'jotai'
import { ItemData } from '../../../common/state'
import { InventoryList } from '../../application/state/inventory'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { useSetAtom } from 'jotai'
import { addAvailableAtom, removeAvailableAtom } from '../../application/atoms/inventory'
import { JotaiTableColumn } from '../common/jotai/JotaiTableTypes'

interface TradeListProps {
    selector: string,
    title: string,
    subtitle: string,
    list: InventoryList<ItemData>,
    isFavorite: (name: string) => boolean,
    classMap: { [k: string]: string },
    itemsAtom?: Atom<ItemData[]>  // Optional: pass the source atom directly
}

const TradeList = (p: TradeListProps) => {
    const { selector, title, subtitle, list, isFavorite, classMap, itemsAtom: sourceAtom } = p
    const setAdd = useSetAtom(addAvailableAtom)
    const setRemove = useSetAtom(removeAvailableAtom)

    // Use source atom if provided, otherwise create a derived atom from the list
    // This ensures the component stays reactive to upstream atom changes
    const itemsAtom = useMemo(() => {
        if (sourceAtom) {
            return sourceAtom
        }
        // Fallback: create a derived atom that always reflects the current list
        return atom((get) => list.items)
    }, [sourceAtom, list.items])

    // Column configuration
    const columns: JotaiTableColumn<ItemData>[] = useMemo(() => [
        {
            id: 'name',
            header: 'Name',
            flex: 1,
            sortAccessor: (item: ItemData) => item.n,
            filterAccessor: (item: ItemData) => item.n,
            renderRow: (item: ItemData) => ({
                type: 'text',
                value: item.n,
                title: item.n
            })
        },
        {
            id: 'favorite',
            header: '',
            renderRow: (item: ItemData) => ({
                type: 'button',
                icon: isFavorite(item.n) ? 'img/staron.png' : 'img/staroff.png',
                width: 16,
                title: isFavorite(item.n) ? 'Remove from Favorites' : 'Add to Favorites',
                onClick: () => isFavorite(item.n) ? setRemove(item.n) : setAdd(item.n)
            })
        },
        {
            id: 'quantity',
            header: 'Quantity',
            sortAccessor: (item: ItemData) => parseFloat(item.q),
            filterAccessor: (item: ItemData) => item.q,
            renderRow: (item: ItemData) => ({
                type: 'text',
                value: item.q,
                title: item.q
            }),
            justifyContent: 'end'
        },
        {
            id: 'value',
            header: 'Value',
            sortAccessor: (item: ItemData) => parseFloat(item.v),
            filterAccessor: (item: ItemData) => item.v,
            renderRow: (item: ItemData) => ({
                type: 'text',
                value: item.v + ' PED',
                title: item.v + ' PED'
            }),
            justifyContent: 'end'
        }
    ], [isFavorite, setAdd, setRemove])

    return (
        <JotaiSortableTableSection
            selector={selector}
            title={title}
            subtitle={subtitle}
            itemsAtom={itemsAtom}
            config={{
                title: title,
                columns,
                itemTypeName: 'item',
                getPedValue: (item: ItemData) => parseFloat(item.v),
                getRowKey: (item: ItemData) => item.id
            }}
        />
    )
}

export default TradeList