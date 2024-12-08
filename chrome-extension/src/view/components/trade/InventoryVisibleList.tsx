import React from 'react'
import { ItemData } from '../../../common/state'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, TT_SERVICE_COLUMN, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter } from '../../application/state/inventory'
import SortableTableSection, { TableData } from '../common/SortableTableSection'
import { getVisibleInventory, getVisibleInventoryItem } from '../../application/selectors/inventory';
import { useSelector } from 'react-redux'
import { SHOW_TT_SERVICE } from '../../../config'
import { getTTServiceItemValue } from '../../application/selectors/ttService'
import { reloadTTService } from '../../application/actions/ttService'

const tableData: TableData<ItemData> = {
    columns: [NAME, QUANTITY, VALUE, CONTAINER],
    definition: sortColumnDefinition,
    sortRow: {
        [NAME]: { justifyContent: 'center' },
        [QUANTITY]: { justifyContent: 'end' },
        [VALUE]: { justifyContent: 'end' },
        [TT_SERVICE_COLUMN]: { justifyContent: 'end', show: SHOW_TT_SERVICE, sortable: false, sub: [
            { title: 'Reload TT Service from sheet', imgButton: { src: 'img/reload.png', dispatch: () => reloadTTService }}
        ] },
    },
    getRow: (item: ItemData) => {
        let ttServiceValue = ''
        if (SHOW_TT_SERVICE) {
            /*const v = useSelector(getTTServiceItemValue(item.n)) // useSelector does not work here
            if (v) {
                ttServiceValue = v.toFixed(2) + ' PED'
            }*/
        }
        return {
            columns: {
                [NAME]: {
                    sub: [{
                        title: 'Hide this item name', imgButton: { src: 'img/cross.png', dispatch: () => hideByName(item.n) }
                    }, {
                        flex: 1, itemText: item.n
                    }, {
                        title: 'Search by this item name', imgButton: { src: 'img/find.png', dispatch: () => setVisibleInventoryFilter(`!${item.n}`) }
                    }]
                },
                [QUANTITY]: {
                    style: { justifyContent: 'center' },
                    sub: [{ itemText: item.q }]
                },
                [VALUE]: {
                    style: { justifyContent: 'end' },
                    sub: [{
                        title: 'Hide this value or lower', imgButton: { src: 'img/cross.png', dispatch: () => hideByValue(item.v) }
                    }, {
                        itemText: item.v + ' PED'
                    }]
                },
                [CONTAINER]: {
                    sub: [{
                        title: 'Hide this container', imgButton: { src: 'img/cross.png', dispatch: () => hideByContainer(item.c) }
                    }, {
                        itemText: item.c
                    }]
                },
                [TT_SERVICE_COLUMN]: {
                    sub: [{
                        itemText: ttServiceValue
                    }]
                }
            }
        }
    }
};

const InventoryVisibleList = () => {
    const inv: InventoryListWithFilter<ItemData> = useSelector(getVisibleInventory)

    return (
        <SortableTableSection
            title='Owned List'
            expanded={inv.originalList.expanded}
            filter={inv.filter}
            stats={inv.showList.stats}
            setExpanded={setVisibleInventoryExpanded}
            setFilter={setVisibleInventoryFilter}
            table={{
                allItems: inv.originalList.items,
                showItems: inv.showList.items,
                sortType: inv.showList.sortType,
                sortBy: sortVisibleBy,
                itemSelector: getVisibleInventoryItem,
                tableData
            }}
        />
    )
}

export default InventoryVisibleList