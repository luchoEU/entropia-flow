import React, { useState } from 'react'
import DashboardSection from './DashboardSection'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { statusAtom } from '../../application/atoms/status'
import { connectionAtom, setConnectionWebSocketAtom, setConnectionStatusAtom } from '../../application/atoms/connection'
import { inventoryListAtom } from '../../application/atoms/history'
import { lastComputedAtom } from '../../application/atoms/last'
import { cloneSortList, SORT_VALUE_DESCENDING, nextSortType, sortTypeToColumnIndex } from '../../application/helpers/inventory.sort'
import { STRING_CONNECTING, URL_MY_ITEMS_PAGE } from '../../../common/const'
import { dashboardStatusCollapsedAtom, dashboardInventoryExpandedAtom, dashboardViewModeAtom } from './HunterDashboard'
import messages from '../../services/api/messages'
import {
    byStoreStateAtom, byStoreFilterAtom, byStoreStaredFilterAtom,
    byStoreContainersAtom,
    setByStoreInventoryFilterAtom, setByStoreStaredInventoryFilterAtom,
    setByStoreItemExpandedAtom, setByStoreItemExpandedOnFilterAtom,
    setByStoreStaredItemExpandedAtom,
    setByStoreItemStaredAtom, setByStoreStaredItemStaredAtom,
    setByStoreAllItemsExpandedSimpleAtom, setByStoreStaredAllItemsExpandedAtom,
} from '../../application/atoms/inventory'
import { TreeLineData } from '../../application/state/inventory'

// ─── Tree row ────────────────────────────────────────────────────────────────

