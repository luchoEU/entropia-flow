import React from 'react'
import { useDispatch } from 'react-redux'
import { setHiddenInventoryExpanded, setHiddenInventoryFilter, showAll, showByContainer, showByName, showByValue, sortHiddenBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, SORT_CONTAINER_ASCENDING, SORT_CONTAINER_DESCENDING, SORT_NAME_ASCENDING, SORT_NAME_DESCENDING, SORT_QUANTITY_ASCENDING, SORT_QUANTITY_DESCENDING, SORT_VALUE_ASCENDING, SORT_VALUE_DESCENDING, VALUE } from '../../application/helpers/inventorySort'
import { InventoryListWithFilter, ItemHidden } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'

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

const SortRow = (p: {
    sortType: number
}) => {
    const { sortType } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortHiddenBy(part))

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

const InventoryHiddenList = (p: {
    inv: InventoryListWithFilter<ItemHidden>
}) => {
    const { inv } = p
    const dispatch = useDispatch()

    return (
        <>
            <ExpandableSection title='Hidden' expanded={inv.originalList.expanded} setExpanded={setHiddenInventoryExpanded}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p>Total value {inv.showList.stats.ped} PED for {inv.showList.stats.count} item{inv.showList.stats.count == 1 ? '' : 's'}
                        <span className='show-all' onClick={(e) => {
                                e.stopPropagation()
                                dispatch(showAll())
                            }}>
                            <img src='img/tick.png' />
                            Show All
                        </span>
                    </p>
                    <SearchInput filter={inv.filter} setFilter={setHiddenInventoryFilter} />
                </div>
                <table className='table-diff table-diff-row'>
                    <thead>
                        <SortRow sortType={inv.showList.sortType} />
                    </thead>
                    <tbody>
                        {
                            inv.showList.items.map((item: ItemHidden) =>
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
