import React, { useMemo, useRef, useState } from 'react'
import DashboardSection from './DashboardSection'
import { atomWithStorage } from 'jotai/utils'
import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import { statusAtom } from '../../application/atoms/status'
import { connectionAtom, setConnectionWebSocketAtom, setConnectionStatusAtom } from '../../application/atoms/connection'
import { lastComputedAtom } from '../../application/atoms/last'
import {
    enrichedItemsAtom,
    auctionItemsAtom,
    availableCriteriaAtom,
    hideCriteriaAtom,
    hiddenItemsCountAtom,
    filterOptionsAtom,
    tradeItemChainAtom,
    setTradeItemChainAtom,
    addAvailableAtom,
    removeAvailableAtom,
    showHiddenItemsAtom,
} from '../../application/atoms/inventory'
import { getItemAtom, itemsMapAtom, setItemBuyMarkupAtom, setItemMarkupUnitAtom, setItemReserveAmountAtom, setItemNotesAtom } from '../../application/atoms/items'
import { SORT_VALUE_DESCENDING, nextSortType, sortTypeToColumnIndex } from '../../application/helpers/inventory.sort'
import { getValueWithMarkup } from '../../application/helpers/items'
import {
    calcTraderStats,
    calcAuctionStats,
    calcTotalWithMarkup,
    filterByText,
    filterByFavorites,
    filterItemsByName,
    sortOwnedItems,
    groupByContainer,
    calcGroupTotal,
    DashboardSort,
    getItemDetails,
} from '../../application/helpers/trader'
import { unitText, nextUnit, unitDescription, UNIT_PERCENTAGE } from '../../application/state/items'
import { ItemOwned } from '../../application/state/inventory'
import { ItemData } from '../../../common/state'
import { STRING_CONNECTING, URL_MY_ITEMS_PAGE } from '../../../common/const'
import { dashboardStatusCollapsedAtom } from './HunterDashboard'
import messages from '../../services/api/messages'

// ─── Persisted UI state ──────────────────────────────────────────────────────

export const traderAuctionExpandedAtom = atomWithStorage('jotai-v1-trader-auctionExpanded', true)
export const traderOwnedExpandedAtom = atomWithStorage('jotai-v1-trader-ownedExpanded', true)
export const traderShowMarkupAtom = atomWithStorage('jotai-v1-trader-showMarkup', false)
export const traderViewModeAtom = atomWithStorage<'list' | 'tree'>('jotai-v1-trader-viewMode', 'list')
export const traderOnlyFavoritesAtom = atomWithStorage('jotai-v1-trader-onlyFavorites', false)
export const traderOwnedFilterAtom = atomWithStorage('jotai-v1-trader-ownedFilter', '')
export const traderAuctionFilterAtom = atomWithStorage('jotai-v1-trader-auctionFilter', '')

// ─── Auction item row ────────────────────────────────────────────────────────

const AuctionItemRow = ({ item }: { item: ItemData }) => (
    <tr>
        <td>{item.n}</td>
        <td className='dashboard-col-right'>{item.q}</td>
        <td className='dashboard-col-right'>{item.v}</td>
    </tr>
)

// ─── Owned item row ──────────────────────────────────────────────────────────