const TreeRow = ({
    item,
    isFavorite,
    editingId,
    editingName,
    onEditStart,
    onEditChange,
    onEditConfirm,
    onEditCancel,
    onToggleExpand,
    onToggleStar,
}: {
    item: TreeLineData
    isFavorite: boolean
    editingId: string | null
    editingName: string
    onEditStart: (id: string, name: string) => void
    onEditChange: (name: string) => void
    onEditConfirm: (id: string) => void
    onEditCancel: () => void
    onToggleExpand: (item: TreeLineData, isFavorite: boolean) => void
    onToggleStar: (item: TreeLineData, stared: boolean) => void
}) => {
    const indent = '\u00A0'.repeat(item.indent * 4)
    const isEditing = editingId === item.id && item.canEditName
    const isContainer = item.isContainer

    return (
        <tr className={isContainer ? 'storage-tree-container' : ''}>
            <td className='storage-tree-name-cell'>
                {indent && <span>{indent}</span>}
                {item.expanded !== undefined && (
                    <span
                        className='storage-tree-expand'
                        onClick={() => onToggleExpand(item, isFavorite)}
                        title={item.expanded ? 'Collapse' : 'Expand'}
                    >
                        {item.expanded ? '▼' : '▶'}
                    </span>
                )}
                {isEditing ? (
                    <span className='storage-tree-edit-row'>
                        <input
                            className='storage-tree-edit-input'
                            value={editingName}
                            onChange={e => onEditChange(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') onEditConfirm(item.id)
                                if (e.key === 'Escape') onEditCancel()
                            }}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                        <span className='storage-tree-edit-btn' onClick={() => onEditConfirm(item.id)} title='Confirm'>✓</span>
                        <span className='storage-tree-edit-btn' onClick={onEditCancel} title='Cancel'>✕</span>
                    </span>
                ) : (
                    <span className='storage-tree-name-label'>
                        <span>{item.n}</span>
                        {item.canEditName && (
                            <span
                                className='storage-tree-action storage-tree-edit-icon'
                                onClick={e => { e.stopPropagation(); onEditStart(item.id, item.n) }}
                                title='Rename'
                            >✎</span>
                        )}
                    </span>
                )}
                {isContainer && !isEditing && (
                    <span
                        className={`storage-tree-action storage-tree-star ${item.stared ? 'storage-tree-star-on' : ''}`}
                        onClick={e => { e.stopPropagation(); onToggleStar(item, !item.stared) }}
                        title={item.stared ? 'Remove from Favorites' : 'Add to Favorites'}
                    >
                        {item.stared ? '★' : '☆'}
                    </span>
                )}
            </td>
            <td className='dashboard-col-right storage-tree-qty'>{item.q}</td>
            <td className='dashboard-col-right storage-tree-value'>{item.v}</td>
        </tr>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

const StorageDashboard = () => {
    const statusData = useAtomValue(statusAtom)
    const connectionState = useAtomValue(connectionAtom)
    const { anyInventory } = useAtomValue(lastComputedAtom)
    const inventoryList = useAtomValue(inventoryListAtom)
    const setWebSocket = useSetAtom(setConnectionWebSocketAtom)
    const setConnectionStatus = useSetAtom(setConnectionStatusAtom)

    const [statusCollapsed, setStatusCollapsed] = useAtom(dashboardStatusCollapsedAtom)
    const [showItems, setShowItems] = useAtom(dashboardInventoryExpandedAtom)
    const [viewMode, setViewMode] = useAtom(dashboardViewModeAtom)
    const [sortType, setSortType] = useState(SORT_VALUE_DESCENDING)
    const [listFilter, setListFilter] = useState('')

    // List view data
    const latest = inventoryList.find(inv => inv.itemlist !== undefined)
    const rawItems = latest?.itemlist ?? []
    const totalPed = parseFloat(latest?.meta?.total ?? '0')
    const listFilterLower = listFilter.toLowerCase()
    const filteredItems = listFilterLower
        ? rawItems.filter(item => item.n.toLowerCase().includes(listFilterLower) || item.c.toLowerCase().includes(listFilterLower))
        : rawItems
    const sortedItems = cloneSortList(filteredItems, sortType)

    // Tree view atoms
    const inv = useAtomValue(byStoreStateAtom)
    const byStoreFilter = useAtomValue(byStoreFilterAtom)
    const byStoreStaredFilter = useAtomValue(byStoreStaredFilterAtom)
    const setByStoreFilter = useSetAtom(setByStoreInventoryFilterAtom)
    const setByStoreStaredFilter = useSetAtom(setByStoreStaredInventoryFilterAtom)
    const setExpanded = useSetAtom(setByStoreItemExpandedAtom)
    const setExpandedOnFilter = useSetAtom(setByStoreItemExpandedOnFilterAtom)
    const setStaredExpanded = useSetAtom(setByStoreStaredItemExpandedAtom)
    const setStared = useSetAtom(setByStoreItemStaredAtom)
    const setStaredStared = useSetAtom(setByStoreStaredItemStaredAtom)
    const setAllExpanded = useSetAtom(setByStoreAllItemsExpandedSimpleAtom)
    const setAllStaredExpanded = useSetAtom(setByStoreStaredAllItemsExpandedAtom)
    const [byStoreContainers, setByStoreContainers] = useAtom(byStoreContainersAtom)

    // Edit state (local — name saved directly to byStoreContainersAtom on confirm)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')

    const handleEditStart = (id: string, name: string) => {
        setEditingId(id)
        setEditingName(name)
    }
    const handleEditCancel = () => { setEditingId(null); setEditingName('') }
    const handleEditConfirm = (id: string) => {
        if (editingName.trim()) {
            const updated = { ...byStoreContainers }
            if (updated[id]) {
                updated[id] = { ...updated[id], displayName: editingName.trim() }
            } else {
                updated[id] = { displayName: editingName.trim(), expanded: false }
            }
            setByStoreContainers(updated)
        }
        setEditingId(null)
        setEditingName('')
    }

    const handleToggleExpand = (item: TreeLineData, isFavorite: boolean) => {
        const newExpanded = !item.expanded
        if (isFavorite) {
            setStaredExpanded(item.id, newExpanded)
        } else if (byStoreFilter) {
            setExpandedOnFilter(item.id, item.n, newExpanded)
        } else {
            setExpanded(item.id, item.n, newExpanded)
        }
    }

    const handleToggleStar = (item: TreeLineData, stared: boolean, isFavorite: boolean) => {
        if (isFavorite) {
            setStaredStared(item.id, stared)
        } else {
            setStared(item.id, stared)
        }
    }

    // Connection status
    const itemsConnected = statusData.class !== 'error' && statusData.message !== STRING_CONNECTING
    const clientStatus = connectionState.client.status
    const clientConnected = clientStatus.includes('connected') && !clientStatus.includes('not connected') && !clientStatus.includes('disconnected')

    // Sort helpers (list view)
    const { column: sortCol, ascending: sortAsc } = sortTypeToColumnIndex(sortType)
    const sortArrow = (col: number) => sortCol === col ? (sortAsc ? ' ▲' : ' ▼') : ''

    const treeItems = viewMode === 'favorites' ? (inv?.staredItems ?? []) : (inv?.items ?? [])
    const treeFilter = viewMode === 'favorites' ? byStoreStaredFilter : byStoreFilter
    const setTreeFilter = viewMode === 'favorites' ? setByStoreStaredFilter : setByStoreFilter
    const isFavoriteMode = viewMode === 'favorites'

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

            {anyInventory && (
                <DashboardSection
                    title='INVENTORY'
                    total={`${totalPed.toFixed(2)} PED`}
                    count={rawItems.length}
                    countLabel='items'
                    expanded={showItems}
                    onToggle={() => setShowItems(s => !s)}
                    actions={
                        <span className='storage-view-modes' onClick={e => e.stopPropagation()}>
                            <span
                                className={`storage-view-btn ${viewMode === 'list' ? 'storage-view-btn-active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title='List view'
                            >≡</span>
                            <span
                                className={`storage-view-btn ${viewMode === 'tree' ? 'storage-view-btn-active' : ''}`}
                                onClick={() => setViewMode('tree')}
                                title='Tree view'
                            >⊞</span>
                            <span
                                className={`storage-view-btn ${viewMode === 'favorites' ? 'storage-view-btn-active' : ''}`}
                                onClick={() => setViewMode(viewMode === 'favorites' ? 'tree' : 'favorites')}
                                title='Favorites'
                            >★</span>
                        </span>
                    }
                >
                    <>
                        {/* ── Filter row ── */}
                        <div className='dashboard-filter-row' onClick={e => e.stopPropagation()}>
                            {viewMode === 'list' ? (
                                <>
                                    <input
                                        className='dashboard-filter-input'
                                        type='text'
                                        placeholder='Filter by name or container…'
                                        value={listFilter}
                                        onChange={e => setListFilter(e.target.value)}
                                        autoFocus
                                    />
                                    {listFilter && <span className='dashboard-filter-clear' onClick={() => setListFilter('')}>✕</span>}
                                </>
                            ) : (
                                <>
                                    <input
                                        className='dashboard-filter-input'
                                        type='text'
                                        placeholder='Filter…'
                                        value={treeFilter}
                                        onChange={e => setTreeFilter(e.target.value)}
                                        autoFocus
                                    />
                                    {treeFilter && <span className='dashboard-filter-clear' onClick={() => setTreeFilter('')}>✕</span>}
                                    <span className='storage-expand-btn' onClick={() => isFavoriteMode ? setAllStaredExpanded(true) : setAllExpanded(true)} title='Expand all'>+</span>
                                    <span className='storage-expand-btn' onClick={() => isFavoriteMode ? setAllStaredExpanded(false) : setAllExpanded(false)} title='Collapse all'>−</span>
                                </>
                            )}
                        </div>

                        {/* ── List view ── */}
                        {viewMode === 'list' && (
                            <table className='dashboard-items-table'>
                                <thead>
                                    <tr>
                                        <th onClick={() => setSortType(nextSortType(0, sortType))}>Name{sortArrow(0)}</th>
                                        <th className='dashboard-col-right' onClick={() => setSortType(nextSortType(1, sortType))}>Qty{sortArrow(1)}</th>
                                        <th className='dashboard-col-right' onClick={() => setSortType(nextSortType(2, sortType))}>Value{sortArrow(2)}</th>
                                        <th onClick={() => setSortType(nextSortType(3, sortType))}>Container{sortArrow(3)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedItems.map((item, idx) => (
                                        <tr key={item.id ?? idx}>
                                            <td>{item.n}</td>
                                            <td className='dashboard-col-right'>{item.q}</td>
                                            <td className='dashboard-col-right'>{item.v}</td>
                                            <td>{item.c}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* ── Tree / Favorites view ── */}
                        {(viewMode === 'tree' || viewMode === 'favorites') && (
                            <>
                                {!inv && <div className='storage-tree-loading'>Loading…</div>}
                                {inv && treeItems.length === 0 && (
                                    <div className='storage-tree-empty'>
                                        {viewMode === 'favorites' ? 'No favorites. Star a container in Tree view.' : 'No items.'}
                                    </div>
                                )}
                                {inv && treeItems.length > 0 && (
                                    <table className='dashboard-items-table storage-tree-table'>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th className='dashboard-col-right'>Qty</th>
                                                <th className='dashboard-col-right'>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {treeItems.map(item => (
                                                <TreeRow
                                                    key={item.id}
                                                    item={item}
                                                    isFavorite={isFavoriteMode}
                                                    editingId={editingId}
                                                    editingName={editingName}
                                                    onEditStart={handleEditStart}
                                                    onEditChange={setEditingName}
                                                    onEditConfirm={handleEditConfirm}
                                                    onEditCancel={handleEditCancel}
                                                    onToggleExpand={handleToggleExpand}
                                                    onToggleStar={(item, stared) => handleToggleStar(item, stared, isFavoriteMode)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </>
                </DashboardSection>
            )}
        </div>
    )
}

export default StorageDashboard
