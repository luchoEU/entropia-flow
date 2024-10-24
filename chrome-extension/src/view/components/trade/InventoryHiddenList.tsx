import React from 'react'
import { useDispatch } from 'react-redux'
import { setHiddenInventoryExpanded, setHiddenInventoryFilter, showAll, showByContainer, showByName, showByValue, sortHiddenBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter, ItemHidden } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import SortableTable from '../common/SortableTable'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'

const ItemRow = (p: {
    item: ItemHidden
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortHiddenBy(part))

    return (
        <tr className='item-row'>
            <td onClick={sortBy(NAME)}>
                { item.criteria.name &&
                    <ImgButton title='Show this item name' src='img/tick.png' dispatch={() => showByName(item.data.n)} />
                }
                <ItemText text={item.data.n} />
            </td>
            <td>
                <ImgButton title='Search by this item name' src='img/find.jpg' dispatch={() => setHiddenInventoryFilter(`!${item.data.n}`)} />
            </td>
            <td onClick={sortBy(QUANTITY)}>
                <ItemText text={item.data.q} />
            </td>
            <td onClick={sortBy(VALUE)}>
                { item.criteria.value &&
                    <ImgButton title='Show this value or higher' src='img/tick.png' dispatch={() => showByValue(item.data.v)} />
                }
                <ItemText text={item.data.v + ' PED'} />
            </td>
            <td onClick={sortBy(CONTAINER)}>
                { item.criteria.container &&
                    <ImgButton title='Show this container' src='img/tick.png' dispatch={() => showByContainer(item.data.c)} />
                }
                <ItemText text={item.data.c} />
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
                <div className='search-container'>
                    <p>Total value {inv.showList.stats.ped} PED for {inv.showList.stats.count} item{inv.showList.stats.count == 1 ? '' : 's'}
                        <span className='show-all' onClick={(e) => {
                                e.stopPropagation()
                                dispatch(showAll())
                            }}>
                            <img src='img/tick.png' />
                            Unhide All
                        </span>
                    </p>
                    <p className='search-input-container'><SearchInput filter={inv.filter} setFilter={setHiddenInventoryFilter} /></p>
                </div>
                <SortableTable sortType={inv.showList.sortType}
                    sortBy={sortHiddenBy}
                    columns={[NAME, -1, QUANTITY, VALUE, CONTAINER]}
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
