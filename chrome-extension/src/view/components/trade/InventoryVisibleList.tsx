import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import SortableTable from '../common/SortableTable'

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
                <SortableTable sortType={inv.showList.sortType}
                    sortBy={sortVisibleBy}
                    columns={[NAME, QUANTITY, VALUE, CONTAINER]}
                    definition={sortColumnDefinition}>
                    {
                        inv.showList.items.map((item: ItemData) =>
                            <ItemRow
                                key={item.id}
                                item={item} />
                        )
                    }
                </SortableTable>
            </ExpandableSection>
        </>
    )
}

export default InventoryVisibleList