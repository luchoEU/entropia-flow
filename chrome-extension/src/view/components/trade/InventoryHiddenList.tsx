import React from 'react'
import { setHiddenInventoryExpanded, setHiddenInventoryFilter, showAll, showByContainer, showByName, showByValue, sortHiddenBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter, ItemHidden } from '../../application/state/inventory'
import SortableTableSection, { ItemRowColumnData, TableData } from '../common/SortableTableSection'
import { getHiddenInventory, getHiddenInventoryItem } from '../../application/selectors/inventory'
import { useSelector } from 'react-redux'

const tableData: TableData<ItemHidden> = {
    columns: [NAME, QUANTITY, VALUE, CONTAINER],
    definition: sortColumnDefinition,
    sortRow: {
        [NAME]: { justifyContent: 'center' },
        [QUANTITY]: { justifyContent: 'end' },
        [VALUE]: { justifyContent: 'end' },
    },
    getRow: (item: ItemHidden) => ({
        columns: {
            [NAME]: {
                sub: [{
                    visible: item.criteria.name,
                    imgButton: { title: 'Show this item name', src: 'img/tick.png', dispatch: () => showByName(item.data.n) }
                }, {
                    flex: 1, itemText: item.data.n
                }, {
                    imgButton: { title: 'Search by this item name', src: 'img/find.png', dispatch: () => setHiddenInventoryFilter(`!${item.data.n}`) }
                }]
            },
            [QUANTITY]: {
                style: { justifyContent: 'center' },
                sub: [{ itemText: item.data.q }]
            },
            [VALUE]: {
                style: { justifyContent: 'end' },
                sub: [{
                    visible: item.criteria.value,
                    imgButton: { title: 'Show this value or higher', src: 'img/tick.png', dispatch: () => showByValue(item.data.v) }
                }, {
                    itemText: item.data.v + ' PED'
                }]
            },
            [CONTAINER]: {
                sub: [{
                    visible: item.criteria.container,
                    imgButton: { title: 'Show this container', src: 'img/tick.png', dispatch: () => showByContainer(item.data.c) }
                }, {
                    itemText: item.data.c
                }]
            }
        }
    })
}

const searchRowAfterTotalColumnData: ItemRowColumnData = {
    sub: [{
        class: 'show-all',
        title: 'Clear all hide filters',
        imgButton: {
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
            stats={inv.showList.stats}
            setExpanded={setHiddenInventoryExpanded}
            setFilter={setHiddenInventoryFilter}
            searchRowAfterTotalColumnData={searchRowAfterTotalColumnData}
            table={{
                allItems: inv.originalList.items,
                showItems: inv.showList.items,
                sortType: inv.showList.sortType,
                sortBy: sortHiddenBy,
                itemSelector: getHiddenInventoryItem,
                tableData
            }}
        />
    )
}

export default InventoryHiddenList
