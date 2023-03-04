import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ItemData } from '../../../common/state'
import { setAuctionInventoryExpanded, sortAuctionBy } from '../../application/actions/inventory'
import { NAME, QUANTITY, VALUE } from '../../application/helpers/sort'
import { getInventory } from '../../application/selectors/inventory'
import { InventoryState } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'

const ItemRow = (p: {
    item: ItemData
}) => {
    const { item } = p
    const dispatch = useDispatch()
    const sortBy = (part: number) => () => dispatch(sortAuctionBy(part))

    return (
        <tr>
            <td onClick={sortBy(NAME)}>{item.n}</td>
            <td onClick={sortBy(QUANTITY)}>{item.q}</td>
            <td onClick={sortBy(VALUE)}>{item.v + ' PED'}</td>
        </tr>
    )
}

function TradePage() {
    const s: InventoryState = useSelector(getInventory)
    return (
        <>
            <ExpandableSection title='Auction' expanded={s.auction.expanded} setExpanded={setAuctionInventoryExpanded}>
            <p>Total value {s.auction.stats.ped} PED for {s.auction.stats.count} items</p>

                <table className='table-diff'>
                    <tbody>
                        {
                            s.auction.items.map((item: ItemData) =>
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

export default TradePage