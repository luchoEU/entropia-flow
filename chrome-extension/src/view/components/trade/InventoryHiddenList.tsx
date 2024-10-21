import React from 'react'
import { useDispatch } from 'react-redux'
import { setHiddenInventoryExpanded, setHiddenInventoryFilter, showAll, showByContainer, showByName, showByValue, sortHiddenBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter, ItemHidden } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import SortableTable from '../common/SortableTable'

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
                <img src='img/find.jpg' onClick={(e) => {
                    e.stopPropagation()
                    dispatch(setHiddenInventoryFilter(`!${item.data.n}`))
                }} />
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
    inv: InventoryListWithFilter<ItemHidden>
}) => {
    const { inv } = p
    const dispatch = useDispatch()

    return (
        <>
            <ExpandableSection title='Hidden List' expanded={inv.originalList.expanded} setExpanded={setHiddenInventoryExpanded}>
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
                <SortableTable sortType={inv.showList.sortType}
                    sortBy={sortHiddenBy}
                    columns={[NAME, QUANTITY, VALUE, CONTAINER]}
                    definition={sortColumnDefinition}>
                    {
                        inv.showList.items.map((item: ItemHidden) =>
                            <ItemRow
                                key={item.data.id}
                                item={item} />
                        )
                    }
                </SortableTable>
            </ExpandableSection>
        </>
    )
}

export default InventoryHiddenList
