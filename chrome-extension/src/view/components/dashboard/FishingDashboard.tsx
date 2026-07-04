import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { atomWithStorage } from 'jotai/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import DashboardSection from './DashboardSection'
import { statusAtom } from '../../application/atoms/status'
import { connectionAtom, setConnectionStatusAtom, setConnectionWebSocketAtom } from '../../application/atoms/connection'
import { historyAtom } from '../../application/atoms/history'
import { lastComputedAtom, lastPersistedAtom, lastTimestampAtom, excludeItemAtom, includeItemAtom, resetHunterSessionAtom, undoResetHunterSessionAtom, HunterSessionSnapshot } from '../../application/atoms/last'
import { dashboardStatusCollapsedAtom } from './HunterDashboard'
import { buildFishingStats, formatDurationPrecise, formatFishingTimeWithDayOffset, summarizeFishingSession } from '../../application/helpers/fishing'
import { STRING_CONNECTING, URL_MY_ITEMS_PAGE } from '../../../common/const'
import messages from '../../services/api/messages'
import { cloneSortList, SORT_VALUE_DESCENDING, nextSortType } from '../../application/helpers/inventory.sort'
import { sortTypeToColumnIndex } from '../../application/helpers/inventory.sort'

export const fishingLootExpandedAtom = atomWithStorage('jotai-v1-fishing-lootExpanded', true)
export const fishingTreeExpandedAtom = atomWithStorage<{ looted: boolean, decayed: boolean, excluded: boolean }>(
    'jotai-v1-fishing-treeExpanded', { looted: true, decayed: true, excluded: true }
)
export const fishingSortTypeAtom = atomWithStorage('jotai-v1-fishing-sortType', SORT_VALUE_DESCENDING)

const categorizeFishingItem = (item: { q: string, e?: boolean }): 'fish' | 'decay' | 'excluded' => {
    if (item.e) return 'excluded'
    return Number(item.q) > 0 ? 'fish' : 'decay'
}

type ItemCategory = 'fish' | 'decay' | 'excluded'

const FishingItemRow = ({
    item,
    stats,
    dayZeroTime,
    exclude,
    include
}: {
    item: { key: number, n: string, q: string, v: string, e?: boolean }
    stats?: {
        count: number
        firstLootTime: number
        lastLootTime: number
    }
    dayZeroTime: number | null
    exclude: (key: number) => void
    include: (key: number) => void
}) => (
    <tr className={item.e ? 'dashboard-item-excluded' : ''}>
        <td>
            {item.e
                ? <span className='dashboard-item-action' title='Include this item' onClick={() => include(item.key)}>+</span>
                : <span className='dashboard-item-action' title='Exclude this item' onClick={() => exclude(item.key)}>✕</span>}
        </td>
        <td>{item.n}</td>
        <td className='dashboard-col-right'>{item.q}</td>
        <td className='dashboard-col-right'>
            {item.v}
        </td>
        <td className='dashboard-col-right'>
            {(() => {
                const { timeText, dayOffset } = formatFishingTimeWithDayOffset(stats?.firstLootTime, dayZeroTime)
                return <>{timeText}{dayOffset ? <sup className='dashboard-fishing-sup'>+{dayOffset}d</sup> : null}</>
            })()}
        </td>
        <td className='dashboard-col-right'>
            {(() => {
                const { timeText, dayOffset } = formatFishingTimeWithDayOffset(stats?.lastLootTime, dayZeroTime)
                return <>{timeText}{dayOffset ? <sup className='dashboard-fishing-sup'>+{dayOffset}d</sup> : null}</>
            })()}
        </td>
    </tr>
)

const SORT_NAME = 0
const SORT_QUANTITY = 1
const SORT_VALUE = 2

