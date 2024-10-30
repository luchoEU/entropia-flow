import React from 'react'
import { useSelector } from 'react-redux'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing, sortByStoreBy, setByStoreItemStared, setByStoreStaredInventoryFilter, sortByStoreStaredBy, setByStoreStaredInventoryExpanded, setByStoreStaredItemExpanded, setByStoreStaredItemStared, setByStoreStaredItemName, cancelByStoreStaredItemNameEditing, startByStoreStaredItemNameEditing, confirmByStoreStaredItemNameEditing, setByStoreAllItemsExpanded, setByStoreStaredAllItemsExpanded } from '../../application/actions/inventory'
import { InventoryByStore, InventoryList, InventoryTree, TreeLineData } from '../../application/state/inventory'
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
                    { imgButton: { src: 'img/cross.png', title: 'Cancel', show: true, dispatch: () => v.cancelItemNameEditing(item.id) } },
                    { imgButton: { src: 'img/tick.png', title: 'Confirm', show: true, dispatch: () => v.confirmItemNameEditing(item.id) }, flex: 1 }
                ] : [
                    { itemText: item.n },
                    { visible: !!item.canEditName, flex: 1, imgButton: { src: 'img/edit.png', title: 'Edit this item name', dispatch: () => v.startItemNameEditing(item.id) } }
                ],
                { visible: !!item.isContainer, imgButton: {
                    src: item.stared ? 'img/staron.png' : 'img/staroff.png',
                    title: item.stared ? 'Remove from Favorites' : 'Add to Favorites',
                    dispatch: () => v.setItemStared(item.id, !item.stared)
                } },
                { imgButton: { src: 'img/find.jpg', title: 'Search by this item name', dispatch: () => v.setFilter(`!${item.n}`) } }
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
                imgButton: {
                    src: 'img/find.jpg',
                    title: 'Search in this container by this item name',
                    dispatch: () => setByStoreInventoryFilter(`!${item.n}`)
                }
            }]
        }
    }
});

const searchRowAfterSearchColumnData = (setAllItemsExpanded: (expanded: boolean) => any): ItemRowColumnData => ({
    sub: [{
        textButton: {
            title: 'Expand All',
            text: '+',
            dispatch: () => setAllItemsExpanded(true)
        },
    }, {
        textButton: {
            title: 'Collapse All',
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
                allItems={inv.flat.original}
                showItems={inv.flat.stared}
                sortType={inv.stared.list.sortType}
                stats={inv.stared.list.stats}
                setExpanded={setByStoreStaredInventoryExpanded}
                setFilter={setByStoreStaredInventoryFilter}
                sortBy={sortByStoreStaredBy}
                columns={columnsStaredContainers}
                definition={sortColumnDefinition}
                sortRowData={sortRowData}
                getRowData={getRowData(favoriteRowEvents)}
                itemSelector={getByStoreInventoryStaredItem}
                searchRowAfterSearchColumnData={searchRowAfterSearchColumnData(setByStoreStaredAllItemsExpanded)}
            />
            <SortableTableSection
                title='Containers'
                expanded={inv.originalList.expanded}
                filter={inv.filter}
                allItems={inv.flat.original}
                showItems={inv.flat.show}
                sortType={inv.showList.sortType}
                stats={inv.showList.stats}
                setExpanded={setByStoreInventoryExpanded}
                setFilter={setByStoreInventoryFilter}
                sortBy={sortByStoreBy}
                columns={columnsContainers}
                definition={sortColumnDefinition}
                sortRowData={sortRowData}
                getRowData={getRowData(containersRowEvents)}
                itemSelector={getByStoreInventoryItem}
                searchRowAfterSearchColumnData={searchRowAfterSearchColumnData(setByStoreAllItemsExpanded)}
            />
        </div>
    )
}

export default InventoryByStoreList