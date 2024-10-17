import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, SORT_CONTAINER_ASCENDING, SORT_CONTAINER_DESCENDING, SORT_NAME_ASCENDING, SORT_NAME_DESCENDING, SORT_QUANTITY_ASCENDING, SORT_QUANTITY_DESCENDING, SORT_VALUE_ASCENDING, SORT_VALUE_DESCENDING, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'

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
                <img src='img/find.jpg' onClick={(e) => {
                    e.stopPropagation()
                    dispatch(setVisibleInventoryFilter(`!${item.n}`))
                }} />
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

const SortRow = (p: {
    sortType: number
}) => {
    const { sortType } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortVisibleBy(part))

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
            <Column part={CONTAINER} text='Container' up={SORT_CONTAINER_ASCENDING} down={SORT_CONTAINER_DESCENDING} />
        </tr>
    )
}

const InventoryVisibleList = (p: {
    inv: InventoryListWithFilter<ItemData>
}) => {
    const { inv } = p

    return (
        <>
            <ExpandableSection title='Owned List' expanded={inv.originalList.expanded} setExpanded={setVisibleInventoryExpanded}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Total value {inv.showList.stats.ped} PED for {inv.showList.stats.count} item{inv.showList.stats.count == 1 ? '' : 's'}</p>
                    <SearchInput filter={inv.filter} setFilter={setVisibleInventoryFilter} />
                </div>
                <table className='table-diff'>
                    <thead>
                        <SortRow sortType={inv.showList.sortType} />
                    </thead>
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