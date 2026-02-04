import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useAtomValue, useSetAtom } from 'jotai'
import { InventoryState } from '../../application/state/inventory'
import TradeList from './TradeList'
import SortableTabularSection from '../common/SortableTabularSection'
import { GAME_LOG_TABULAR_TRADE } from '../../application/state/log'
import { addTradeMessageNotification, removeTradeMessageNotification } from '../../application/actions/trade'
import { getTrade } from '../../application/selectors/trade'
import { TradeState } from '../../application/state/trade'
import { getTabularData } from '../../application/selectors/tabular'
import { setTabularFilter } from '../../application/actions/tabular'
import { InventoryOwnedList } from './InventoryOwnedList'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { Feature } from '../../application/state/settings'
import { sortAuctionByAtom, sortAvailableByAtom, inventoryStateAtom, availableCriteriaAtom } from '../../application/atoms/inventory'

export function TradePage() {
    // Use Jotai computed atom instead of Redux selector
    const s: InventoryState = useAtomValue(inventoryStateAtom) as InventoryState
    const t: TradeState = useSelector(getTrade)
    const gameLogTrade = useSelector(getTabularData(GAME_LOG_TABULAR_TRADE))
    const isClientEnabled = useAtomValue(isFeatureEnabledAtom(Feature.client))
    const setSortAuction = useSetAtom(sortAuctionByAtom)
    const setSortAvailable = useSetAtom(sortAvailableByAtom)
    const availableCriteria = useAtomValue(availableCriteriaAtom)

    // Handlers: update Jotai atoms for consistency
    const handleSortAuction = useCallback((part: number) => {
        setSortAuction(part)
    }, [setSortAuction])

    const handleSortAvailable = useCallback((part: number) => {
        setSortAvailable(part)
    }, [setSortAvailable])

    let toAuction: Record<string, string> = {}
    for (let availableItem of s.available.items)
        if (!s.auction.items.some(i => i.n == availableItem.n))
            toAuction[availableItem.n] = 'to-auction'

    return (
        <>
            <div className='flex'>
                <TradeList selector='TradePage.CurrentlyOnAuction' title='Currently on Auction' subtitle='Items currently on auction, selling or pending to retrieve'
                    list={s.auction} isFavorite={(n) => availableCriteria.name.includes(n)} classMap={{}} sort={handleSortAuction} />
                <TradeList selector='TradePage.FavoritesToAuction' title='Favorites to Auction' subtitle='You favorite items that you sell, in bold if they are not on auction'
                    list={s.available} isFavorite={() => true} classMap={toAuction} sort={handleSortAvailable} />
                { isClientEnabled && <SortableTabularSection selector={GAME_LOG_TABULAR_TRADE} useTable={true}
                    afterSearch={ () => gameLogTrade ? [ { button: 'Notify', title: 'Notify when a new message matching the filter is added', dispatch: () => addTradeMessageNotification(gameLogTrade?.filter) } ] : [] }
                    beforeTable={ () => t.notifications.length === 0 ? undefined : [ { class: 'notification-item-container', sub:
                        t.notifications.map(n => ({ class: 'notification-item', style: { display: 'inline-flex', width: 'auto' }, sub:
                            [
                                { text: n.filter, dispatch: () => setTabularFilter(GAME_LOG_TABULAR_TRADE)(n.filter) },
                                { img: 'img/cross.png', title: 'Remove notification', dispatch: () => removeTradeMessageNotification(n.time) }
                            ]
                        })) }]}
                /> }
            </div>
            <div className='flex'>
                <InventoryOwnedList />
            </div>
        </>
    )
}