const FishingDashboard = () => {
    const statusData = useAtomValue(statusAtom)
    const connectionState = useAtomValue(connectionAtom)
    const { anyInventory, diff } = useAtomValue(lastComputedAtom)
    const history = useAtomValue(historyAtom)
    const persisted = useAtomValue(lastPersistedAtom)
    const lastTimestamp = useAtomValue(lastTimestampAtom)
    const exclude = useSetAtom(excludeItemAtom)
    const include = useSetAtom(includeItemAtom)
    const resetSession = useSetAtom(resetHunterSessionAtom)
    const undoReset = useSetAtom(undoResetHunterSessionAtom)
    const setWebSocket = useSetAtom(setConnectionWebSocketAtom)
    const setConnectionStatus = useSetAtom(setConnectionStatusAtom)

    const [statusCollapsed, setStatusCollapsed] = useAtom(dashboardStatusCollapsedAtom)
    const [showLoot, setShowLoot] = useAtom(fishingLootExpandedAtom)
    const [treeExpanded, setTreeExpanded] = useAtom(fishingTreeExpandedAtom)
    const [sortType, setSortType] = useAtom(fishingSortTypeAtom)
    const [now, setNow] = useState(() => Date.now())
    const [undoState, setUndoState] = useState<{ snapshot: HunterSessionSnapshot, remaining: number } | null>(null)
    const undoTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)
    const snapshotRef = useRef<HunterSessionSnapshot>(undefined)

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 100)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => () => clearInterval(undoTimerRef.current), [])

    const sessionHistory = useMemo(() => history.list.filter(view => (view.rawInventory.meta.lastDate ?? view.rawInventory.meta.date) > lastTimestamp), [history.list, lastTimestamp])
    const fishingStats = useMemo(
        () => buildFishingStats(sessionHistory, [...persisted.blacklist, ...persisted.permanentBlacklist], lastTimestamp),
        [sessionHistory, persisted.blacklist, persisted.permanentBlacklist, lastTimestamp]
    )
    const fishingSummary = useMemo(
        () => summarizeFishingSession(history.list, [...persisted.blacklist, ...persisted.permanentBlacklist], lastTimestamp, now),
        [history.list, persisted.blacklist, persisted.permanentBlacklist, lastTimestamp, now]
    )
    const dayZeroTime = fishingSummary.firstLootTime

    const sortedItems = useMemo(() => cloneSortList(diff ?? [], sortType), [diff, sortType])
    const groupedItems = useMemo(() => {
        const groups: Record<ItemCategory, typeof sortedItems> = { fish: [], decay: [], excluded: [] }
        for (const item of sortedItems) {
            groups[categorizeFishingItem(item)].push(item)
        }
        return groups
    }, [sortedItems])

    const itemsConnected = statusData.class !== 'error' && statusData.message !== STRING_CONNECTING
    const clientStatus = connectionState.client.status
    const clientConnected = clientStatus.includes('connected') && !clientStatus.includes('not connected') && !clientStatus.includes('disconnected')
    const { column: sortColumn, ascending: sortAscending } = sortTypeToColumnIndex(sortType)
    const sortArrow = (part: number) => sortColumn === part ? (sortAscending ? ' ▲' : ' ▼') : ''
    const onSort = (part: number) => setSortType(nextSortType(part, sortType))
    const hasSessionData = sortedItems.length > 0
    const toggleTreeGroup = (group: ItemCategory) => {
        setTreeExpanded(prev => ({ ...prev, [group]: !prev[group] }))
    }
    const doReset = useCallback(async () => {
        const snapshot = await resetSession()
        snapshotRef.current = snapshot
        setUndoState({ snapshot, remaining: 5 })
        clearInterval(undoTimerRef.current)
        undoTimerRef.current = setInterval(() => {
            setUndoState(prev => {
                if (!prev || prev.remaining <= 1) {
                    clearInterval(undoTimerRef.current)
                    return null
                }
                return { ...prev, remaining: prev.remaining - 1 }
            })
        }, 1000)
    }, [resetSession])
    const doUndo = useCallback(() => {
        clearInterval(undoTimerRef.current)
        if (snapshotRef.current) undoReset(snapshotRef.current)
        setUndoState(null)
    }, [undoReset])
    const groupTotals = useMemo(() => {
        const totals: Record<ItemCategory, number> = { fish: 0, decay: 0, excluded: 0 }
        for (const cat of ['fish', 'decay', 'excluded'] as ItemCategory[]) {
            totals[cat] = groupedItems[cat].reduce((sum, item) => sum + (Number(item.v) || 0), 0)
        }
        return totals
    }, [groupedItems])

    return (
        <div className='dashboard-page'>
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
                    <div className='dashboard-connection-item' title='Connection to Entropia Flow client'>
                        <span className={`dashboard-connection-dot ${clientConnected ? 'dashboard-connection-dot-green' : 'dashboard-connection-dot-red'}`} />
                        <div>
                            <span>Client</span>
                            {clientConnected
                                ? <span className='dashboard-connection-status'>connected</span>
                                : <div className='dashboard-connection-offline'>
                                    <input
                                        className='dashboard-connection-url'
                                        value={connectionState.client.webSocket}
                                        onChange={(e) => setWebSocket(e.target.value)}
                                        title='WebSocket URL'
                                    />
                                    <span
                                        className='dashboard-connection-link'
                                        onClick={() => { setConnectionStatus('retrying...'); messages.retryWebSocket() }}
                                    >
                                        retry
                                    </span>
                                </div>}
                        </div>
                    </div>
                    <span
                        className='dashboard-connection-collapse'
                        title='Click to collapse connection status'
                        onClick={() => setStatusCollapsed(true)}
                    >
                        ▴
                    </span>
                </div>
            </div>}

            {anyInventory && (<>
                <div className='dashboard-reset-row'>
                    {undoState
                        ? <>
                            <span className='dashboard-reset-pending'>Session reset</span>
                            <span className='dashboard-reset-undo' onClick={doUndo}>Undo ({undoState.remaining})</span>
                        </>
                        : <span className={`dashboard-reset-btn${hasSessionData ? '' : ' dashboard-reset-disabled'}`}
                              onClick={hasSessionData ? doReset : undefined}>Reset Session</span>}
                </div>

                <div className='dashboard-stats'>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Total PED</span>
                        <span className='dashboard-stat-value'>{fishingSummary.totalValue.toFixed(2)}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Looted</span>
                        <span className='dashboard-stat-value'>{fishingSummary.totalCount}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Average time</span>
                        <span className='dashboard-stat-value'>{formatDurationPrecise(fishingSummary.averageIntervalMs)}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label' title='Time between the last two loot events'>Last time</span>
                        <span className='dashboard-stat-value'>
                            {formatDurationPrecise(fishingSummary.lastIntervalMs)}
                        </span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Since last</span>
                        <span className='dashboard-stat-value'>{formatDurationPrecise(fishingSummary.timerSinceLastMs)}</span>
                    </div>
                </div>

                <DashboardSection
                    title='Fishing'
                    total={`${fishingSummary.totalCount} fish`}
                    count={sortedItems.length}
                    countLabel='fish rows'
                    expanded={showLoot}
                    onToggle={() => setShowLoot(!showLoot)}
                >
                    <div className='dashboard-section-body'>
                        <table className='dashboard-items-table'>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th onClick={() => onSort(SORT_NAME)}>Name{sortArrow(SORT_NAME)}</th>
                                    <th className='dashboard-col-right' onClick={() => onSort(SORT_QUANTITY)}>Qty{sortArrow(SORT_QUANTITY)}</th>
                                    <th className='dashboard-col-right' onClick={() => onSort(SORT_VALUE)}>Value{sortArrow(SORT_VALUE)}</th>
                                    <th className='dashboard-col-right'>First</th>
                                    <th className='dashboard-col-right'>Last</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(['fish', 'decay', 'excluded'] as ItemCategory[]).map(cat => {
                                    const groupItems = groupedItems[cat]
                                    if (groupItems.length === 0) return null
                                    const label = cat === 'fish' ? 'Looted' : cat === 'decay' ? 'Decayed' : 'Excluded'
                                    return (
                                        <React.Fragment key={cat}>
                                            <tr className='dashboard-tree-group' onClick={() => toggleTreeGroup(cat)}>
                                                <td colSpan={7}>
                                                    <span style={{ marginRight: 6 }}>{treeExpanded[cat] ? '▾' : '▸'}</span>
                                                    {label}
                                                    <span style={{ marginLeft: 8, fontWeight: 400, color: '#888' }}>
                                                        ({groupItems.length}) — {groupTotals[cat].toFixed(2)} PED
                                                    </span>
                                                </td>
                                            </tr>
                                            {treeExpanded[cat] && groupItems.map(item => (
                                                <FishingItemRow
                                                    key={item.key}
                                                    item={item}
                                                    stats={cat === 'fish' ? fishingStats[item.n] : undefined}
                                                    dayZeroTime={dayZeroTime}
                                                    exclude={exclude}
                                                    include={include}
                                                />
                                            ))}
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </DashboardSection>
            </>)}
        </div>
    )
}

export default FishingDashboard
