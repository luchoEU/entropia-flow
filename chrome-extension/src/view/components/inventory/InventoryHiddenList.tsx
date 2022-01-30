import React from 'react'
import { useDispatch } from 'react-redux'
import ListStorage from '../../../background/listStorage'
import { setHiddenInventoryExpanded, showByContainer, showByName, showByValue, sortHiddenBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, VALUE } from '../../application/helpers/sort'
import { InventoryList, ItemHidden } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'

const ItemRow = (p: {
    item: ItemHidden
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortHiddenBy(part))

    return (
        <tr>
            <td onClick={sortBy(NAME)}>
                {item.criteria.name ?
                    <img src='img/tick.png' onClick={(e) => {
                        e.stopPropagation()
                        dispatch(showByName(item.data.n))
                    }} /> : ''
                }
                {item.data.n}
            </td>
            <td onClick={sortBy(QUANTITY)}>{item.data.q}</td>
            <td onClick={sortBy(VALUE)}>
                {item.criteria.value ?
                    <img src='img/tick.png' onClick={(e) => {
                        e.stopPropagation()
                        dispatch(showByValue(item.data.v))
                    }} /> : ''
                }
            {item.data.v + ' PED'}
            </td>
            <td onClick={sortBy(CONTAINER)}>
                {item.criteria.container ?
                    <img src='img/tick.png' onClick={(e) => {
                        e.stopPropagation()
                        dispatch(showByContainer(item.data.c))
                    }} /> : ''
                }
            {item.data.c}
            </td>
        </tr>
    )
}

const InventoryHiddenList = (p: {
    list: InventoryList<ItemHidden>
}) => {
    const { list } = p
    return (
        <>
            <ExpandableSection title='Hidden' expanded={list.expanded} setExpanded={setHiddenInventoryExpanded}>
                <p>Total value {list.stats.ped} PED for {list.stats.count} item{list.stats.count == 1 ? '' : 's'}</p>
                <table className='table-diff table-diff-row'>
                    <tbody>
                        {
                            list.items.map((item: ItemHidden) =>
                                <ItemRow
                                    key={item.data.id}
                                    item={item} />
                            )
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        </>
    )
}

export default InventoryHiddenList