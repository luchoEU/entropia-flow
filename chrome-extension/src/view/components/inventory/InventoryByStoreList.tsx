import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing, sortByStoreBy, setByStoreItemStared, setByStoreStaredInventoryFilter, sortByStoreStaredBy, setByStoreStaredInventoryExpanded, setByStoreStaredItemExpanded, setByStoreStaredItemStared, setByStoreStaredItemName, cancelByStoreStaredItemNameEditing, startByStoreStaredItemNameEditing, confirmByStoreStaredItemNameEditing, setByStoreAllItemsExpanded, setByStoreStaredAllItemsExpanded } from '../../application/actions/inventory'
import { InventoryByStore, InventoryList, InventoryTree } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import { NAME, QUANTITY, VALUE, sortColumnDefinition } from '../../application/helpers/inventory.sort'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import SortableTable from '../common/SortableTable'

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

const ItemRow = (p: {
    tree: InventoryTree<ItemData>
    space: number,
    d: ItemRowEvents
}) => {
    const { tree, space } = p
    const dispatch = useDispatch()
    const expand = p.d.setItemExpanded(tree.data.id)

    return (
        <>
            <tr>
                <td style={{ paddingLeft: space }}>
                    <ExpandablePlusButton expanded={tree.list?.expanded} setExpanded={expand} />
                    { tree.editing ?
                        <>
                            <input style={{ width: '200px' }} type='text' value={tree.displayName} onChange={(e) => {
                                e.stopPropagation()
                                dispatch(p.d.setItemName(tree.data.id, e.target.value))
                            }} autoFocus />
                            <img src='img/cross.png' data-show onClick={(e) => {
                                e.stopPropagation()
                                dispatch(p.d.cancelItemNameEditing(tree.data.id))
                            }} />
                            <img src='img/tick.png' data-show onClick={(e) => {
                                e.stopPropagation()
                                dispatch(p.d.confirmItemNameEditing(tree.data.id))
                            }} />
                        </> :
                        <>
                            <span onClick={() => tree.list && dispatch(expand(!tree.list.expanded))}>
                                { tree.displayName }
                            </span>
                            { tree.canEditName &&
                                <img src='img/edit.png' onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(p.d.startItemNameEditing(tree.data.id))
                                }} />
                            }
                            <img src='img/find.jpg' onClick={(e) => {
                                e.stopPropagation()
                                dispatch(p.d.setFilter(`!${tree.displayName}`))
                            }} />
                            { tree.list && ( tree.stared ?
                                <img src='img/staron.png' onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(p.d.setItemStared(tree.data.id, false))
                                }} /> :
                                <img src='img/staroff.png' onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(p.d.setItemStared(tree.data.id, true))
                                }} /> )
                            }
                        </>
                    }
                </td>
                <td align='right'>{tree.list ? `[${tree.list.stats.count}]` : tree.data.q}</td>
                <td align='right'>{(tree.list ? tree.list.stats.ped : tree.data.v) + ' PED'}</td>
            </tr>
            { tree.list?.expanded &&
                <>
                    { tree.showItemValueRow &&
                        <tr>
                            <td style={{ paddingLeft: space + INDENT_SPACE }}>
                                <ExpandablePlusButton expanded={undefined} setExpanded={undefined} />{/* to add the space of a button */}
                                ({ tree.data.n === tree.displayName ? 'item': tree.data.n } value)
                            </td>
                            <td></td>
                            <td align='right'>{tree.data.v + ' PED'}</td>
                        </tr>
                    }
                    { tree.list.items.map((item: InventoryTree<ItemData>) =>
                        <ItemRow key={item.data.id} tree={item} space={p.space + INDENT_SPACE} d={p.d} />
                    )}
                </>
            }
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
                columns={[NAME, QUANTITY, VALUE]}
                definition={sortColumnDefinition}>
                {
                    p.list.items.map((item: InventoryTree<ItemData>) =>
                        <ItemRow
                            key={item.data.id}
                            tree={item}
                            space={0}
                            d={p.d} />
                    )
                }
            </SortableTable>
        </ExpandableSection>
    )
}

const InventoryByStoreList = (p: {
    inv: InventoryByStore
}) => {
    const { inv } = p

    return (
        <>
            <TreeSection
                title='Containers'
                sectionExpanded={inv.originalList.expanded}
                setSectionExpanded={setByStoreInventoryExpanded}
                setAllItemsExpanded={setByStoreAllItemsExpanded}
                filter={inv.filter}
                setFilter={setByStoreInventoryFilter}
                list={inv.showList}
                sortBy={sortByStoreBy}
                d={({
                    setItemExpanded: setByStoreItemExpanded,
                    setItemName: setByStoreItemName,
                    cancelItemNameEditing: cancelByStoreItemNameEditing,
                    confirmItemNameEditing: confirmByStoreItemNameEditing,
                    startItemNameEditing: startByStoreItemNameEditing,
                    setItemStared: setByStoreItemStared,
                    setFilter: setByStoreInventoryFilter
                })}
            />
            <TreeSection
                title='Favorite Containers'
                sectionExpanded={inv.staredList.expanded}
                setSectionExpanded={setByStoreStaredInventoryExpanded}
                setAllItemsExpanded={setByStoreStaredAllItemsExpanded}
                filter={inv.staredFilter}
                setFilter={setByStoreStaredInventoryFilter}
                list={inv.staredList}
                sortBy={sortByStoreStaredBy}
                d={({
                    setItemExpanded: setByStoreStaredItemExpanded,
                    setItemName: setByStoreStaredItemName,
                    cancelItemNameEditing: cancelByStoreStaredItemNameEditing,
                    confirmItemNameEditing: confirmByStoreStaredItemNameEditing,
                    startItemNameEditing: startByStoreStaredItemNameEditing,
                    setItemStared: setByStoreStaredItemStared,
                    setFilter: setByStoreStaredInventoryFilter
                })}
            />
        </>
    )
}

export default InventoryByStoreList