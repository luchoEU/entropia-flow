import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter, setByStoreItemName, confirmByStoreItemNameEditing, cancelByStoreItemNameEditing, startByStoreItemNameEditing } from '../../application/actions/inventory'
import { InventoryByStore, InventoryListWithFilter, InventoryTree } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import ExpandableButton from '../common/ExpandableButton'
import SearchInput from '../common/SearchInput'

const INDENT_SPACE = 10

const ItemRow = (p: {
    tree: InventoryTree<ItemData>
    space: number,
    inSearch: boolean
}) => {
    const { tree, space, inSearch } = p
    const dispatch = useDispatch()
    const expand = setByStoreItemExpanded(tree.data.id)
    const sortBy = (part: number) => () => dispatch(sortVisibleBy(part))

    return (
        <>
            <tr>
                <td style={{ paddingLeft: space }}>
                    { tree.list && <ExpandableButton expanded={tree.list?.expanded} setExpanded={expand} /> }
                    { tree.editing ?
                        <>
                            <input style={{ width: '200px' }} type='text' value={tree.name} onChange={(e) => {
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
            { tree.list?.expanded ?
                <>
                    { !inSearch && tree.data.q === '1' ?
                        <tr>
                            <td style={{ paddingLeft: space + INDENT_SPACE }}>({ tree.data.n === tree.name ? 'item': tree.data.n } value)</td>
                            <td></td>
                            <td align='right'>{tree.data.v + ' PED'}</td>
                        </tr> : <></>
                    }
                    { tree.list.items.map((item: InventoryTree<ItemData>) =>
                        <ItemRow key={item.data.id} tree={item} space={p.space + INDENT_SPACE} inSearch={inSearch} />
                    )}
                </> : <></>
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
                <table className='table-diff'>
                    <tbody>
                        {
                            inv.showList.items.map((item: InventoryTree<ItemData>) =>
                                <ItemRow
                                    key={item.data.id}
                                    tree={item}
                                    space={0}
                                    inSearch={inv.filter?.length > 0} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default InventoryByStoreList