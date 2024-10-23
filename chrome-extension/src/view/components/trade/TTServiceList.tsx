import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { NAME, QUANTITY, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryList } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import { reloadTTService, setTTServiceInventoryExpanded, sortTTServiceBy } from '../../application/actions/inventory'
import ImgButton from '../common/ImgButton'

const ItemRow = (p: {
    item: ItemData
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortTTServiceBy(part))

    return (
        <tr>
            <td onClick={sortBy(NAME)}>{item.n}</td>
            <td onClick={sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={sortBy(VALUE)}>{item.v + ' PED'}</td>
        </tr>
    )
}

const TTServiceList = (p: {
    list: InventoryList<ItemData>
}) => {
    const { list } = p
    const dispatch = useDispatch()
    return (
        <>
            <ExpandableSection title='TT Service' expanded={list.expanded} setExpanded={setTTServiceInventoryExpanded}>
                <p>Total value {list.stats.ped} PED for {list.stats.count} items
                    <ImgButton
                        title='Reload'
                        src='img/reload.png'
                        className='img-refresh'
                        dispatch={() => dispatch(reloadTTService())} />
                </p>
                <table className='table-diff'>
                    <tbody>
                        {
                            list.items.map((item: ItemData) =>
                                <ItemRow
                                    key={item.id}
                                    item={item} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default TTServiceList