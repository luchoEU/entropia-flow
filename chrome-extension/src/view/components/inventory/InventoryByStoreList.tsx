import React, { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { InventoryByStore, TreeLineData } from '../../application/state/inventory'
import { CONTAINER, NAME, QUANTITY, VALUE, sortColumnDefinition } from '../../application/helpers/inventory.sort'
import SortableTableSection, { ItemRowColumnData, ItemRowData, SortRowData } from '../common/SortableTableSection'
import {
  setByStoreItemExpandedAtom, setByStoreInventoryFilterAtom, setByStoreItemNameAtom,
  confirmByStoreItemNameEditingAtom, cancelByStoreItemNameEditingAtom, startByStoreItemNameEditingAtom,
  sortByStoreByAtom, setByStoreItemStaredAtom, setByStoreStaredInventoryFilterAtom,
  sortByStoreStaredByAtom, setByStoreStaredItemExpandedAtom, setByStoreStaredItemStaredAtom,
  setByStoreStaredItemNameAtom, cancelByStoreStaredItemNameEditingAtom, startByStoreStaredItemNameEditingAtom,
  confirmByStoreStaredItemNameEditingAtom, setByStoreAllItemsExpandedSimpleAtom, setByStoreStaredAllItemsExpandedAtom,
  byStoreStateAtom
} from '../../application/atoms/inventory'

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
                    dispatch: () => v.setFilter(`!${item.n}`)
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
    const inv: InventoryByStore | null = useAtomValue(byStoreStateAtom)

    // Replace Redux selectors with Jotai-based lookup functions
    // Note: Redux selectors return (state) => TreeLineData, but we have state available
    const getByStoreInventoryStaredItem = useCallback((index: number) => {
        return (_state: any) => inv.flat.stared[index]
    }, [inv])

    const getByStoreInventoryItem = useCallback((index: number) => {
        return (_state: any) => inv.flat.show[index]
    }, [inv])

    // Jotai write atoms
    const setByStoreItemExpandedJotai = useSetAtom(setByStoreItemExpandedAtom)
    const setByStoreFilterJotai = useSetAtom(setByStoreInventoryFilterAtom)
    const setByStoreItemNameJotai = useSetAtom(setByStoreItemNameAtom)
    const startByStoreItemEditJotai = useSetAtom(startByStoreItemNameEditingAtom)
    const confirmByStoreItemEditJotai = useSetAtom(confirmByStoreItemNameEditingAtom)
    const cancelByStoreItemEditJotai = useSetAtom(cancelByStoreItemNameEditingAtom)
    const sortByStoreJotai = useSetAtom(sortByStoreByAtom)
    const setByStoreItemStaredJotai = useSetAtom(setByStoreItemStaredAtom)
    const setByStoreStaredFilterJotai = useSetAtom(setByStoreStaredInventoryFilterAtom)
    const sortByStoreStaredJotai = useSetAtom(sortByStoreStaredByAtom)
    const setByStoreStaredItemExpandedJotai = useSetAtom(setByStoreStaredItemExpandedAtom)
    const setByStoreStaredItemStaredJotai = useSetAtom(setByStoreStaredItemStaredAtom)
    const setByStoreStaredItemNameJotai = useSetAtom(setByStoreStaredItemNameAtom)
    const startByStoreStaredItemEditJotai = useSetAtom(startByStoreStaredItemNameEditingAtom)
    const confirmByStoreStaredItemEditJotai = useSetAtom(confirmByStoreStaredItemNameEditingAtom)
    const cancelByStoreStaredItemEditJotai = useSetAtom(cancelByStoreStaredItemNameEditingAtom)
    const setByStoreAllItemsExpandedJotai = useSetAtom(setByStoreAllItemsExpandedSimpleAtom)
    const setByStoreStaredAllItemsExpandedJotai = useSetAtom(setByStoreStaredAllItemsExpandedAtom)

    // Event handlers: update Jotai atoms
    const favoriteRowEvents: ItemRowEvents = {
        setItemExpanded: (id: string) => (expanded: boolean) => {
            setByStoreStaredItemExpandedJotai(id, expanded)
        },
        setItemName: (id: string, name: string) => {
            setByStoreStaredItemNameJotai(id, name)
        },
        cancelItemNameEditing: (id: string) => {
            cancelByStoreStaredItemEditJotai()
        },
        confirmItemNameEditing: (id: string) => {
            confirmByStoreStaredItemEditJotai()
        },
        startItemNameEditing: (id: string) => {
            startByStoreStaredItemEditJotai(id)
        },
        setItemStared: (id: string, stared: boolean) => {
            setByStoreStaredItemStaredJotai(id, stared)
        },
        setFilter: (filter: string) => {
            setByStoreStaredFilterJotai(filter)
        }
    }

    const containersRowEvents: ItemRowEvents = {
        setItemExpanded: (id: string) => (expanded: boolean) => {
            setByStoreItemExpandedJotai(id, expanded)
        },
        setItemName: (id: string, name: string) => {
            setByStoreItemNameJotai(id, name)
        },
        cancelItemNameEditing: (id: string) => {
            cancelByStoreItemEditJotai()
        },
        confirmItemNameEditing: (id: string) => {
            confirmByStoreItemEditJotai(id)
        },
        startItemNameEditing: (id: string) => {
            startByStoreItemEditJotai(id)
        },
        setItemStared: (id: string, stared: boolean) => {
            setByStoreItemStaredJotai(id, stared)
        },
        setFilter: (filter: string) => {
            setByStoreFilterJotai(filter)
        }
    }

    // Sorting handlers
    const handleSortByStore = useCallback((part: number) => {
        sortByStoreJotai(part)
    }, [sortByStoreJotai])

    const handleSortByStoreStared = useCallback((part: number) => {
        sortByStoreStaredJotai(part)
    }, [sortByStoreStaredJotai])

    // Expand/collapse handlers
    const expandAllItemsWrapper = (expanded: boolean) => {
        setByStoreAllItemsExpandedJotai(expanded)
    }

    const expandAllStaredItemsWrapper = (expanded: boolean) => {
        setByStoreStaredAllItemsExpandedJotai(expanded)
    }

    // Return loading state if data not loaded yet
    if (!inv) {
        return <div className='flex'>Loading inventory data...</div>
    }

    return (
        <div className='flex'>
            { inv.showStared && <SortableTableSection
                selector='InventoryByStoreList.staredContainers'
                title='Favorite Containers'
                subtitle='Your favorite containers'
                expanded={inv.stared?.list?.expanded ?? false}
                filter={inv.stared?.filter}
                stats={inv.stared?.list?.stats ?? { count: 0, ped: '0' }}
                setFilter={(filter: string) => {
                    setByStoreStaredFilterJotai(filter)
                }}
                searchRowAfterSearchColumnData={searchRowAfterSearchColumnData(expandAllStaredItemsWrapper)}
                table={{
                    showItems: inv.flat?.stared ?? [],
                    sortType: inv.stared?.list?.sortType ?? 0,
                    sortBy: handleSortByStoreStared,
                    itemSelector: getByStoreInventoryStaredItem,
                    tableData: {
                        columns: columnsStaredContainers,
                        definition: sortColumnDefinition,
                        sortRow: sortRowData,
                        getRow: getRowData(favoriteRowEvents)
                    }
                }}
            /> }
            <SortableTableSection
                selector='InventoryByStoreList.byContainers'
                title='List by Containers'
                subtitle='Your items organized by containers'
                expanded={inv.originalList?.expanded ?? false}
                filter={inv.filter}
                stats={inv.showList?.stats ?? { count: 0, ped: '0' }}
                setFilter={(filter: string) => {
                    setByStoreFilterJotai(filter)
                }}
                searchRowAfterSearchColumnData={searchRowAfterSearchColumnData(expandAllItemsWrapper)}
                table={{
                    showItems: inv.flat?.show ?? [],
                    sortType: inv.showList?.sortType ?? 0,
                    sortBy: handleSortByStore,
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