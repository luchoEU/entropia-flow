import React from 'react'
import { useSelector } from 'react-redux'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing, sortByStoreBy, setByStoreItemStared, setByStoreStaredInventoryFilter, sortByStoreStaredBy, setByStoreStaredInventoryExpanded, setByStoreStaredItemExpanded, setByStoreStaredItemStared, setByStoreStaredItemName, cancelByStoreStaredItemNameEditing, startByStoreStaredItemNameEditing, confirmByStoreStaredItemNameEditing, setByStoreAllItemsExpanded, setByStoreStaredAllItemsExpanded } from '../../application/actions/inventory'
import { InventoryByStore, TreeLineData } from '../../application/state/inventory'
import { CONTAINER, NAME, QUANTITY, VALUE, sortColumnDefinition } from '../../application/helpers/inventory.sort'
import SortableTableSection, { ItemRowColumnData, ItemRowData, SortRowData } from '../common/SortableTableSection'
import { getByStoreInventory, getByStoreInventoryItem, getByStoreInventoryStaredItem } from '../../application/selectors/inventory'

const INDENT_SPACE = 10

interface ItemRowEvents {
    setItemExpanded: (id: string) => (expanded: boolean) => any,
    setItemName: (id: string, name: string) => any,
    cancelItemNameEditing: (id: string) => any,
    confirmItemNameEditing: (id: string) => any,
    startItemNameEditing: (id: string) => any,
    setItemStared: (id: string, stared: boolean) => any,
    setFilter: (filter: string) => any
}

const columnsStaredContainers = [NAME, CONTAINER, QUANTITY, VALUE]
const columnsContainers = [NAME, QUANTITY, VALUE]
const sortRowData: SortRowData = {
    [NAME]: { justifyContent: 'center' },
    [CONTAINER] : { text: 'Planet' },
    [QUANTITY]: { justifyContent: 'end' },
    [VALUE]: { justifyContent: 'end' },
}
const getRowData = (v: ItemRowEvents) => (item: TreeLineData): ItemRowData => ({
    dispatch: item.expanded !== undefined ? () => v.setItemExpanded(item.id)(!item.expanded) : undefined,
    columns: {
        [NAME]: {
            style: { paddingLeft: item.indent * INDENT_SPACE },
            sub: [
                { plusButton: { expanded: item.expanded, setExpanded: v.setItemExpanded(item.id) } },
                ...item.isEditing ? [
                    { input: { value: item.n, onChange: (value: string) => v.setItemName(item.id, value) } },
                    { title: 'Cancel', imgButton: { src: 'img/cross.png', show: true, dispatch: () => v.cancelItemNameEditing(item.id) } },
                    { title: 'Confirm', imgButton: { src: 'img/tick.png', show: true, dispatch: () => v.confirmItemNameEditing(item.id) }, flex: 1 }
                ] : [
                    { itemText: item.n },
                    { visible: !!item.canEditName, flex: 1, title: 'Edit this item name', imgButton: { src: 'img/edit.png', dispatch: () => v.startItemNameEditing(item.id) } }
                ],
                {
                    visible: !!item.isContainer,
                    title: item.stared ? 'Remove from Favorites' : 'Add to Favorites',
                    imgButton: {
                        src: item.stared ? 'img/staron.png' : 'img/staroff.png',
                        dispatch: () => v.setItemStared(item.id, !item.stared)
                    }
                },
                { title: 'Search by this item name', imgButton: { src: 'img/find.png', dispatch: () => v.setFilter(`!${item.n}`) } }
            ]
        },
        [QUANTITY]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: item.q
            }]
        },
        [VALUE]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: `${item.v} PED`
            }]
        },
        [CONTAINER]: {
            style: { justifyContent: 'center' },
            sub: [{
                itemText: item.c
            }, {
                title: 'Search in this container by this item name',
                imgButton: {
                    src: 'img/find.png',
                    dispatch: () => setByStoreInventoryFilter(`!${item.n}`)
                }
            }]
        }
    }
});

const searchRowAfterSearchColumnData = (setAllItemsExpanded: (expanded: boolean) => any): ItemRowColumnData => ({
    sub: [{
        title: 'Expand All',
        textButton: {
            text: '+',
            dispatch: () => setAllItemsExpanded(true)
        },
    }, {
        title: 'Collapse All',
        textButton: {
            text: '-',
            dispatch: () => setAllItemsExpanded(false)
        }
    }]
});

const InventoryByStoreList = () => {
    const inv: InventoryByStore = useSelector(getByStoreInventory)

    const favoriteRowEvents: ItemRowEvents = {
        setItemExpanded: setByStoreStaredItemExpanded,
        setItemName: setByStoreStaredItemName,
        cancelItemNameEditing: cancelByStoreStaredItemNameEditing,
        confirmItemNameEditing: confirmByStoreStaredItemNameEditing,
        startItemNameEditing: startByStoreStaredItemNameEditing,
        setItemStared: setByStoreStaredItemStared,
        setFilter: setByStoreStaredInventoryFilter
    }

    const containersRowEvents: ItemRowEvents = {
        setItemExpanded: setByStoreItemExpanded,
        setItemName: setByStoreItemName,
        cancelItemNameEditing: cancelByStoreItemNameEditing,
        confirmItemNameEditing: confirmByStoreItemNameEditing,
        startItemNameEditing: startByStoreItemNameEditing,
        setItemStared: setByStoreItemStared,
        setFilter: setByStoreInventoryFilter
    }

    return (
        <div className='flex'>
            <SortableTableSection
                title='Favorite Containers'
                expanded={inv.stared.list.expanded}
                filter={inv.stared.filter}
                stats={inv.stared.list.stats}
                setExpanded={setByStoreStaredInventoryExpanded}
                setFilter={setByStoreStaredInventoryFilter}
                searchRowAfterSearchColumnData={searchRowAfterSearchColumnData(setByStoreStaredAllItemsExpanded)}
                table={{
                    allItems: inv.flat.original,
                    showItems: inv.flat.stared,
                    sortType: inv.stared.list.sortType,
                    sortBy: sortByStoreStaredBy,
                    itemSelector: getByStoreInventoryStaredItem,
                    tableData: {
                        columns: columnsStaredContainers,
                        definition: sortColumnDefinition,
                        sortRow: sortRowData,
                        getRow: getRowData(favoriteRowEvents)
                    }
                }}
            />
            <SortableTableSection
                title='List by Containers'
                expanded={inv.originalList.expanded}
                filter={inv.filter}
                stats={inv.showList.stats}
                setExpanded={setByStoreInventoryExpanded}
                setFilter={setByStoreInventoryFilter}
                searchRowAfterSearchColumnData={searchRowAfterSearchColumnData(setByStoreAllItemsExpanded)}
                table={{
                    allItems: inv.flat.original,
                    showItems: inv.flat.show,
                    sortType: inv.showList.sortType,
                    sortBy: sortByStoreBy,
                    itemSelector: getByStoreInventoryItem,
                    tableData: {
                        columns: columnsContainers,
                        definition: sortColumnDefinition,
                        sortRow: sortRowData,
                        getRow: getRowData(containersRowEvents)
                    }
                }}
            />
        </div>
    )
}

export default InventoryByStoreList