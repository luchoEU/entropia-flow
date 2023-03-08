import React from 'react'
import { useSelector } from 'react-redux'
import { addAvailable, removeAvailable, setAuctionInventoryExpanded, setAvailableInventoryExpanded, sortAuctionBy, sortAvailableBy } from '../../application/actions/inventory'
import { getInventory } from '../../application/selectors/inventory'
import { InventoryState } from '../../application/state/inventory'
import TradeList from './TradeList'

function TradePage() {
    const s: InventoryState = useSelector(getInventory)
    
    let toAuction = {}
    for (let availableItem of s.available.items)
        if (!s.auction.items.some(i => i.n == availableItem.n))
            toAuction[availableItem.n] = 'to-auction'

    return (
        <>
            <TradeList title='Auction' list={s.auction} setExpanded={setAuctionInventoryExpanded}
                image='img/tick.png' classMap={{}} sort={sortAuctionBy} action={addAvailable}
                showAction={(n) => !s.availableCriteria.name.includes(n)} />
            <TradeList title='Available' list={s.available} setExpanded={setAvailableInventoryExpanded}
                image='img/cross.png' classMap={toAuction} sort={sortAvailableBy} action={removeAvailable}
                showAction={() => true} />
        </>
    )
}

export default TradePage