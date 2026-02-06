import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { InventoryState } from '../../application/state/inventory'
import TradeList from './TradeList'
import SortableTabularSection from '../common/SortableTabularSection'
import { GAME_LOG_TABULAR_TRADE } from '../../application/state/log'
import { tradeAtom, addTradeMessageNotificationAtom, removeTradeMessageNotificationAtom } from '../../application/atoms/trade'
import { TradeState } from '../../application/state/trade'
import { tabularAtom, setTabularFilterAtom } from '../../application/atoms/tabular'
import { InventoryOwnedList } from './InventoryOwnedList'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { Feature } from '../../application/state/settings'
import { inventoryStateAtom, availableCriteriaAtom } from '../../application/atoms/inventory'

export function TradePage() {
    // Use Jotai atoms instead of Redux selectors
    const s: InventoryState = useAtomValue(inventoryStateAtom) as InventoryState
    const t: TradeState = useAtomValue(tradeAtom)
    const allTabular = useAtomValue(tabularAtom)
    const gameLogTrade = useMemo(() => allTabular[GAME_LOG_TABULAR_TRADE], [allTabular])
    const isClientEnabled = useAtomValue(isFeatureEnabledAtom(Feature.client))
    const availableCriteria = useAtomValue(availableCriteriaAtom)
    const addNotification = useSetAtom(addTradeMessageNotificationAtom)
    const removeNotification = useSetAtom(removeTradeMessageNotificationAtom)
    const setFilter = useSetAtom(setTabularFilterAtom)

    let toAuction: Record<string, string> = {}
    for (let availableItem of s.available.items)
        if (!s.auction.items.some(i => i.n == availableItem.n))
            toAuction[availableItem.n] = 'to-auction'

    return (
        <>
            <div className='flex'>
                <TradeList selector='TradePage.CurrentlyOnAuction' title='Currently on Auction' subtitle='Items currently on auction, selling or pending to retrieve'
                    list={s.auction} isFavorite={(n) => availableCriteria.name.includes(n)} classMap={{}} />
                <TradeList selector='TradePage.FavoritesToAuction' title='Favorites to Auction' subtitle='You favorite items that you sell, in bold if they are not on auction'
                    list={s.available} isFavorite={() => true} classMap={toAuction} />
                { isClientEnabled && <SortableTabularSection selector={GAME_LOG_TABULAR_TRADE} useTable={true}
                    afterSearch={ () => gameLogTrade ? [ { button: 'Notify', title: 'Notify when a new message matching the filter is added', dispatch: () => { addNotification(gameLogTrade?.filter); return true } } ] : [] }
                    beforeTable={ () => t.notifications.length === 0 ? undefined : [ { class: 'notification-item-container', sub:
                        t.notifications.map(n => ({ class: 'notification-item', style: { display: 'inline-flex', width: 'auto' }, sub:
                            [
                                { text: n.filter, dispatch: () => { setFilter(GAME_LOG_TABULAR_TRADE, n.filter); return true } },
                                { img: 'img/cross.png', title: 'Remove notification', dispatch: () => { removeNotification(n.time); return true } }
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
