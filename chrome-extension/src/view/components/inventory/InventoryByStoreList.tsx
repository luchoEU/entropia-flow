import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing, sortByStoreBy } from '../../application/actions/inventory'
import { InventoryByStore, InventoryListWithFilter, InventoryTree } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import ExpandableButton from '../common/ExpandableButton'
import SearchInput from '../common/SearchInput'
import { NAME, QUANTITY, SORT_NAME_ASCENDING, SORT_NAME_DESCENDING, SORT_QUANTITY_ASCENDING, SORT_QUANTITY_DESCENDING, SORT_VALUE_ASCENDING, SORT_VALUE_DESCENDING, VALUE } from '../../application/helpers/inventorySort'

const INDENT_SPACE = 10

const ItemRow = (p: {
    tree: InventoryTree<ItemData>
    space: number
}) => {
    const { tree, space } = p
    const dispatch = useDispatch()
    const expand = setByStoreItemExpanded(tree.data.id)

    return (
        <>
            <tr>
                <td style={{ paddingLeft: space }}>
                    { tree.list && <ExpandableButton expanded={tree.list?.expanded} setExpanded={expand} /> }
                    { tree.editing ?
                        <>
                            <input style={{ width: '200px' }} type='text' value={tree.name} onChange={(e) => {
                                e.stopPropagation()
                                dispatch(setByStoreItemName(tree.data.id, e.target.value))
                            }} autoFocus />
                            <img src='img/cross.png' data-show onClick={(e) => {
                                e.stopPropagation()
                                dispatch(cancelByStoreItemNameEditing(tree.data.id))
                            }} />
                            <img src='img/tick.png' data-show onClick={(e) => {
                                e.stopPropagation()
                                dispatch(confirmByStoreItemNameEditing(tree.data.id))
                            }} />
                        </> :
                        <>
                            { tree.name }
                            { !tree.data.id.startsWith('-') && tree.list &&
                                <img src='img/edit.png' onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch(startByStoreItemNameEditing(tree.data.id))
                                }} />
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
                            <td style={{ paddingLeft: space + INDENT_SPACE }}>({ tree.data.n === tree.name ? 'item': tree.data.n } value)</td>
                            <td></td>
                            <td align='right'>{tree.data.v + ' PED'}</td>
                        </tr>
                    }
                    { tree.list.items.map((item: InventoryTree<ItemData>) =>
                        <ItemRow key={item.data.id} tree={item} space={p.space + INDENT_SPACE} />
                    )}
                </>
            }
        </>
    )
}

const SortRow = (p: {
    sortType: number
}) => {
    const { sortType } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortByStoreBy(part))

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
                        <SortRow sortType={inv.showList.sortType} />
                    </thead>
                    <tbody>
                        {
                            inv.showList.items.map((item: InventoryTree<ItemData>) =>
                                <ItemRow
                                    key={item.data.id}
                                    tree={item}
                                    space={0} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default InventoryByStoreList