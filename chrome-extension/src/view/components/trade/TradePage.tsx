import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import TradeList from './TradeList'
import { tradeAtom, addTradeMessageNotificationAtom, removeTradeMessageNotificationAtom } from '../../application/atoms/trade'
import { TradeState } from '../../application/state/trade'
import { InventoryOwnedList } from './InventoryOwnedList'
import { isFeatureEnabledAtom } from '../../application/atoms/settings'
import { Feature } from '../../application/state/settings'
import { inventoryStateAtom, availableCriteriaAtom, auctionItemsAtom, availableItemsAtom } from '../../application/atoms/inventory'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { gameLogTradeItemsAtom } from '../../application/atoms/gameLogTables'
import { gameLogTradeConfig } from '../../application/configs/gameLogTableConfigs'

export function TradePage() {
    // Use Jotai computed atom for inventory state
    const s = useAtomValue(inventoryStateAtom)
    const t: TradeState = useAtomValue(tradeAtom)
    const isClientEnabled = useAtomValue(isFeatureEnabledAtom(Feature.client))
    const availableCriteria = useAtomValue(availableCriteriaAtom)
    const addNotification = useSetAtom(addTradeMessageNotificationAtom)
    const removeNotification = useSetAtom(removeTradeMessageNotificationAtom)

    // Compute toAuction classMap with memoization to ensure it updates when atoms change
    // Items not in auction get the 'to-auction' class to display them in bold
    const toAuction = useMemo(() => {
        const map: Record<string, string> = {}
        const auctionNames = new Set(s.auction.items.map(i => i.n))
        for (let availableItem of s.available.items) {
            if (!auctionNames.has(availableItem.n)) {
                map[availableItem.n] = 'to-auction'
            }
        }
        return map
    }, [s.available.items, s.auction.items])

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
                            title="Use search box in Trade table to filter"
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
    }, [t.notifications, removeNotification])

    return (
        <>
            <div className='flex'>
                <TradeList selector='TradePage.CurrentlyOnAuction' title='Currently on Auction' subtitle='Items currently on auction, selling or pending to retrieve'
                    list={s.auction} isFavorite={(n) => availableCriteria.name.includes(n)} classMap={{}} itemsAtom={auctionItemsAtom} />
                <TradeList selector='TradePage.FavoritesToAuction' title='Favorites to Auction' subtitle='You favorite items that you sell, in bold if they are not on auction'
                    list={s.available} isFavorite={() => true} classMap={toAuction} itemsAtom={availableItemsAtom} />
                { isClientEnabled && (
                    <JotaiSortableTableSection
                        selector="TradePage.Trade"
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
