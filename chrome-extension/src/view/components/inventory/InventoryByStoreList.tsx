import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing, sortByStoreBy, setByStoreItemStared, setByStoreStaredInventoryFilter, sortByStoreStaredBy, setByStoreStaredInventoryExpanded, setByStoreStaredItemExpanded, setByStoreStaredItemStared, setByStoreStaredItemName, cancelByStoreStaredItemNameEditing, startByStoreStaredItemNameEditing, confirmByStoreStaredItemNameEditing } from '../../application/actions/inventory'
import { InventoryByStore, InventoryTree } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import { NAME, QUANTITY, SORT_NAME_ASCENDING, SORT_NAME_DESCENDING, SORT_QUANTITY_ASCENDING, SORT_QUANTITY_DESCENDING, SORT_VALUE_ASCENDING, SORT_VALUE_DESCENDING, VALUE } from '../../application/helpers/inventory.sort'

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
                    { tree.list ? (tree.list.expanded ?
                        <span onClick={() => dispatch(expand(false))}>- </span> :
                        <span onClick={() => dispatch(expand(true))}>+ </span>
                    ) : <span>&nbsp;&nbsp;</span>
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

const SortRow = (p: {
    sortType: number,
    sortByPart: (part: number) => any
}) => {
    const { sortType } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(p.sortByPart(part))

    const Column = (q: { part: number, text: string, up: number, down: number }) =>
        <td onClick={sortBy(q.part)}>
            <strong>{q.text}</strong>
            { sortType === q.up && <img src='img/up.png' /> }
            { sortType === q.down && <img src='img/down.png' /> }
        </td>

    return (
        <tr className='sort-row'>
            <Column part={NAME} text='Name' up={SORT_NAME_ASCENDING} down={SORT_NAME_DESCENDING} />
            <Column part={QUANTITY} text='Quantity' up={SORT_QUANTITY_ASCENDING} down={SORT_QUANTITY_DESCENDING} />
            <Column part={VALUE} text='Value' up={SORT_VALUE_ASCENDING} down={SORT_VALUE_DESCENDING} />
        </tr>
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
                <table className='table-diff'>
                    <thead>
                        <SortRow sortType={inv.showList.sortType} sortByPart={sortByStoreBy} />
                    </thead>
                    <tbody>
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
                    </tbody>
                </table>
            </ExpandableSection>
            <ExpandableSection title='Stared Containers' expanded={inv.staredList.expanded} setExpanded={setByStoreStaredInventoryExpanded}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Total value {inv.staredList.stats.ped} PED in {inv.staredList.stats.count} container{inv.staredList.stats.count == 1 ? '' : 's'}</p>
                    <SearchInput filter={inv.staredFilter} setFilter={setByStoreStaredInventoryFilter} />
                </div>
                <table className='table-diff'>
                    <thead>
                        <SortRow sortType={inv.staredList.sortType} sortByPart={sortByStoreStaredBy} />
                    </thead>
                    <tbody>
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
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default InventoryByStoreList