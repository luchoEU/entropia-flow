import React from 'react'
import { useSelector } from 'react-redux'
import { setAuctionInventoryExpanded, setAvailableInventoryExpanded, sortAuctionBy, sortAvailableBy } from '../../application/actions/inventory'
import { getInventory } from '../../application/selectors/inventory'
import { InventoryState } from '../../application/state/inventory'
import TradeList from './TradeList'
import InventoryVisibleList from './InventoryVisibleList'
import InventoryHiddenList from './InventoryHiddenList'
import SortableTabularSection from '../common/SortableTabularSection'
import { GAME_LOG_TABULAR_TRADE } from '../../application/state/log'

function TradePage() {
    const s: InventoryState = useSelector(getInventory)

    let toAuction = {}
    for (let availableItem of s.available.items)
        if (!s.auction.items.some(i => i.n == availableItem.n))
            toAuction[availableItem.n] = 'to-auction'

    return (
        <>
            <div className='flex'>
                <TradeList title='Currently on Auction' list={s.auction} setExpanded={setAuctionInventoryExpanded}
                    isFavorite={(n) => s.availableCriteria.name.includes(n)} classMap={{}} sort={sortAuctionBy} />
                <TradeList title='Favorites to Auction' list={s.available} setExpanded={setAvailableInventoryExpanded}
                    isFavorite={() => true} classMap={toAuction} sort={sortAvailableBy} />
                <SortableTabularSection selector={GAME_LOG_TABULAR_TRADE} useTable={true} />
            </div>
            <div className='flex'>
                <InventoryVisibleList />
                <InventoryHiddenList />
            </div>
        </>
    )
}

export default TradePage