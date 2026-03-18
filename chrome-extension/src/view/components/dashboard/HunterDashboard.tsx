import React, { useMemo, useRef, useState } from 'react'
import DashboardSection from './DashboardSection'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import { statusAtom } from '../../application/atoms/status'
import { connectionAtom, setConnectionWebSocketAtom, setConnectionStatusAtom } from '../../application/atoms/connection'
import { lastComputedAtom, lastPersistedAtom, setLastShowMarkupAtom, excludeItemAtom, includeItemAtom, lastItemEditModeKeyAtom } from '../../application/atoms/last'
import { streamRenderDataAtom } from '../../application/atoms/stream'
import { currentGameLogDataAtom } from '../../application/atoms/gameLog'
import { inventoryListAtom } from '../../application/atoms/history'
import { getItemAtom, setItemBuyMarkupAtom, setItemMarkupUnitAtom } from '../../application/atoms/items'
import { cloneSortList, SORT_VALUE_DESCENDING, nextSortType, sortTypeToColumnIndex } from '../../application/helpers/inventory.sort'
import { getValueWithMarkup } from '../../application/helpers/items'
import { STRING_CONNECTING, URL_MY_ITEMS_PAGE } from '../../../common/const'
import { dateToString } from '../../../common/date'
import { unitText, nextUnit, unitDescription, UNIT_PERCENTAGE } from '../../application/state/items'
import messages from '../../services/api/messages'

export const dashboardStatusCollapsedAtom = atomWithStorage('jotai-v1-dashboard-statusCollapsed', false)
export const dashboardInventoryExpandedAtom = atomWithStorage('jotai-v1-dashboard-inventoryExpanded', false)
export const dashboardItemsExpandedAtom = atomWithStorage('jotai-v1-dashboard-itemsExpanded', false)
export const dashboardGlobalsExpandedAtom = atomWithStorage('jotai-v1-dashboard-globalsExpanded', false)
export const dashboardViewModeAtom = atomWithStorage<'list' | 'tree' | 'favorites'>('jotai-v1-dashboard-viewMode', 'list')

function getDeltaClass(delta: number | undefined) {
    if (delta === undefined || Math.abs(delta) < 0.005) delta = 0
    if (delta > 0) return 'positive'
    if (delta < 0) return 'negative'
    return ''
}

const DashboardItemRow = ({ item, showMarkup, exclude, include }: {
    item: { key: number, n: string, q: string, v: string, e?: boolean },
    showMarkup: boolean,
    exclude: (key: number) => void,
    include: (key: number) => void
}) => {
    const itemAtom = useMemo(() => getItemAtom(item.n), [item.n])
    const material = useAtomValue(itemAtom)
    const valueMU = showMarkup && material?.markup?.value
        ? getValueWithMarkup(item.q, item.v, material) : undefined

    const editModeKey = useAtomValue(lastItemEditModeKeyAtom)
    const setEditModeKey = useSetAtom(lastItemEditModeKeyAtom)
    const setMarkup = useSetAtom(setItemBuyMarkupAtom)
    const setUnit = useSetAtom(setItemMarkupUnitAtom)
    const isEditing = editModeKey === item.key
    const editStartValue = useRef('')

    return (
        <tr className={item.e ? 'dashboard-item-excluded' : ''}>
            <td>
                {item.e
                    ? <span className='dashboard-item-action' title='Include this item' onClick={() => include(item.key)}>+</span>
                    : <span className='dashboard-item-action' title='Exclude this item' onClick={() => exclude(item.key)}>✕</span>}
            </td>
            <td>{item.n}</td>
            <td className='dashboard-col-right'>{item.q}</td>
            <td className='dashboard-col-right'>{valueMU !== undefined ? valueMU.toFixed(2) : item.v}</td>
            {showMarkup && <td className='dashboard-mu-cell dashboard-col-right'>
                {isEditing ? (
                    <div className='dashboard-mu-edit'>
                        <input type='text' value={material?.markup?.value || ''}
                               onChange={(e) => setMarkup(item.n, e.target.value)} autoFocus />
                        <span className='dashboard-mu-unit'
                              title={`Unit: ${unitDescription(material?.markup?.unit ?? UNIT_PERCENTAGE)}`}
                              onClick={() => setUnit(item.n, nextUnit(material?.markup?.unit ?? UNIT_PERCENTAGE))}>
                            {unitText(material?.markup?.unit ?? UNIT_PERCENTAGE)}
                        </span>
                        <span className='dashboard-item-action' style={{visibility: 'visible'}}
                              onClick={() => setEditModeKey(undefined)}>✓</span>
                        <span className='dashboard-item-action' style={{visibility: 'visible'}}
                              onClick={() => { setMarkup(item.n, editStartValue.current); setEditModeKey(undefined) }}>✕</span>
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
                                      setMarkup(item.n, '100')
                                  }
                                  setEditModeKey(item.key)
                              }}>✎</span>
                    </span>
                )}
            </td>}
        </tr>
    )
}

