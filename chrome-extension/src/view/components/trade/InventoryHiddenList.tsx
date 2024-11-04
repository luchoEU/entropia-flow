import React from 'react'
import { setHiddenInventoryExpanded, setHiddenInventoryFilter, showAll, showByContainer, showByName, showByValue, sortHiddenBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter, ItemHidden } from '../../application/state/inventory'
import SortableTableSection, { ItemRowColumnData, ItemRowData, SortRowData } from '../common/SortableTableSection'
import { getHiddenInventory, getHiddenInventoryItem } from '../../application/selectors/inventory'
import { useSelector } from 'react-redux'

const columns = [NAME, QUANTITY, VALUE, CONTAINER]
const sortRowData: SortRowData = {
    [NAME]: { justifyContent: 'center' },
    [QUANTITY]: { justifyContent: 'end' },
    [VALUE]: { justifyContent: 'end' },
}
const getRowData = (item: ItemHidden): ItemRowData => ({
    columns: {
        [NAME]: {
            sub: [{
                visible: item.criteria.name,
                imgButton: {
                    title: 'Show this item name',
                    src: 'img/tick.png',
                    dispatch: () => showByName(item.data.n)
                }
            }, {
                flex: 1,
                itemText: item.data.n
            }, {
                imgButton: {
                    title: 'Search by this item name',
                    src: 'img/find.png',
                    dispatch: () => setHiddenInventoryFilter(`!${item.data.n}`)
                }
            }]
        },
        [QUANTITY]: {
            style: { justifyContent: 'center' },
            sub: [{
                itemText: item.data.q
            }]
        },
        [VALUE]: {
            style: { justifyContent: 'end' },
            sub: [{
                visible: item.criteria.value,
                imgButton: {
                    title: 'Show this value or higher',
                    src: 'img/tick.png',
                    dispatch: () => showByValue(item.data.v)
                }
            }, {
                itemText: item.data.v + ' PED'
            }]
        },
        [CONTAINER]: {
            sub: [{
                visible: item.criteria.container,
                imgButton: {
                    title: 'Show this container',
                    src: 'img/tick.png',
                    dispatch: () => showByContainer(item.data.c)
                }
            }, {
                itemText: item.data.c
            }]
        }
    }
});

const searchRowAfterTotalColumnData: ItemRowColumnData = {
    sub: [{
        class: 'show-all',
        imgButton: {
            title: 'Clear all hide filters',
            text: 'Unhide All',
            src: 'img/tick.png',
            dispatch: showAll
        }
    }]
}

const InventoryHiddenList = () => {
    const inv: InventoryListWithFilter<ItemHidden> = useSelector(getHiddenInventory)

    return (
        <SortableTableSection
            title='Hidden List'
            expanded={inv.originalList.expanded}
            filter={inv.filter}
            allItems={inv.originalList.items}
            showItems={inv.showList.items}
            sortType={inv.showList.sortType}
            stats={inv.showList.stats}
            setExpanded={setHiddenInventoryExpanded}
            setFilter={setHiddenInventoryFilter}
            sortBy={sortHiddenBy}
            columns={columns}
            definition={sortColumnDefinition}
            sortRowData={sortRowData}
            getRowData={getRowData}
            itemSelector={getHiddenInventoryItem}
            searchRowAfterTotalColumnData={searchRowAfterTotalColumnData}
        />
    )
}

export default InventoryHiddenList