const OwnedItemRow = React.memo(({ item, showMarkup, showContainer, isFavorite, onToggleFavorite, onToggleHide, onSelect, isSelected }: {
    item: ItemOwned
    showMarkup: boolean
    showContainer: boolean
    isFavorite: boolean
    onToggleFavorite: (name: string, isFav: boolean) => void
    onToggleHide: (name: string, isHidden: boolean) => void
    onSelect: (name: string | undefined) => void
    isSelected: boolean
}) => {
    const itemAtom = useMemo(() => getItemAtom(item.data.n), [item.data.n])
    const material = useAtomValue(itemAtom)
    const valueMU = showMarkup && material?.markup?.value
        ? getValueWithMarkup(item.data.q, item.data.v, material) : undefined

    const setMarkup = useSetAtom(setItemBuyMarkupAtom)
    const setUnit = useSetAtom(setItemMarkupUnitAtom)
    const [isEditing, setIsEditing] = useState(false)
    const editStartValue = useRef('')

    return (
        <tr className={`${item.c.hidden.any ? 'dashboard-item-excluded' : ''} ${isSelected ? 'trader-item-selected' : ''}`}>
            <td>
                <span
                    className='dashboard-item-action'
                    title={item.c.hidden.any ? 'Show this item' : 'Hide this item'}
                    onClick={() => onToggleHide(item.data.n, item.c.hidden.name)}
                >
                    {item.c.hidden.any ? '+' : '✕'}
                </span>
            </td>
            <td
                className='trader-item-name'
                onClick={() => onSelect(isSelected ? undefined : item.data.n)}
                title='Click to see details'
            >
                <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{item.data.n}</span>
                {item.data.c === 'AUCTION' && (
                    <span className='trader-auction-badge' title='On auction'>AUC</span>
                )}
            </td>
            <td className='dashboard-col-right'>{item.data.q}</td>
            <td className='dashboard-col-right'>{item.data.v}</td>
            {showMarkup && <>
                <td className='dashboard-col-right'>
                    {valueMU !== undefined ? (valueMU - parseFloat(item.data.v || '0')).toFixed(2) : '—'}
                </td>
                <td className='dashboard-mu-cell dashboard-col-right'>
                    {isEditing ? (
                        <div className='dashboard-mu-edit'>
                            <input type='text' value={material?.markup?.value || ''}
                                   onChange={(e) => setMarkup(item.data.n, e.target.value)} autoFocus />
                            <span className='dashboard-mu-unit'
                                  title={`Unit: ${unitDescription(material?.markup?.unit ?? UNIT_PERCENTAGE)}`}
                                  onClick={() => setUnit(item.data.n, nextUnit(material?.markup?.unit ?? UNIT_PERCENTAGE))}>
                                {unitText(material?.markup?.unit ?? UNIT_PERCENTAGE)}
                            </span>
                            <span className='dashboard-item-action' style={{visibility: 'visible'}}
                                  onClick={() => setIsEditing(false)}>✓</span>
                            <span className='dashboard-item-action' style={{visibility: 'visible'}}
                                  onClick={() => { setMarkup(item.data.n, editStartValue.current); setIsEditing(false) }}>✕</span>
                        </div>
                    ) : (
                        <span className='dashboard-mu-display'>
                            <span className='dashboard-mu-value'>
                                {material?.markup?.value
                                    ? `${material.markup.value}${unitText(material?.markup?.unit ?? UNIT_PERCENTAGE)}`
                                    : '—'}
                            </span>
                            <span className='dashboard-mu-edit-btn' title='Edit markup'
                                  onClick={() => {
                                      editStartValue.current = material?.markup?.value || ''
                                      if (!material?.markup?.value) {
                                          setMarkup(item.data.n, '100')
                                      }
                                      setIsEditing(true)
                                  }}>✎</span>
                        </span>
                    )}
                </td>
                <td className='dashboard-col-right'>
                    {valueMU !== undefined ? valueMU.toFixed(2) : item.data.v}
                </td>
            </>}
            {showContainer && <td>{item.data.c}</td>}
            <td>
                <span
                    className={`trader-fav-btn ${isFavorite ? 'trader-fav-on' : ''}`}
                    onClick={() => onToggleFavorite(item.data.n, isFavorite)}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFavorite ? '★' : '☆'}
                </span>
            </td>
        </tr>
    )
})

// ─── Item detail panel ───────────────────────────────────────────────────────