const HunterDashboard = () => {
    const statusData = useAtomValue(statusAtom)
    const connectionState = useAtomValue(connectionAtom)
    const { anyInventory, delta, diff } = useAtomValue(lastComputedAtom)
    const huntData = useAtomValue(streamRenderDataAtom).layoutData['entropiaflow.hunt']
    const gameLog = useAtomValue(currentGameLogDataAtom)
    const inventoryList = useAtomValue(inventoryListAtom)
    const persisted = useAtomValue(lastPersistedAtom)
    const setShowMarkup = useSetAtom(setLastShowMarkupAtom)
    const exclude = useSetAtom(excludeItemAtom)
    const include = useSetAtom(includeItemAtom)
    const setWebSocket = useSetAtom(setConnectionWebSocketAtom)
    const setConnectionStatus = useSetAtom(setConnectionStatusAtom)

    const [statusCollapsed, setStatusCollapsed] = useAtom(dashboardStatusCollapsedAtom)
    const [showItems, setShowItems] = useAtom(dashboardItemsExpandedAtom)
    const [showGlobals, setShowGlobals] = useAtom(dashboardGlobalsExpandedAtom)
    const [sortType, setSortType] = useState(SORT_VALUE_DESCENDING)
    const [itemFilter, setItemFilter] = useState('')
    const [globalFilter, setGlobalFilter] = useState('')

    // Hunt stats from stream render data
    const returnPct = (huntData?.return_ as string) || '--'
    const dpp = (huntData?.dpp as string) || '--'
    const dps = (huntData?.dps as string) || '--'
    const isKilling = huntData?.isKilling as boolean
    const killDecay = (huntData?.lastKillDecay as string) ?? ''
    const killLoot = (huntData?.lastKillLoot as string) ?? ''

    // Cache last-kill data across fighting/idle transitions
    const lastKillCache = useRef({ decay: '', loot: '' })
    if (!isKilling && killDecay) {
        lastKillCache.current = { decay: killDecay, loot: killLoot }
    }
    const cached = lastKillCache.current
    const lastReturn = cached.decay && cached.loot
        ? ((parseFloat(cached.loot) / parseFloat(cached.decay)) * 100).toFixed(1) + '%'
        : '--'

    const killCount = gameLog.stats?.kills?.count ?? 0
    const allItems = cloneSortList(diff ?? [], sortType)
    const itemFilterLower = itemFilter.toLowerCase()
    const items = itemFilterLower
        ? allItems.filter(item => item.n.toLowerCase().includes(itemFilterLower))
        : allItems
    const itemsTotalPed = allItems.reduce((sum, item) => sum + (item.e ? 0 : parseFloat(item.v) || 0), 0)
    const avatarName = inventoryList.length > 0 ? inventoryList[0].avatarName : undefined
    const allGlobals = avatarName ? (gameLog.global ?? []).filter(g => g.player === avatarName) : []
    const globalFilterLower = globalFilter.toLowerCase()
    const globals = globalFilterLower
        ? allGlobals.filter(g => g.name?.toLowerCase().includes(globalFilterLower))
        : allGlobals
    const globalsTotalPed = allGlobals.reduce((sum, g) => sum + (g.value || 0), 0)

    // Connection status
    const itemsConnected = statusData.class !== 'error' && statusData.message !== STRING_CONNECTING
    const clientStatus = connectionState.client.status
    const clientConnected = clientStatus.includes('connected') && !clientStatus.includes('not connected') && !clientStatus.includes('disconnected')

    // Sort helpers
    const { column: sortCol, ascending: sortAsc } = sortTypeToColumnIndex(sortType)
    const sortArrow = (col: number) => sortCol === col ? (sortAsc ? ' ▲' : ' ▼') : ''

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
                <div className='dashboard-stats'>
                    <div className={`dashboard-stat dashboard-stat-${getDeltaClass(delta)}`}>
                        <span className='dashboard-stat-label'>Delta</span>
                        <span className='dashboard-stat-value'>{delta?.toFixed(2)} PED</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Return</span>
                        <span className='dashboard-stat-value'>{returnPct}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>DPP</span>
                        <span className='dashboard-stat-value'>{dpp}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>DPS</span>
                        <span className='dashboard-stat-value'>{dps}</span>
                    </div>
                </div>
                <div className='dashboard-stats'>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Kills</span>
                        <span className='dashboard-stat-value'>{killCount}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Current Kill</span>
                        <span className='dashboard-stat-value'>{isKilling ? killDecay : '--'}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Last Kill</span>
                        <span className='dashboard-stat-value'>{cached.decay || '--'}</span>
                    </div>
                    <div className='dashboard-stat'>
                        <span className='dashboard-stat-label'>Last Return</span>
                        <span className='dashboard-stat-value'>{lastReturn}</span>
                    </div>
                </div>
                <DashboardSection
                    title='ITEMS'
                    total={`${itemsTotalPed.toFixed(2)} PED`}
                    count={allItems.length}
                    countLabel='items'
                    expanded={showItems}
                    onToggle={() => setShowItems(s => !s)}
                    actions={
                        <span className={`dashboard-mu-toggle ${persisted.showMarkup ? 'active' : ''}`}
                            onClick={() => setShowMarkup(!persisted.showMarkup)}
                            title='Toggle markup values'>
                            MU
                        </span>
                    }
                >
                    <>
                        <div className='dashboard-filter-row' onClick={e => e.stopPropagation()}>
                            <input
                                className='dashboard-filter-input'
                                type='text'
                                placeholder='Filter by name…'
                                value={itemFilter}
                                onChange={e => setItemFilter(e.target.value)}
                                autoFocus
                            />
                            {itemFilter && <span className='dashboard-filter-clear' onClick={() => setItemFilter('')}>✕</span>}
                        </div>
                        {items.length > 0 && (
                            <table className='dashboard-items-table'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th onClick={() => setSortType(nextSortType(0, sortType))}>Name{sortArrow(0)}</th>
                                        <th className='dashboard-col-right' onClick={() => setSortType(nextSortType(1, sortType))}>Qty{sortArrow(1)}</th>
                                        <th className='dashboard-col-right' onClick={() => setSortType(nextSortType(2, sortType))}>Value{sortArrow(2)}</th>
                                        {persisted.showMarkup && <th className='dashboard-col-right'>MU</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <DashboardItemRow
                                            key={item.key}
                                            item={item}
                                            showMarkup={persisted.showMarkup}
                                            exclude={exclude}
                                            include={include}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                </DashboardSection>
                <DashboardSection
                    title='GLOBALS'
                    total={`${globalsTotalPed.toFixed(0)} PED`}
                    count={allGlobals.length}
                    countLabel='globals'
                    expanded={showGlobals}
                    onToggle={() => setShowGlobals(s => !s)}
                >
                    <>
                        <div className='dashboard-filter-row' onClick={e => e.stopPropagation()}>
                            <input
                                className='dashboard-filter-input'
                                type='text'
                                placeholder='Filter by name…'
                                value={globalFilter}
                                onChange={e => setGlobalFilter(e.target.value)}
                                autoFocus
                            />
                            {globalFilter && <span className='dashboard-filter-clear' onClick={() => setGlobalFilter('')}>✕</span>}
                        </div>
                        {globals.length > 0 && (
                            <table className='dashboard-items-table'>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th className='dashboard-col-right'>Value</th>
                                        <th>HoF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {globals.map((g, i) => (
                                        <tr key={i}>
                                            <td>{dateToString(g.time)}</td>
                                            <td>{g.name}</td>
                                            <td>{g.type}</td>
                                            <td className='dashboard-col-right'>{g.value.toFixed(0)} PED</td>
                                            <td>{g.isATH
                                                ? <span className='dashboard-globals-hof dashboard-globals-ath'>ATH</span>
                                                : g.isHoF
                                                ? <span className='dashboard-globals-hof'>HoF</span>
                                                : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                </DashboardSection>
            </>)}
        </div>
    )
}

export default HunterDashboard
