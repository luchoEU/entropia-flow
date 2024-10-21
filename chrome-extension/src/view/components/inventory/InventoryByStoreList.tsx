import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing, sortByStoreBy, setByStoreItemStared, setByStoreStaredInventoryFilter, sortByStoreStaredBy, setByStoreStaredInventoryExpanded, setByStoreStaredItemExpanded, setByStoreStaredItemStared, setByStoreStaredItemName, cancelByStoreStaredItemNameEditing, startByStoreStaredItemNameEditing, confirmByStoreStaredItemNameEditing } from '../../application/actions/inventory'
import { InventoryByStore, InventoryTree } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import { NAME, QUANTITY, VALUE, sortColumnDefinition } from '../../application/helpers/inventory.sort'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import SortableTable from '../common/SortableTable'

const INDENT_SPACE = 10

const ItemRow = (p: {
    tree: InventoryTree<ItemData>
    space: number,
    d: {
        setItemExpanded: (id: string) => (expanded: boolean) => any,
        setItemName: (id: string, name: string) => any,
        cancelItemNameEditing: (id: string) => any,
        confirmItemNameEditing: (id: string) => any,
        startItemNameEditing: (id: string) => any,
        setItemStared: (id: string, stared: boolean) => any,
        setFilter: (filter: string) => any
    }
}) => {
    const { tree, space } = p
    const dispatch = useDispatch()
    const expand = p.d.setItemExpanded(tree.data.id)

    return (
        <>
            <tr>
                <td style={{ paddingLeft: space }}>
                    { tree.list ? <ExpandablePlusButton expanded={tree.list.expanded} setExpanded={expand} />
                    : <span>&nbsp;&nbsp;</span>
                    }
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
                { tree.list ?
                    <>
                        <td align='right'>[{tree.list.stats.count}]</td>
                        <td align='right'>{tree.list.stats.ped + ' PED'}</td>
                    </> : <>
                        <td align='right'>{tree.data.q}</td>
                        <td align='right'>{tree.data.v + ' PED'}</td>
                    </>
                }
            </tr>
            { tree.list?.expanded &&
                <>
                    { tree.showItemValueRow &&
                        <tr>
                            <td style={{ paddingLeft: space + INDENT_SPACE }}>
                                &nbsp;&nbsp;({ tree.data.n === tree.displayName ? 'item': tree.data.n } value)
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

const InventoryByStoreList = (p: {
    inv: InventoryByStore
}) => {
    const { inv } = p

    return (
        <>
            <ExpandableSection title='Containers' expanded={inv.originalList.expanded} setExpanded={setByStoreInventoryExpanded}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Total value {inv.showList.stats.ped} PED in {inv.showList.stats.count} container{inv.showList.stats.count == 1 ? '' : 's'}</p>
                    <SearchInput filter={inv.filter} setFilter={setByStoreInventoryFilter} />
                </div>
                <SortableTable
                    sortType={inv.showList.sortType}
                    sortBy={sortByStoreBy}
                    columns={[NAME, QUANTITY, VALUE]}
                    definition={sortColumnDefinition}>
                    {
                        inv.showList.items.map((item: InventoryTree<ItemData>) =>
                            <ItemRow
                                key={item.data.id}
                                tree={item}
                                space={0}
                                d={({
                                    setItemExpanded: setByStoreItemExpanded,
                                    setItemName: setByStoreItemName,
                                    cancelItemNameEditing: cancelByStoreItemNameEditing,
                                    confirmItemNameEditing: confirmByStoreItemNameEditing,
                                    startItemNameEditing: startByStoreItemNameEditing,
                                    setItemStared: setByStoreItemStared,
                                    setFilter: setByStoreInventoryFilter
                                })} />
                        )
                    }
                </SortableTable>
            </ExpandableSection>
            <ExpandableSection title='Favorite Containers' expanded={inv.staredList.expanded} setExpanded={setByStoreStaredInventoryExpanded}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Total value {inv.staredList.stats.ped} PED in {inv.staredList.stats.count} container{inv.staredList.stats.count == 1 ? '' : 's'}</p>
                    <SearchInput filter={inv.staredFilter} setFilter={setByStoreStaredInventoryFilter} />
                </div>
                <SortableTable sortType={inv.staredList.sortType}
                    sortBy={sortByStoreStaredBy}
                    columns={[NAME, QUANTITY, VALUE]}
                    definition={sortColumnDefinition}>
                    {
                        inv.staredList.items.map((item: InventoryTree<ItemData>) =>
                            <ItemRow
                                key={item.data.id}
                                tree={item}
                                space={0}
                                d={({
                                    setItemExpanded: setByStoreStaredItemExpanded,
                                    setItemName: setByStoreStaredItemName,
                                    cancelItemNameEditing: cancelByStoreStaredItemNameEditing,
                                    confirmItemNameEditing: confirmByStoreStaredItemNameEditing,
                                    startItemNameEditing: startByStoreStaredItemNameEditing,
                                    setItemStared: setByStoreStaredItemStared,
                                    setFilter: setByStoreStaredInventoryFilter
                                })} />
                        )
                    }
                </SortableTable>
            </ExpandableSection>
        </>
    )
}

export default InventoryByStoreList