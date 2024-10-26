import React from 'react'
import { setHiddenInventoryExpanded, setHiddenInventoryFilter, showAll, showByContainer, showByName, showByValue, sortHiddenBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter, ItemHidden } from '../../application/state/inventory'
import SortableTableSection, { ItemRowData, SortRowData } from '../common/SortableTableSection'
import { getHiddenInventory, getHiddenInventoryItem } from '../../application/selectors/inventory'
import { useSelector } from 'react-redux'

const columns = [NAME, QUANTITY, VALUE, CONTAINER]
const sortRowData: SortRowData = {
    [NAME]: { justifyContent: 'center' },
    [QUANTITY]: { justifyContent: 'end' },
    [VALUE]: { justifyContent: 'end' },
}
const getRowData = (item: ItemHidden): ItemRowData => ({
    [NAME]: {
        sub: [{
            visible: item.criteria.name !== undefined,
            button: {
                title: 'Show this item name',
                src: 'img/tick.png',
                dispatch: () => showByName(item.data.n)
            }
        }, {
            text: item.data.n
        }, {
            button: {
                title: 'Search by this item name',
                src: 'img/find.jpg',
                dispatch: () => setHiddenInventoryFilter(`!${item.data.n}`)
            }
        }]
    },
    [QUANTITY]: {
        justifyContent: 'center',
        sub: [{
            text: item.data.q
        }]
    },
    [VALUE]: {
        justifyContent: 'end',
        sub: [{
            visible: item.criteria.value !== undefined,
            button: {
                title: 'Show this value or higher',
                src: 'img/tick.png',
                dispatch: () => showByValue(item.data.v)
            }
        }, {
            text: item.data.v + ' PED'
        }]
    },
    [CONTAINER]: {
        sub: [{
            visible: item.criteria.container !== undefined,
            button: {
                title: 'Show this container',
                src: 'img/tick.png',
                dispatch: () => showByContainer(item.data.c)
            }
        }, {
            text: item.data.c
        }]
    }
});

const searchRowData = {
    sub: [{
        button: {
            title: 'Clear all hide filters',
            text: 'Unhide All',
            class: 'show-all',
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
            setExpanded={setHiddenInventoryExpanded}
            setFilter={setHiddenInventoryFilter}
            sortBy={sortHiddenBy}
            columns={columns}
            definition={sortColumnDefinition}
            inv={inv}
            sortRowData={sortRowData}
            getRowData={getRowData}
            itemSelector={getHiddenInventoryItem}
//            searchRowData={searchRowData}
        />
    )
}

export default InventoryHiddenList
