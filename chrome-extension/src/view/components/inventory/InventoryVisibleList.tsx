import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, VALUE } from '../../application/helpers/inventorySort'
import { InventoryList, InventoryListWithFilter } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'

const ItemRow = (p: {
    item: ItemData
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortVisibleBy(part))

    return (
        <tr>
            <td onClick={sortBy(NAME)}>
                <img src='img/cross.png' onClick={(e) => {
                    e.stopPropagation()
                    dispatch(hideByName(item.n))
                }} />
                {item.n}
            </td>
            <td onClick={sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={sortBy(VALUE)}>
                <img src='img/cross.png' onClick={(e) => {
                    e.stopPropagation()
                    dispatch(hideByValue(item.v))
                }} />
                {item.v + ' PED'}
            </td>
            <td onClick={sortBy(CONTAINER)}>
                <img src='img/cross.png' onClick={(e) => {
                    e.stopPropagation()
                    dispatch(hideByContainer(item.c))
                }} />
                {item.c}
            </td>
        </tr>
    )
}

const InventoryVisibleList = (p: {
    inv: InventoryListWithFilter<ItemData>
}) => {
    const { inv } = p
    const dispatch = useDispatch()

    return (
        <>
            <ExpandableSection title='List' expanded={inv.originalList.expanded} setExpanded={setVisibleInventoryExpanded}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Total value {inv.showList.stats.ped} PED for {inv.showList.stats.count} item{inv.showList.stats.count == 1 ? '' : 's'}</p>
                    <input type='text' className='form-control' placeholder='search' value={inv.filter ?? ''} onChange={(e) => dispatch(setVisibleInventoryFilter(e.target.value))} />
                </div>
                <table className='table-diff'>
                    <tbody>
                        {
                            inv.showList.items.map((item: ItemData) =>
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

export default InventoryVisibleList