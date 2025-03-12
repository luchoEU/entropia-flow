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
import { addTradeMessageNotification, removeTradeMessageNotification } from '../../application/actions/trade'
import { getTrade } from '../../application/selectors/trade'
import { TradeState } from '../../application/state/trade'
import { getTabularData } from '../../application/selectors/tabular'
import { setTabularFilter } from '../../application/actions/tabular'

function TradePage() {
    const s: InventoryState = useSelector(getInventory)
    const t: TradeState = useSelector(getTrade)
    const { filter } = useSelector(getTabularData(GAME_LOG_TABULAR_TRADE))

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
                <SortableTabularSection selector={GAME_LOG_TABULAR_TRADE} useTable={true}
                    afterSearch={[ { button: 'Notify', title: 'Notify when a new message matching the filter is added', dispatch: () => addTradeMessageNotification(filter) } ]}
                    beforeTable={ t.notifications.length === 0 ? undefined : [ { class: 'notification-item-container', sub:
                        t.notifications.map(n => ({ class: 'notification-item', style: { display: 'inline-flex', width: 'auto' }, sub:
                            [
                                { text: n.filter, dispatch: () => setTabularFilter(GAME_LOG_TABULAR_TRADE)(n.filter) },
                                { img: 'img/cross.png', title: 'Remove notification', dispatch: () => removeTradeMessageNotification(n.time) }
                            ]
                        })) }]}
                />
            </div>
            <div className='flex'>
                <InventoryVisibleList />
                <InventoryHiddenList />
            </div>
        </>
    )
}

export default TradePage