import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, VALUE } from '../../application/helpers/sort'
import { InventoryList } from '../../application/state/inventory'
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
    list: InventoryList<ItemData>
}) => {
    const { list } = p
    return (
        <>
            <ExpandableSection title='List' expanded={list.expanded} setExpanded={setVisibleInventoryExpanded}>
            <p>Total value {list.stats.ped} PED for {list.stats.count} items</p>

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

export default InventoryVisibleList