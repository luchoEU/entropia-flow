import React from 'react'
import { ItemData } from '../../../common/state'
import { NAME, QUANTITY, sortColumnDefinition, VALUE } from '../../application/helpers/inventory.sort'
import { InventoryList } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SortableTable from '../common/SortableTable'
import ImgButton from '../common/ImgButton'
import { addAvailable, removeAvailable } from '../../application/actions/inventory'
import ItemText from '../common/ItemText'

const ItemRow = (p: {
    item: ItemData,
    param: {
        isFavorite: (name: string) => boolean,
        classMap: { [k: string]: string }
    }
}) => {
    const { item, param } = p

    return (
        <tr className='item-row'>
            <td className={param.classMap[item.n]}>
                <ItemText text={item.n} />
            </td>
            <td>
                { param.isFavorite(item.n) ?
                    <ImgButton title='Remove from Favorites' src='img/staron.png' dispatch={() => removeAvailable(item.n)} /> :
                    <ImgButton title='Add to Favorites' src='img/staroff.png' dispatch={() => addAvailable(item.n)} />
                }
            </td>
            <td><ItemText text={item.q} /></td>
            <td><ItemText text={item.v + ' PED'} /></td>
        </tr>
    )
}

const TradeList = (p: {
    title: string,
    list: InventoryList<ItemData>,
    setExpanded: (expanded: boolean) => any,
    isFavorite: (name: string) => boolean,
    classMap: { [k: string]: string },
    sort: (part: number) => any
}) => {
    let { title, list, setExpanded } = p
    return (
        <>
            <ExpandableSection title={title} expanded={list.expanded} setExpanded={setExpanded}>
                <p>Total value {list.stats.ped} PED for {list.stats.count} items</p>
                <SortableTable
                    sortType={list.sortType}
                    sortBy={p.sort}
                    columns={[NAME, -1, QUANTITY, VALUE]}
                    definition={sortColumnDefinition}>
                    {
                        list.items.map((item: ItemData) =>
                            <ItemRow
                                key={item.id}
                                item={item}
                                param={p} />
                        )
                    }
                </SortableTable>
            </ExpandableSection>
        </>
    )
}

export default TradeList