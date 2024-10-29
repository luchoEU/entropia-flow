import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing, sortByStoreBy, setByStoreItemStared, setByStoreStaredInventoryFilter, sortByStoreStaredBy, setByStoreStaredInventoryExpanded, setByStoreStaredItemExpanded, setByStoreStaredItemStared, setByStoreStaredItemName, cancelByStoreStaredItemNameEditing, startByStoreStaredItemNameEditing, confirmByStoreStaredItemNameEditing, setByStoreAllItemsExpanded, setByStoreStaredAllItemsExpanded } from '../../application/actions/inventory'
import { InventoryByStore, InventoryList, InventoryTree, TreeLineData } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import { CONTAINER, NAME, QUANTITY, VALUE, sortColumnDefinition } from '../../application/helpers/inventory.sort'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import SortableTable from '../common/SortableTable'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'
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

const ItemTreeRow = (p: {
    tree: InventoryTree<ItemData>
    space: number,
    collapsed: boolean,
    d: ItemRowEvents
}) => {
    const { tree, space } = p
    const dispatch = useDispatch()
    const expand = p.d.setItemExpanded(tree.data.id)
    const childrenCollapsed = p.collapsed || !tree.list?.expanded

    return (
        <>
            <tr className='item-row'
                style={{ visibility: p.collapsed ? 'collapse' : 'visible' }}
                onClick={() => tree.list && dispatch(expand(!tree.list.expanded))}>
                <td style={{ paddingLeft: space }}>
                    <ExpandablePlusButton expanded={tree.list?.expanded} setExpanded={expand} />
                    { tree.editing ?
                        <>
                            <input style={{ width: '200px' }} type='text' value={tree.displayName} onChange={(e) => {
                                e.stopPropagation()
                                dispatch(p.d.setItemName(tree.data.id, e.target.value))
                            }} autoFocus />
                            <ImgButton title='Cancel' src='img/cross.png' show dispatch={() => p.d.cancelItemNameEditing(tree.data.id)} />
                            <ImgButton title='Confirm' src='img/tick.png' show dispatch={() => p.d.confirmItemNameEditing(tree.data.id)} />
                        </> :
                        <>
                            <ItemText text={tree.displayName} />
                            { tree.canEditName &&
                                <ImgButton title='Edit this item name' src='img/edit.png' dispatch={() => p.d.startItemNameEditing(tree.data.id)} />
                            }
                        </>
                    }
                </td>
                <td>
                    { tree.list && ( tree.stared ?
                        <ImgButton title='Rmove from Favorites' src='img/staron.png' dispatch={() => p.d.setItemStared(tree.data.id, false)} /> :
                        <ImgButton title='Add to Favorites'src='img/staroff.png' dispatch={() => p.d.setItemStared(tree.data.id, true)} />)
                    }
                    <ImgButton title='Search by this item name' src='img/find.jpg' dispatch={() => p.d.setFilter(`!${tree.displayName}`)} />
                </td>
                <td align='right'><ItemText text={tree.list ? `[${tree.list.stats.count}]` : tree.data.q} /></td>
                <td align='right'><ItemText text={(tree.list ? tree.list.stats.ped : tree.data.v) + ' PED'} /></td>
            </tr>
            { tree.list && <>
                { tree.showItemValueRow &&
                    <tr style={{ visibility: childrenCollapsed ? 'collapse' : 'visible' }} className='item-row'>
                        <td style={{ paddingLeft: space + INDENT_SPACE }}>
                            <ExpandablePlusButton expanded={undefined} setExpanded={undefined} />{/* to add the space of a button */}
                            <ItemText text={`(${tree.data.n === tree.displayName ? 'item': tree.data.n} value)`} />
                        </td>
                        <td></td>
                        <td></td>
                        <td align='right'><ItemText text={tree.data.v + ' PED'} /></td>
                    </tr>
                }
                { tree.list.items.map((item: InventoryTree<ItemData>) =>
                    <ItemTreeRow key={item.data.id}
                        tree={item}
                        space={p.space + INDENT_SPACE}
                        collapsed={childrenCollapsed}
                        d={p.d} />
                )}
            </>}
        </>
    )
}

const TreeSection = (p: {
    title: string,
    sectionExpanded: boolean,
    setSectionExpanded: (expanded: boolean) => any,
    setAllItemsExpanded: (expanded: boolean) => any,
    filter: string,
    setFilter: (filter: string) => any,
    list: InventoryList<InventoryTree<ItemData>>,
    sortBy: (part: number) => any,
    columnNameOverride?: { [key: string]: string },
    d: ItemRowEvents
}) => {
    const dispatch = useDispatch()
    return (
        <ExpandableSection title={p.title} expanded={p.sectionExpanded} setExpanded={p.setSectionExpanded}>
            <div className='search-container'>
                <p>Total value {p.list.stats.ped} PED in {p.list.stats.count} container{p.list.stats.count == 1 ? '' : 's'}</p>
                <p className='search-input-container'>
                    <SearchInput filter={p.filter} setFilter={p.setFilter} />
                    <button className='button-text' title='Expand All' onClick={(e) => {
                        e.stopPropagation()
                        dispatch(p.setAllItemsExpanded(true))
                    }}>+</button>
                    <button className='button-text' title='Collapse All' onClick={(e) => {
                        e.stopPropagation()
                        dispatch(p.setAllItemsExpanded(false))
                    }}>-</button>
                </p>
            </div>
            <SortableTable
                sortType={p.list.sortType}
                sortBy={p.sortBy}
                columns={[NAME, -1, QUANTITY, VALUE]}
                nameOverride={p.columnNameOverride}
                definition={sortColumnDefinition}>
                {
                    p.list.items.map((item: InventoryTree<ItemData>) =>
                        <ItemTreeRow
                            key={item.data.id}
                            tree={item}
                            space={0}
                            collapsed={false}
                            d={p.d} />
                    )
                }
            </SortableTable>
        </ExpandableSection>
    )
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
            <TreeSection
                title='OLD Containers'
                sectionExpanded={inv.originalList.expanded}
                setSectionExpanded={setByStoreInventoryExpanded}
                setAllItemsExpanded={setByStoreAllItemsExpanded}
                filter={inv.filter}
                setFilter={setByStoreInventoryFilter}
                list={inv.showList}
                sortBy={sortByStoreBy}
                d={containersRowEvents}
            />
        </div>
    )
}

export default InventoryByStoreList