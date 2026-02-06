import React, { useMemo } from 'react'
import { atom, Atom } from 'jotai'
import { ItemData } from '../../../common/state'
import { InventoryList } from '../../application/state/inventory'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'
import { useSetAtom } from 'jotai'
import { addAvailableAtom, removeAvailableAtom, auctionItemsAtom, availableItemsAtom } from '../../application/atoms/inventory'

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
    const columns = useMemo(() => [
        {
            id: 'name',
            header: 'Name',
            width: 150,
            sortAccessor: (item: ItemData) => item.n,
            filterAccessor: (item: ItemData) => item.n,
            renderRowCell: (item: ItemData) => (
                <ItemText className={classMap[item.n]} text={item.n} />
            )
        },
        {
            id: 'favorite',
            header: '',
            width: 30,
            renderRowCell: (item: ItemData) => (
                isFavorite(item.n) ?
                    <ImgButton title='Remove from Favorites' src='img/staron.png' dispatch={() => setRemove(item.n)} /> :
                    <ImgButton title='Add to Favorites' src='img/staroff.png' dispatch={() => setAdd(item.n)} />
            )
        },
        {
            id: 'quantity',
            header: 'Quantity',
            width: 80,
            sortAccessor: (item: ItemData) => parseFloat(item.q),
            filterAccessor: (item: ItemData) => item.q,
            renderRowCell: (item: ItemData) => <ItemText text={item.q} />,
            justifyContent: 'end' as const
        },
        {
            id: 'value',
            header: 'Value',
            width: 100,
            sortAccessor: (item: ItemData) => parseFloat(item.v),
            filterAccessor: (item: ItemData) => item.v,
            renderRowCell: (item: ItemData) => <ItemText text={item.v + ' PED'} />,
            justifyContent: 'end' as const
        }
    ], [classMap, isFavorite, setAdd, setRemove])

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