const ItemDetailPanel = ({ itemName }: { itemName: string }) => {
    const itemsMap = useAtomValue(itemsMapAtom)
    const details = useMemo(() => getItemDetails(itemName, itemsMap), [itemName, itemsMap])
    const material = itemsMap[details.baseName]

    const setMarkup = useSetAtom(setItemBuyMarkupAtom)
    const setUnit = useSetAtom(setItemMarkupUnitAtom)
    const setReserve = useSetAtom(setItemReserveAmountAtom)
    const setNotes = useSetAtom(setItemNotesAtom)

    const [editingField, setEditingField] = useState<'markup' | 'reserve' | 'notes' | null>(null)
    const editBackup = useRef('')

    const startEdit = (field: 'markup' | 'reserve' | 'notes') => {
        if (field === 'markup') {
            editBackup.current = material?.markup?.value || ''
            if (!material?.markup?.value) setMarkup(details.baseName, '100')
        } else if (field === 'reserve') {
            editBackup.current = material?.reserveAmount || ''
        } else {
            editBackup.current = material?.notes || ''
        }
        setEditingField(field)
    }

    const cancelEdit = () => {
        if (editingField === 'markup') setMarkup(details.baseName, editBackup.current)
        else if (editingField === 'reserve') setReserve(details.baseName, editBackup.current)
        else if (editingField === 'notes') setNotes(details.baseName, editBackup.current)
        setEditingField(null)
    }

    return (
        <div className='trader-detail-panel'>
            <div className='trader-detail-grid'>
                <div>
                    <span className='trader-detail-label'>Type</span>
                    <span className='trader-detail-value'>{details.type ?? '—'}</span>
                </div>
                <div>
                    <span className='trader-detail-label'>Value</span>
                    <span className='trader-detail-value'>{details.value ?? '—'}</span>
                </div>
                <div>
                    <span className='trader-detail-label'>Markup</span>
                    {editingField === 'markup' ? (
                        <div className='dashboard-mu-edit'>
                            <input type='text' value={material?.markup?.value || ''}
                                   onChange={(e) => setMarkup(details.baseName, e.target.value)} autoFocus />
                            <span className='dashboard-mu-unit'
                                  title={`Unit: ${unitDescription(material?.markup?.unit ?? UNIT_PERCENTAGE)}`}
                                  onClick={() => setUnit(details.baseName, nextUnit(material?.markup?.unit ?? UNIT_PERCENTAGE))}>
                                {unitText(material?.markup?.unit ?? UNIT_PERCENTAGE)}
                            </span>
                            <span className='dashboard-item-action' style={{visibility: 'visible'}}
                                  onClick={() => setEditingField(null)}>✓</span>
                            <span className='dashboard-item-action' style={{visibility: 'visible'}}
                                  onClick={cancelEdit}>✕</span>
                        </div>
                    ) : (
                        <span className='trader-detail-value trader-detail-editable' title='Edit markup'
                              onClick={() => startEdit('markup')}>
                            {details.markup ?? '—'} <span className='trader-detail-edit-icon'>✎</span>
                        </span>
                    )}
                </div>
                <div>
                    <span className='trader-detail-label'>Reserve</span>
                    {editingField === 'reserve' ? (
                        <div className='dashboard-mu-edit'>
                            <input type='text' value={material?.reserveAmount || ''}
                                   onChange={(e) => setReserve(details.baseName, e.target.value)} autoFocus />
                            <span className='dashboard-mu-unit'>PED</span>
                            <span className='dashboard-item-action' style={{visibility: 'visible'}}
                                  onClick={() => setEditingField(null)}>✓</span>
                            <span className='dashboard-item-action' style={{visibility: 'visible'}}
                                  onClick={cancelEdit}>✕</span>
                        </div>
                    ) : (
                        <span className='trader-detail-value trader-detail-editable' title='Edit reserve'
                              onClick={() => startEdit('reserve')}>
                            {details.reserve ?? '—'} <span className='trader-detail-edit-icon'>✎</span>
                        </span>
                    )}
                </div>
            </div>
            <div className='trader-detail-notes'>
                <span className='trader-detail-label'>Notes</span>
                {editingField === 'notes' ? (
                    <div className='dashboard-mu-edit'>
                        <input type='text' value={material?.notes || ''}
                               onChange={(e) => setNotes(details.baseName, e.target.value)} autoFocus
                               style={{flex: 1}} />
                        <span className='dashboard-item-action' style={{visibility: 'visible'}}
                              onClick={() => setEditingField(null)}>✓</span>
                        <span className='dashboard-item-action' style={{visibility: 'visible'}}
                              onClick={cancelEdit}>✕</span>
                    </div>
                ) : (
                    <span className='trader-detail-value trader-detail-editable' title='Edit notes'
                          onClick={() => startEdit('notes')}>
                        {details.notes ?? '—'} <span className='trader-detail-edit-icon'>✎</span>
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Main component ──────────────────────────────────────────────────────────

const TraderDashboard = () => {
    const statusData = useAtomValue(statusAtom)
    const connectionState = useAtomValue(connectionAtom)
    const { anyInventory } = useAtomValue(lastComputedAtom)
    const setWebSocket = useSetAtom(setConnectionWebSocketAtom)
    const setConnectionStatus = useSetAtom(setConnectionStatusAtom)

    // Trader-specific atoms
    const enrichedItems = useAtomValue(enrichedItemsAtom)
    const auctionItems = useAtomValue(auctionItemsAtom)
    const availableCriteria = useAtomValue(availableCriteriaAtom)
    const hideCriteria = useAtomValue(hideCriteriaAtom)
    const hiddenItemsCount = useAtomValue(hiddenItemsCountAtom)
    const setHideCriteria = useSetAtom(hideCriteriaAtom)
    const toggleShowHidden = useSetAtom(showHiddenItemsAtom)
    const filterOptions = useAtomValue(filterOptionsAtom)
    const setFilterOptions = useSetAtom(filterOptionsAtom)
    const tradeItemChain = useAtomValue(tradeItemChainAtom)
    const setTradeItemChain = useSetAtom(setTradeItemChainAtom)
    const addAvailable = useSetAtom(addAvailableAtom)
    const removeAvailable = useSetAtom(removeAvailableAtom)
    const itemsMap = useAtomValue(itemsMapAtom)

    // UI state
    const [statusCollapsed, setStatusCollapsed] = useAtom(dashboardStatusCollapsedAtom)
    const [showAuction, setShowAuction] = useAtom(traderAuctionExpandedAtom)
    const [showOwned, setShowOwned] = useAtom(traderOwnedExpandedAtom)
    const [showMarkup, setShowMarkup] = useAtom(traderShowMarkupAtom)
    const [viewMode, setViewMode] = useAtom(traderViewModeAtom)
    const [onlyFavorites, setOnlyFavorites] = useAtom(traderOnlyFavoritesAtom)
    const [sort, setSort] = useState<DashboardSort>({ mode: 'standard', sortType: SORT_VALUE_DESCENDING })
    const [ownedFilter, setOwnedFilter] = useAtom(traderOwnedFilterAtom)
    const [auctionFilter, setAuctionFilter] = useAtom(traderAuctionFilterAtom)

    // Connection status
    const itemsConnected = statusData.class !== 'error' && statusData.message !== STRING_CONNECTING
    const clientStatus = connectionState.client.status
    const clientConnected = clientStatus.includes('connected') && !clientStatus.includes('not connected') && !clientStatus.includes('disconnected')

    // Selected item for detail panel
    const selectedItemName = tradeItemChain?.[0]?.name

    // ── Computed values (pure helper calls) ──
    const stats = useMemo(() => calcTraderStats(enrichedItems), [enrichedItems])
    const auctionStats = useMemo(() => calcAuctionStats(auctionItems), [auctionItems])
    const filteredAuctionItems = useMemo(() => filterItemsByName(auctionItems, auctionFilter), [auctionItems, auctionFilter])
    const allOwnedItems = useMemo(() => sortOwnedItems(enrichedItems, sort, itemsMap), [enrichedItems, sort, itemsMap])
    const ownedItems = useMemo(() => {
        let data = filterByText(allOwnedItems.map(i => i.data), ownedFilter)
        if (onlyFavorites) data = filterByFavorites(data, availableCriteria.name)
        return data
            .map(d => allOwnedItems.find(i => i.data.n === d.n && i.data.c === d.c)!)
            .filter(Boolean)
    }, [allOwnedItems, ownedFilter, onlyFavorites, availableCriteria.name])
    const containerGroups = useMemo(() => groupByContainer(ownedItems), [ownedItems])
    const ownedTotalPed = useMemo(() =>
        showMarkup ? calcTotalWithMarkup(enrichedItems, itemsMap) : stats.totalValue,
        [enrichedItems, showMarkup, itemsMap, stats.totalValue])

    const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({})
    const toggleTreeContainer = (container: string) => {
        setTreeExpanded(prev => ({ ...prev, [container]: !prev[container] }))
    }
    const setAllTreeExpanded = (expanded: boolean) => {
        const next: Record<string, boolean> = {}
        for (const [container] of containerGroups) next[container] = expanded
        setTreeExpanded(next)
    }

    // Sort helpers
    const sortArrow = (col: number | 'mu-ped' | 'total') => {
        if (typeof col === 'number') {
            if (sort.mode !== 'standard') return ''
            const { column: sortCol, ascending: sortAsc } = sortTypeToColumnIndex(sort.sortType)
            return sortCol === col ? (sortAsc ? ' ▲' : ' ▼') : ''
        }
        if (sort.mode === col) return sort.desc ? ' ▼' : ' ▲'
        return ''
    }
    const onStandardSort = (col: number) => {
        const st = sort.mode === 'standard' ? sort.sortType : SORT_VALUE_DESCENDING
        setSort({ mode: 'standard', sortType: nextSortType(col, st) })
    }
    const onMuSort = (mode: 'mu-ped' | 'total') => {
        if (sort.mode === mode) setSort({ mode, desc: !sort.desc })
        else setSort({ mode, desc: true })
    }

    // Callbacks
    const handleToggleFavorite = (name: string, isFav: boolean) => {
        if (isFav) removeAvailable(name)
        else addAvailable(name)
    }
    const handleToggleHide = (name: string, isHidden: boolean) => {
        if (isHidden) {
            setHideCriteria({ ...hideCriteria, name: hideCriteria.name.filter(n => n !== name) })
        } else {
            setHideCriteria({ ...hideCriteria, name: [...hideCriteria.name, name] })
        }
    }
    const handleSelectItem = (name: string | undefined) => {
        setTradeItemChain(name, 0)
    }

    // 6 base columns: action, name, qty, value, container, favorite
    // +3 when markup is on: +MU, MU, Total
    // −1 when tree view hides the container column
    const showContainerColumn = viewMode === 'list'
    const colCount = 6 + (showMarkup ? 3 : 0) - (showContainerColumn ? 0 : 1)

    return (
        <div className='dashboard-page'>
            {/* ── Connection status ── */}
            {!statusCollapsed && <div className='dashboard-card'>
                <div className='dashboard-connection'>
                    <div className='dashboard-connection-item' title={itemsConnected
                        ? 'Receiving inventory data from the items page'
                        : 'Not receiving data. Open entropiauniverse.com/account/items and keep the tab open.'}>
                        <span className={`dashboard-connection-dot ${itemsConnected ? 'dashboard-connection-dot-green' : 'dashboard-connection-dot-red'}`} />
                        <div>
                            <span>Items page</span>
                            {itemsConnected
                                ? <span className='dashboard-connection-status'>{statusData.message}</span>
                                : <a className='dashboard-connection-link'
                                     href={URL_MY_ITEMS_PAGE}
                                     onClick={(e) => { e.preventDefault(); chrome.tabs.create({ url: URL_MY_ITEMS_PAGE }) }}>
                                    Open items page
                                </a>}
                        </div>
                    </div>
                    <div className='dashboard-connection-item' title={clientConnected
                        ? `Connected to ${connectionState.client.webSocket}`
                        : 'Client not connected. Make sure the Entropia Flow Client app is running.'}>
                        <span className={`dashboard-connection-dot ${clientConnected ? 'dashboard-connection-dot-green' : 'dashboard-connection-dot-red'}`} />
                        <div>
                            <span>Client</span>
                            {clientConnected
                                ? <span className='dashboard-connection-status'>connected</span>
                                : <div className='dashboard-connection-offline'>
                                    <input className='dashboard-connection-url'
                                           value={connectionState.client.webSocket}
                                           onChange={(e) => setWebSocket(e.target.value)}
                                           title='WebSocket URL' />
                                    <span className='dashboard-connection-link'
                                          onClick={() => { setConnectionStatus('retrying...'); messages.retryWebSocket() }}>
                                        retry
                                    </span>
                                </div>}
                        </div>
                    </div>
                    <span className='dashboard-connection-collapse' title='Click to collapse connection status'
                          onClick={() => setStatusCollapsed(true)}>▴</span>
                </div>
            </div>}

            {anyInventory && (<>
                {/* ── Stat boxes ── */}
                <div className='dashboard-stats'>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Total Value</span>
                        <span className='dashboard-stat-value'>{stats.totalValue.toFixed(2)} PED</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>On Auction</span>
                        <span className='dashboard-stat-value'>{auctionStats.count}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Favorites</span>
                        <span className='dashboard-stat-value'>{availableCriteria.name.length}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Hidden</span>
                        <span className='dashboard-stat-value'>{hiddenItemsCount}</span>
                    </div>
                </div>

                {/* ── On Auction section ── */}
                <DashboardSection
                    title='ON AUCTION'
                    total={`${auctionStats.totalPed.toFixed(2)} PED`}
                    count={auctionStats.count}
                    countLabel='items'
                    expanded={showAuction}
                    onToggle={() => setShowAuction(s => !s)}
                >
                    <>
                        <div className='dashboard-filter-row' onClick={e => e.stopPropagation()}>
                            <input
                                className='dashboard-filter-input'
                                type='text'
                                placeholder='Filter by name…'
                                value={auctionFilter}
                                onChange={e => setAuctionFilter(e.target.value)}
                            />
                            {auctionFilter && <span className='dashboard-filter-clear' onClick={() => setAuctionFilter('')}>✕</span>}
                        </div>
                        {filteredAuctionItems.length > 0 && (
                            <table className='dashboard-items-table'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th className='dashboard-col-right'>Qty</th>
                                        <th className='dashboard-col-right'>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAuctionItems.map((item, idx) => (
                                        <AuctionItemRow key={item.id ?? idx} item={item} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                </DashboardSection>

                {/* ── Owned Items section ── */}
                <DashboardSection
                    title='OWNED ITEMS'
                    total={`${ownedTotalPed.toFixed(2)} PED`}
                    count={allOwnedItems.length}
                    countLabel='items'
                    expanded={showOwned}
                    onToggle={() => setShowOwned(s => !s)}
                    actions={<>
                        <div className='storage-view-modes' onClick={e => e.stopPropagation()}>
                            <span className={`storage-view-btn ${viewMode === 'list' ? 'storage-view-btn-active' : ''}`}
                                onClick={() => setViewMode('list')} title='List view'>☰</span>
                            <span className={`storage-view-btn ${viewMode === 'tree' ? 'storage-view-btn-active' : ''}`}
                                onClick={() => setViewMode('tree')} title='Group by container'>▤</span>
                        </div>
                        <span className={`dashboard-mu-toggle ${onlyFavorites ? 'active' : ''}`}
                            onClick={() => setOnlyFavorites(!onlyFavorites)}
                            title='Show only favorite items'>
                            ★
                        </span>
                        <span className={`dashboard-mu-toggle ${showMarkup ? 'active' : ''}`}
                            onClick={() => setShowMarkup(!showMarkup)}
                            title='Toggle markup values'>
                            MU
                        </span>
                        <span className={`dashboard-mu-toggle ${filterOptions.reserve ? 'active' : ''}`}
                            onClick={() => setFilterOptions({ ...filterOptions, reserve: !filterOptions.reserve })}
                            title='Toggle reserve deductions'>
                            R
                        </span>
                        <span className={`dashboard-mu-toggle ${filterOptions.auction ? 'active' : ''}`}
                            onClick={() => setFilterOptions({ ...filterOptions, auction: !filterOptions.auction })}
                            title='Hide items on auction'>
                            A
                        </span>
                        <span className={`dashboard-mu-toggle ${filterOptions.aggregateRefined ? 'active' : ''}`}
                            onClick={() => setFilterOptions({ ...filterOptions, aggregateRefined: !filterOptions.aggregateRefined })}
                            title='Aggregate refined materials'>
                            G
                        </span>
                    </>}
                >
                    <>
                        <div className='dashboard-filter-row' onClick={e => e.stopPropagation()}>
                            <input
                                className='dashboard-filter-input'
                                type='text'
                                placeholder='Filter by name or container…'
                                value={ownedFilter}
                                onChange={e => setOwnedFilter(e.target.value)}
                            />
                            {ownedFilter && <span className='dashboard-filter-clear' onClick={() => setOwnedFilter('')}>✕</span>}
                            {viewMode === 'tree' && <>
                                <span className='storage-expand-btn' onClick={() => setAllTreeExpanded(true)} title='Expand all'>+</span>
                                <span className='storage-expand-btn' onClick={() => setAllTreeExpanded(false)} title='Collapse all'>−</span>
                            </>}
                            {(hideCriteria.name.length > 0 || hideCriteria.container.length > 0 || hideCriteria.value >= 0) && <>
                                <img
                                    className='trader-show-hidden-btn'
                                    src={hideCriteria.show ? 'img/eyeClose.png' : 'img/eyeOpen.png'}
                                    title={hideCriteria.show ? 'Hide hidden items' : 'Show hidden items (grayed)'}
                                    onClick={() => toggleShowHidden()}
                                />
                                <span className='dashboard-filter-clear' title='Unhide all items'
                                    onClick={() => setHideCriteria({ show: false, name: [], container: [], value: -1 })}>
                                    Unhide all
                                </span>
                            </>}
                        </div>
                        {ownedItems.length > 0 && (
                            <table className='dashboard-items-table'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th onClick={() => onStandardSort(0)}>Name{sortArrow(0)}</th>
                                        <th className='dashboard-col-right' onClick={() => onStandardSort(1)}>Qty{sortArrow(1)}</th>
                                        <th className='dashboard-col-right' onClick={() => onStandardSort(2)}>Value{sortArrow(2)}</th>
                                        {showMarkup && <>
                                            <th className='dashboard-col-right' onClick={() => onMuSort('mu-ped')}>+MU{sortArrow('mu-ped')}</th>
                                            <th className='dashboard-col-right'>MU</th>
                                            <th className='dashboard-col-right' onClick={() => onMuSort('total')}>Total{sortArrow('total')}</th>
                                        </>}
                                        {showContainerColumn && <th onClick={() => onStandardSort(3)}>Container{sortArrow(3)}</th>}
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewMode === 'list'
                                        ? ownedItems.map(item => (
                                            <React.Fragment key={item.data.id ?? item.data.n}>
                                                <OwnedItemRow
                                                    item={item}
                                                    showMarkup={showMarkup}
                                                    showContainer={showContainerColumn}
                                                    isFavorite={availableCriteria.name.includes(item.data.n)}
                                                    onToggleFavorite={handleToggleFavorite}
                                                    onToggleHide={handleToggleHide}
                                                    onSelect={handleSelectItem}
                                                    isSelected={item.data.n === selectedItemName}
                                                />
                                                {item.data.n === selectedItemName && (
                                                    <tr><td colSpan={colCount}>
                                                        <ItemDetailPanel itemName={item.data.n} />
                                                    </td></tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                        : containerGroups.map(([container, items]) => {
                                            const isExpanded = treeExpanded[container] !== false
                                            const groupTotal = calcGroupTotal(items)
                                            return (
                                                <React.Fragment key={container}>
                                                    <tr className='dashboard-tree-group' onClick={() => toggleTreeContainer(container)}>
                                                        <td colSpan={colCount}>
                                                            <span style={{ marginRight: 6 }}>{isExpanded ? '▾' : '▸'}</span>
                                                            {container}
                                                            <span style={{ marginLeft: 8, fontWeight: 400, color: '#888' }}>
                                                                ({items.length}) — {groupTotal.toFixed(2)} PED
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && items.map(item => (
                                                        <React.Fragment key={item.data.id ?? item.data.n}>
                                                            <OwnedItemRow
                                                                item={item}
                                                                showMarkup={showMarkup}
                                                                showContainer={showContainerColumn}
                                                                isFavorite={availableCriteria.name.includes(item.data.n)}
                                                                onToggleFavorite={handleToggleFavorite}
                                                                onToggleHide={handleToggleHide}
                                                                onSelect={handleSelectItem}
                                                                isSelected={item.data.n === selectedItemName}
                                                            />
                                                            {item.data.n === selectedItemName && (
                                                                <tr><td colSpan={colCount}>
                                                                    <ItemDetailPanel itemName={item.data.n} />
                                                                </td></tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </React.Fragment>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        )}
                    </>
                </DashboardSection>
            </>)}
        </div>
    )
}

export default TraderDashboard
