import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { InventoryState } from '../../application/state/inventory'
import TradeList from './TradeList'
import { GAME_LOG_TABULAR_TRADE } from '../../application/state/log'
import { tradeAtom, addTradeMessageNotificationAtom, removeTradeMessageNotificationAtom } from '../../application/atoms/trade'
import { TradeState } from '../../application/state/trade'
import { setTabularFilterAtom } from '../../application/atoms/tabular'
import { InventoryOwnedList } from './InventoryOwnedList'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { Feature } from '../../application/state/settings'
import { inventoryStateAtom, availableCriteriaAtom } from '../../application/atoms/inventory'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { gameLogTradeItemsAtom } from '../../application/atoms/gameLogTables'
import { gameLogTradeConfig } from '../../application/configs/gameLogTableConfigs'

export function TradePage() {
    // Use Jotai atoms instead of Redux selectors
    const s: InventoryState = useAtomValue(inventoryStateAtom) as InventoryState
    const t: TradeState = useAtomValue(tradeAtom)
    const isClientEnabled = useAtomValue(isFeatureEnabledAtom(Feature.client))
    const availableCriteria = useAtomValue(availableCriteriaAtom)
    const addNotification = useSetAtom(addTradeMessageNotificationAtom)
    const removeNotification = useSetAtom(removeTradeMessageNotificationAtom)
    const setFilter = useSetAtom(setTabularFilterAtom)

    let toAuction: Record<string, string> = {}
    for (let availableItem of s.available.items)
        if (!s.auction.items.some(i => i.n == availableItem.n))
            toAuction[availableItem.n] = 'to-auction'

    const notifyButton = useMemo(() => (
        <button
            className="button-option"
            title="Notify when a new message matching the filter is added"
            onClick={() => addNotification('')}
        >
            Notify
        </button>
    ), [addNotification])

    const notificationChips = useMemo(() => {
        if (t.notifications.length === 0) return undefined

        return (
            <div className="notification-item-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {t.notifications.map((n) => (
                    <div
                        key={n.time}
                        className="notification-item"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
                    >
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFilter(GAME_LOG_TABULAR_TRADE, n.filter)}
                            title="Apply this filter"
                        >
                            {n.filter}
                        </span>
                        <img
                            src="img/cross.png"
                            title="Remove notification"
                            style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                            onClick={() => removeNotification(n.time)}
                        />
                    </div>
                ))}
            </div>
        )
    }, [t.notifications, setFilter, removeNotification])

    return (
        <>
            <div className='flex'>
                <TradeList selector='TradePage.CurrentlyOnAuction' title='Currently on Auction' subtitle='Items currently on auction, selling or pending to retrieve'
                    list={s.auction} isFavorite={(n) => availableCriteria.name.includes(n)} classMap={{}} />
                <TradeList selector='TradePage.FavoritesToAuction' title='Favorites to Auction' subtitle='You favorite items that you sell, in bold if they are not on auction'
                    list={s.available} isFavorite={() => true} classMap={toAuction} />
                { isClientEnabled && (
                    <JotaiSortableTableSection
                        selector={GAME_LOG_TABULAR_TRADE}
                        title="Trade"
                        subtitle="List of trade related messages on chat"
                        itemsAtom={gameLogTradeItemsAtom}
                        config={gameLogTradeConfig}
                        afterSearch={notifyButton}
                        beforeTable={notificationChips}
                        useFixedSizeList={true}
                    />
                )}
            </div>
            <div className='flex'>
                <InventoryOwnedList />
            </div>
        </>
    )
}
