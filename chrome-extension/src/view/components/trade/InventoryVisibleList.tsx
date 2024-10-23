import React from 'react'
import { useDispatch } from 'react-redux'
import { ItemData } from '../../../common/state'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryListWithFilter } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import SortableTable from '../common/SortableTable'
import ImgButton from '../common/ImgButton'
import ItemText from '../common/ItemText'

const ItemRow = (p: {
    item: ItemData
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortVisibleBy(part))

    return (
        <tr className='item-row'>
            <td onClick={sortBy(NAME)}>
                <ImgButton title='Hide this item name' src='img/cross.png' dispatch={() => hideByName(item.n)} />
                <ItemText text={item.n} />
            </td>
            <td>
                <ImgButton title='Search by this item name' src='img/find.jpg' dispatch={() => setVisibleInventoryFilter(`!${item.n}`)} />
            </td>
            <td onClick={sortBy(QUANTITY)}>
                <ItemText text={item.q} />
            </td>
            <td onClick={sortBy(VALUE)}>
                <ImgButton title='Hide this value or lower' src='img/cross.png' dispatch={() => hideByValue(item.v)} />
                <ItemText text={item.v + ' PED'} />
            </td>
            <td onClick={sortBy(CONTAINER)}>
                <ImgButton title='Hide this container' src='img/cross.png' dispatch={() => hideByContainer(item.c)} />
                <ItemText text={item.c} />
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
                <div className='search-container'>
                    <p>Total value {inv.showList.stats.ped} PED for {inv.showList.stats.count} item{inv.showList.stats.count == 1 ? '' : 's'}</p>
                    <p className='search-input-container'><SearchInput filter={inv.filter} setFilter={setVisibleInventoryFilter} /></p>
                </div>
                <SortableTable sortType={inv.showList.sortType}
                    sortBy={sortVisibleBy}
                    columns={[NAME, -1, QUANTITY, VALUE, CONTAINER]}
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