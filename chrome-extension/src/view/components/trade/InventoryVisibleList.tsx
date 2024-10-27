import React from 'react'
import { ItemData } from '../../../common/state'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter } from '../../application/state/inventory'
import SortableTableSection, { ItemRowData, SortRowData } from '../common/SortableTableSection'
import { getVisibleInventory, getVisibleInventoryItem } from '../../application/selectors/inventory';
import { useSelector } from 'react-redux'

const columns = [NAME, QUANTITY, VALUE, CONTAINER]
const sortRowData: SortRowData = {
    [NAME]: { justifyContent: 'center' },
    [QUANTITY]: { justifyContent: 'end' },
    [VALUE]: { justifyContent: 'end' },
}
const getRowData = (item: ItemData): ItemRowData => ({
    columns: {
        [NAME]: {
            sub: [{
                button: {
                    title: 'Hide this item name',
                    src: 'img/cross.png',
                    dispatch: () => hideByName(item.n)
                }
            }, {
                text: item.n
            }, {
                button: {
                    title: 'Search by this item name',
                    src: 'img/find.jpg',
                    dispatch: () => setVisibleInventoryFilter(`!${item.n}`)
                }
            }]
        },
        [QUANTITY]: {
            style: { justifyContent: 'center' },
            sub: [{
                text: item.q
            }]
        },
        [VALUE]: {
            style: { justifyContent: 'end' },
            sub: [{
                button: {
                    title: 'Hide this value or lower',
                    src: 'img/cross.png',
                    dispatch: () => hideByValue(item.v)
                }
            }, {
                text: item.v + ' PED'
            }]
        },
        [CONTAINER]: {
            sub: [{
                button: {
                    title: 'Hide this container',
                    src: 'img/cross.png',
                    dispatch: () => hideByContainer(item.c)
                }
            }, {
                text: item.c
            }]
        }
    }
});

const InventoryVisibleList = () => {
    const inv: InventoryListWithFilter<ItemData> = useSelector(getVisibleInventory)

    return (
        <SortableTableSection
            title='Owned List'
            expanded={inv.originalList.expanded}
            filter={inv.filter}
            allItems={inv.originalList.items}
            showItems={inv.showList.items}
            sortType={inv.showList.sortType}
            stats={inv.showList.stats}
            setExpanded={setVisibleInventoryExpanded}
            setFilter={setVisibleInventoryFilter}
            sortBy={sortVisibleBy}
            columns={columns}
            definition={sortColumnDefinition}
            sortRowData={sortRowData}
            getRowData={getRowData}
            itemSelector={getVisibleInventoryItem}
        />
    )
}

export default InventoryVisibleList