import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy, setByStoreInventoryFilter } from '../../application/actions/inventory'
import { InventoryByStore, InventoryTree } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import ExpandableButton from '../common/ExpandableButton'

const INDENT_SPACE = 10

const ItemRow = (p: {
    tree: InventoryTree<ItemData>
    space: number
}) => {
    const { tree, space } = p
    const dispatch = useDispatch()
    const expand = setByStoreItemExpanded(tree.data.id)
    const sortBy = (part: number) => () => dispatch(sortVisibleBy(part))

    //<p>Total value {tree.list.stats.ped} PED for {tree.list.stats.count} items</p>

    return (
        <>
            <tr>
                <td style={{ paddingLeft: space }}>
                    { tree.list ? <ExpandableButton expanded={tree.list?.expanded} setExpanded={expand} /> : <></> }
                    { tree.data.n }
                </td>
                <td align='right'>{tree.data.q}</td>
                <td align='right'>{tree.data.v + ' PED'}</td>
            </tr>
            { tree.list?.expanded ?
                tree.list.items.map((item: InventoryTree<ItemData>) =>
                    <ItemRow key={item.data.id} tree={item} space={p.space + INDENT_SPACE} />
                ): <></>
            }
        </>
    )
}

const InventoryByStoreList = (p: {
    inv: InventoryByStore
}) => {
    const { inv } = p
    const dispatch = useDispatch()

    return (
        <>
            <ExpandableSection title='Containers' expanded={inv.originalList.expanded} setExpanded={setByStoreInventoryExpanded}>
                <input type='text' className='form-control' placeholder='filter' value={inv.filter ?? ''} onChange={(e) => dispatch(setByStoreInventoryFilter(e.target.value))} />
                <table className='table-diff'>
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