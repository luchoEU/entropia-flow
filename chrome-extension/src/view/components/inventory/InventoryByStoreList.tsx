import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setByStoreItemExpanded, setByStoreInventoryExpanded, sortVisibleBy } from '../../application/actions/inventory'
import { InventoryList, InventoryTree } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import ExpandableButton from '../common/ExpandableButton'

const ItemRow = (p: {
    tree: InventoryTree<ItemData>
}) => {
    const { tree } = p
    const dispatch = useDispatch()
    const expand = setByStoreItemExpanded(tree.data.id)
    const sortBy = (part: number) => () => dispatch(sortVisibleBy(part))

    //<p>Total value {tree.list.stats.ped} PED for {tree.list.stats.count} items</p>

    return (
        <tr>
            <td>
                { tree.list ? <ExpandableButton expanded={tree.list?.expanded} setExpanded={expand} /> : <></> }
                {tree.data.n}
                {tree.list?.expanded ?
                    <table>
                        <tbody>
                            {tree.list.items.map((item: InventoryTree<ItemData>) =>
                                <ItemRow tree={item} key={item.data.id} />
                            )}
                        </tbody>
                    </table> : <></>
                }
            </td>
        </tr>
    )
}

const InventoryByStoreList = (p: {
    list: InventoryList<InventoryTree<ItemData>>
}) => {
    const { list } = p
    return (
        <>
            <ExpandableSection title='Containers' expanded={list.expanded} setExpanded={setByStoreInventoryExpanded}>
                <table className='table-diff'>
                    <tbody>
                        {
                            list.items.map((item: InventoryTree<ItemData>) =>
                                <ItemRow
                                    key={item.data.id}
                                    tree={item} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default InventoryByStoreList