import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { StoredAction, ActivityItem, ActivitySession, SessionType, formatActionDescription, actionTypeInfo } from '../../application/state/activity'
import { ViewItemData } from '../../application/state/history'
import ItemText from '../common/ItemText'
import {
    activityAtom,
    lastDeletedSessionAtom,
    createNewSessionAtom,
    updateSessionNameAtom,
    updateSessionTypeAtom,
    updateExpandedSessionsAtom,
    updateExpandedActionRowsAtom,
    setShowActionsAtom,
    reinferSessionActionsAtom,
    excludeItemAtom,
    includeItemAtom,
    permanentExcludeItemAtom,
    excludeActionAtom,
    includeActionAtom,
    permanentExcludeActionAtom,
    updateActionTypeAtom,
    updateActionItemAtom,
    updateActionItemsAtom,
    deleteSessionAtom,
    undoDeleteSessionAtom
} from '../../application/atoms/activity'
import { getSettings } from '../../application/selectors/settings'
import { isFeatureEnabled, Feature } from '../../application/state/settings'

import { formatDate, formatDateTime, formatTime } from '../../../common/time'
import { budgetItemUrl } from '../../application/actions/navigation'
import ImgButton from '../common/ImgButton'

function getDeltaClass(delta: number | undefined) {
    if (delta === undefined || Math.abs(delta) < 0.005)
        delta = 0
    if (delta > 0) {
        return 'positive'
    } else if (delta < 0) {
        return 'negative'
    } else {
        return ''
    }
}

type SortColumn = 'n' | 'q' | 'v' | 'c'
type SortDirection = 'asc' | 'desc'

interface ItemExclusionConfig {
    sessionId: string
    sessionType: SessionType
    sessionBlacklist: string[]
    permanentBlacklist: string[]
    onExclude: (itemName: string) => void
    onInclude: (itemName: string) => void
    onPermanentExclude: (itemName: string, value: boolean) => void
}

const SortableItemsTable = ({ items, exclusionConfig }: { items: ViewItemData[], exclusionConfig?: ItemExclusionConfig }) => {
    const [sortColumn, setSortColumn] = useState<SortColumn>('v')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const sortedItems = [...items].sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        let compare: number
        if (sortColumn === 'q' || sortColumn === 'v') {
            compare = Math.abs(parseFloat(aVal) || 0) - Math.abs(parseFloat(bVal) || 0)
        } else {
            compare = aVal.localeCompare(bVal)
        }
        return sortDirection === 'asc' ? compare : -compare
    })

    const SortHeader = ({ column, label }: { column: SortColumn, label: string }) => (
        <th onClick={() => handleSort(column)} style={{ cursor: 'pointer' }}>
            {label}
            {sortColumn === column && (
                <img src={sortDirection === 'asc' ? 'img/up.png' : 'img/down.png'} className="img-sort" style={{ marginLeft: '4px' }} />
            )}
        </th>
    )

    const isExcluded = (itemName: string) => exclusionConfig?.sessionBlacklist?.includes(itemName) ?? false
    const isPermanentlyExcluded = (itemName: string) => exclusionConfig?.permanentBlacklist?.includes(itemName) ?? false

    return (
        <table className='table-diff'>
            <thead>
                <tr>
                    <SortHeader column='n' label='Item' />
                    {exclusionConfig && <th></th>}
                    <SortHeader column='q' label='Quantity' />
                    <SortHeader column='v' label='Value' />
                    <SortHeader column='c' label='Container' />
                </tr>
            </thead>
            <tbody>
                {sortedItems.map((item) => {
                    const excluded = isExcluded(item.n)
                    const permanent = isPermanentlyExcluded(item.n)
                    const isExcludedOrPermanent = excluded || permanent
                    return (
                        <tr key={item.key} className={isExcludedOrPermanent ? 'item-row-excluded' : ''}>
                            <td><ItemText text={item.n} /></td>
                            {exclusionConfig && (
                                <td>
                                    {permanent ? (
                                        <ImgButton
                                            title='Remove permanent exclusion from the sum'
                                            src='img/forbidden.png'
                                            show
                                            dispatch={() => exclusionConfig.onPermanentExclude(item.n, false)}
                                        />
                                    ) : excluded ? (
                                        <>
                                            <ImgButton
                                                title='Include this item in the sum'
                                                src='img/cross.png'
                                                show
                                                dispatch={() => exclusionConfig.onInclude(item.n)}
                                            />
                                            <ImgButton
                                                title='Permanently exclude this item from the sum'
                                                src='img/forbidden.png'
                                                dispatch={() => exclusionConfig.onPermanentExclude(item.n, true)}
                                            />
                                        </>
                                    ) : (
                                        <ImgButton
                                            title='Exclude this item from the sum'
                                            src='img/cross.png'
                                            dispatch={() => exclusionConfig.onExclude(item.n)}
                                        />
                                    )}
                                </td>
                            )}
                            <td style={{ textAlign: 'right' }}>{item.q}</td>
                            <td style={{ textAlign: 'right' }}>{item.v} PED</td>
                            <td style={{ textAlign: 'left' }}>{item.c}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

const preSessionKey = 'pre-session'
const groupBySession = (actions: StoredAction[], sessions: ActivitySession[]): Map<string, StoredAction[]> => {
    const groups = new Map<string, StoredAction[]>()
    // Sort actions chronologically
    const sortedActions = [...actions].sort((a, b) => a.timestamp - b.timestamp)
    let sessionIndex = 0
    for (const action of sortedActions) {
        if (sessions.length === 0 || action.timestamp < sessions[0].startTime) {
            // Pre-first session
            if (!groups.has(preSessionKey)) {
                groups.set(preSessionKey, [])
            }
            groups.get(preSessionKey)!.push(action)
            continue
        }
        // Find session for this action
        while (sessionIndex < sessions.length - 1 && action.timestamp >= sessions[sessionIndex + 1].startTime) {
            sessionIndex++
        }
        const session = sessions[sessionIndex]
        const key = session.id
        if (!groups.has(key)) {
            groups.set(key, [])
        }
        groups.get(key)!.push(action)
    }
    return groups
}

function ActivityPage() {
    // Jotai state
    const activity = useAtomValue(activityAtom)
    const lastDeletedSession = useAtomValue(lastDeletedSessionAtom)

    // Guard against undefined activity
    if (!activity) {
        return (
            <section>
                <p>Loading activity data...</p>
            </section>
        )
    }

    const { data: { items: inventoryItems, autoActions: actions, sessions }, ui: { expanded: { sessions: expandedArray, actionRows: expandedActionRows }, showActions }, blacklist: { session: sessionBlacklist, sessionAction: sessionActionBlacklist, permanentItem: permanentItemBlacklist, permanentAction: permanentActionBlacklist } } = activity

    // Guard against undefined arrays
    if (!inventoryItems || !actions) {
        return (
            <section>
                <p>Loading activity data...</p>
            </section>
        )
    }

    // Create lookup function for inventory items
    const getInventoryItem = (id: number) => inventoryItems.find(item => item.id === id)

    // Helper function to get inventory item with fallback
    const getInventoryItemWithFallback = (itemId: number, fallbackTimestamp?: number): ActivityItem => {
        return getInventoryItem(itemId) || {
            id: itemId,
            name: 'unknown',
            quantity: 0,
            value: 0,
            container: 'unknown',
            timestamp: fallbackTimestamp || Date.now(),
            source: 'inventory'
        }
    }

    // Jotai actions
    const createNewSession = useSetAtom(createNewSessionAtom)
    const updateSessionName = useSetAtom(updateSessionNameAtom)
    const updateSessionType = useSetAtom(updateSessionTypeAtom)
    const updateExpandedSessions = useSetAtom(updateExpandedSessionsAtom)
    const updateExpandedActionRows = useSetAtom(updateExpandedActionRowsAtom)
    const setShowActions = useSetAtom(setShowActionsAtom)
    const reinferSessionActions = useSetAtom(reinferSessionActionsAtom)
    const excludeItem = useSetAtom(excludeItemAtom)
    const includeItem = useSetAtom(includeItemAtom)
    const permanentExcludeItem = useSetAtom(permanentExcludeItemAtom)
    const excludeAction = useSetAtom(excludeActionAtom)
    const includeAction = useSetAtom(includeActionAtom)
    const permanentExcludeAction = useSetAtom(permanentExcludeActionAtom)
    const updateActionType = useSetAtom(updateActionTypeAtom)
    const updateActionItem = useSetAtom(updateActionItemAtom)
    const updateActionItems = useSetAtom(updateActionItemsAtom)
    const deleteSession = useSetAtom(deleteSessionAtom)
    const undoDeleteSession = useSetAtom(undoDeleteSessionAtom)

    // Redux state (for settings only)
    const settings = useSelector(getSettings)
    const navigate = useNavigate()
    const isBudgetEnabled = isFeatureEnabled(settings, Feature.budget)
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
    const [editingActionId, setEditingActionId] = useState<string | null>(null)
    const virtualSessions = [{ id: preSessionKey, name: 'Pre-Session', type: 'unknown' as SessionType, startTime: 0 }, ...sessions].reverse()
    const groupedActions = groupBySession(actions, sessions)  // Still use real sessions for grouping
    const expandedSessions = new Set(expandedArray)
    const expandedActionRowsSet = new Set(expandedActionRows)
    const useComma = isFeatureEnabled(settings, Feature.commaDecimalSeparator);

    // Helper to extract all item IDs from relatedItems structure
    const getAllItemIds = (action: StoredAction): number[] => {
        const values = Object.values(action.relatedItems)
        const ids: number[] = []
        for (const value of values) {
            if (typeof value === 'number') {
                ids.push(value)
            } else if (Array.isArray(value)) {
                ids.push(...value)
            }
        }
        return ids
    }

    const buildCopyTextForItems = (items: ActivityItem[]): string => {
        return items.map(d => `${d.name}\t${d.quantity}\t${useComma ? (d.value ?? 0).toFixed(2).replace('.', ',') : (d.value ?? 0).toFixed(2)}`).join('\n')
    }

    // Build a plain text representation for copying: title + list of items
    const buildCopyTextForAction = (a: StoredAction): string => {
        const time = formatTime(a.timestamp)
        const itemIds = getAllItemIds(a)
        // Calculate total value from related inventory items
        const total = itemIds.reduce((sum, itemId) => {
            const item = getInventoryItem(itemId)
            return sum + (item ? item.value : 0)
        }, 0).toFixed(2)
        const title = formatActionDescription(a, getInventoryItem)
        const sources = a.sources.join(', ')
        let text = `${time} ${total} PED - ${title} - ${sources}`
        if (itemIds.length > 0) {
            text += '\n'
            // Get inventory items directly
            const items: ActivityItem[] = itemIds.map(itemId => getInventoryItemWithFallback(itemId, a.timestamp))
            text += buildCopyTextForItems(items)
        }
        return text
    }

    const copyToClipboard = async (text: string) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text)
                return
            }
        } catch {
            // fallthrough to fallback
        }
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        try { document.execCommand('copy') } catch { /* ignore */ }
        document.body.removeChild(ta)
    }

    interface ActionExclusionConfig {
        sessionId: string
        sessionType: SessionType
        isExcluded: boolean
        isPermanentlyExcluded: boolean
        onExclude: () => void
        onInclude: () => void
        onPermanentExclude: (value: boolean) => void
    }

    const ActionRow = ({ action, isExpanded, onToggle, exclusionConfig, itemExclusionConfig }: { action: StoredAction, isExpanded: boolean, onToggle: () => void, exclusionConfig?: ActionExclusionConfig, itemExclusionConfig?: ItemExclusionConfig }) => {
        const itemIds = getAllItemIds(action)
        const total = itemIds.reduce((sum, itemId) => {
            const item = getInventoryItem(itemId)
            return sum + (item ? item.value : 0)
        }, 0)
        const excluded = exclusionConfig?.isExcluded ?? false
        const permanent = exclusionConfig?.isPermanentlyExcluded ?? false

        return (
            <>
                <tr className={`item-row ${excluded ? 'item-row-excluded' : ''}`}>
                    <td>
                        <span style={{ cursor: 'pointer', marginRight: '5px' }} onClick={onToggle}>
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    </td>
                    <td>
                        <span className='action-time'>{formatTime(action.timestamp)}</span>
                    </td>
                    <td>
                        {`${total.toFixed(2)} PED`}
                    </td>
                    <td>
                        <div>
                            {editingActionId === action.id ?
                                <select
                                    value={action.type}
                                    onChange={(e) => updateActionType({ actionId: action.id, type: e.target.value as any })}
                                    style={{ marginRight: '5px' }}
                                >
                                    {Object.entries(actionTypeInfo).map(([type, info]) => (
                                        <option key={type} value={type}>{info.icon} {info.name}</option>
                                    ))}
                                </select>
                                :
                                <ItemText text={formatActionDescription(action, getInventoryItem)} />
                            }
                            {action.budgetName && isBudgetEnabled && (
                                <span
                                    style={{ marginLeft: '10px', textDecoration: 'underline', cursor: 'pointer', color: 'blue' }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(budgetItemUrl(action.budgetName!))
                                    }}
                                >
                                    [📊Budget]
                                </span>
                            )}
                            <ImgButton
                                title="Copy to clipboard"
                                src="img/copy.png"
                                className="img-btn-copy"
                                clickPopup="Copied!"
                                dispatch={() => {
                                    const text = buildCopyTextForAction(action)
                                    copyToClipboard(text)
                                }}
                            />
                            <ImgButton
                                title="Edit action item"
                                src="img/edit.png"
                                className="img-btn"
                                dispatch={() => setEditingActionId(editingActionId == action.id ? null : action.id)}
                            />
                            {exclusionConfig && (
                                permanent ? (
                                    <ImgButton
                                        title='Remove permanent exclusion from the sum'
                                        src='img/forbidden.png'
                                        show
                                        dispatch={() => exclusionConfig.onPermanentExclude(false)}
                                    />
                                ) : excluded ? (
                                    <>
                                        <ImgButton
                                            title='Include this action in the sum'
                                            src='img/cross.png'
                                            show
                                            dispatch={() => exclusionConfig.onInclude()}
                                        />
                                        <ImgButton
                                            title='Permanently exclude this action type from the sum'
                                            src='img/forbidden.png'
                                            dispatch={() => exclusionConfig.onPermanentExclude(true)}
                                        />
                                    </>
                                ) : (
                                    <ImgButton
                                        title='Exclude this action from the sum'
                                        src='img/cross.png'
                                        dispatch={() => exclusionConfig.onExclude()}
                                    />
                                )
                            )}
                        </div>
                    </td>
                    <td className='action-sources'>
                        {action.sources.join(', ')}
                    </td>
                </tr>
                {isExpanded && itemIds.length > 0 &&
                    <tr>
                        <td></td>
                        <td colSpan={4}>
                            <table className='table-diff' style={{ paddingLeft: '40px' }}>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        {itemExclusionConfig && <th></th>}
                                        <th>Quantity</th>
                                        <th>Value</th>
                                        <th>Container</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {itemIds.map((itemId: number, idx: number) => {
                                        const item = getInventoryItemWithFallback(itemId, action.timestamp)
                                        const itemExcluded = itemExclusionConfig?.sessionBlacklist?.includes(item.name) ?? false
                                        const itemPermanent = itemExclusionConfig?.permanentBlacklist?.includes(item.name) ?? false
                                        const isItemExcludedOrPermanent = itemExcluded || itemPermanent
                                        return (
                                            <tr key={idx} className={`item-row ${isItemExcludedOrPermanent ? 'item-row-excluded' : ''}`}>
                                                <td><ItemText text={item.name} /></td>
                                                {itemExclusionConfig && (
                                                    <td>
                                                        {itemPermanent ? (
                                                            <ImgButton
                                                                title='Remove permanent exclusion from the sum'
                                                                src='img/forbidden.png'
                                                                show
                                                                dispatch={() => itemExclusionConfig.onPermanentExclude(item.name, false)}
                                                            />
                                                        ) : itemExcluded ? (
                                                            <>
                                                                <ImgButton
                                                                    title='Include this item in the sum'
                                                                    src='img/cross.png'
                                                                    show
                                                                    dispatch={() => itemExclusionConfig.onInclude(item.name)}
                                                                />
                                                                <ImgButton
                                                                    title='Permanently exclude this item from the sum'
                                                                    src='img/forbidden.png'
                                                                    dispatch={() => itemExclusionConfig.onPermanentExclude(item.name, true)}
                                                                />
                                                            </>
                                                        ) : (
                                                            <ImgButton
                                                                title='Exclude this item from the sum'
                                                                src='img/cross.png'
                                                                dispatch={() => itemExclusionConfig.onExclude(item.name)}
                                                            />
                                                        )}
                                                    </td>
                                                )}
                                                <td>{item.quantity} </td>
                                                <td>{(item.value ?? 0).toFixed(2)} PED</td>
                                                <td>{item.container}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                }
            </>
        )
    }

    // Helper to check if an action is excluded
            const isActionExcluded = (sessionId: string, sessionType: SessionType, action: StoredAction): boolean => {
        const sessionList = sessionActionBlacklist?.[sessionId] || []
        const permanentList = permanentActionBlacklist?.[sessionType] || []
        // For now, use action type as the key since we don't have item names directly
        const permanentKey = `${action.type}:unknown`
        return sessionList.includes(action.id) || permanentList.includes(permanentKey)
    }

    // Helper to check if an item is excluded (for items view)
    const isItemExcludedInSession = (sessionId: string, sessionType: SessionType, itemName: string): boolean => {
        const sessionList = sessionBlacklist?.[sessionId] || []
        const permanentList = permanentItemBlacklist?.[sessionType] || []
        return sessionList.includes(itemName) || permanentList.includes(itemName)
    }

    // Compute delta for each virtual session (respecting exclusions)
    const sessionDeltas = new Map<string, number>()
    for (const session of virtualSessions) {
        const sessionActions = groupedActions.get(session.id) || []
        if (showActions === 'autoActions') {
            // In actions view, exclude by action and by item
            const delta = sessionActions.reduce((sum, action) => {
                if (isActionExcluded(session.id, session.type, action) || !action.sources.includes('inventory')) return sum
                const itemIds = getAllItemIds(action)
                return sum + itemIds.reduce((itemSum, itemId) => {
                    const item = getInventoryItem(itemId)
                    if (item && !isItemExcludedInSession(session.id, session.type, item.name)) {
                        return itemSum + item.value
                    }
                    return itemSum
                }, 0)
            }, 0)
            sessionDeltas.set(session.id, delta)
        } else {
            // In items view, exclude by item name
            // Calculate delta from inventory items referenced by actions
            const delta = sessionActions.reduce((sum, action) => {
                const itemIds = getAllItemIds(action)
                return sum + itemIds.reduce((actionSum, itemId) => {
                    const item = getInventoryItem(itemId)
                    if (item && !isItemExcludedInSession(session.id, session.type, item.name)) {
                        return actionSum + item.value
                    }
                    return actionSum
                }, 0)
            }, 0)
            sessionDeltas.set(session.id, delta)
        }
    }

    const toggleSession = (sessionId: string) => {
        const newSet = new Set(expandedSessions)
        if (newSet.has(sessionId)) {
            newSet.delete(sessionId)
        } else {
            newSet.add(sessionId)
        }
        updateExpandedSessions(Array.from(newSet))
    }

    const toggleActionRow = (id: string) => {
        const newSet = new Set(expandedActionRowsSet)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        updateExpandedActionRows(Array.from(newSet))
    }

    if (actions.length === 0) {
        return (
            <section>
                <p>No actions recorded yet.</p>
                <p>Actions will appear here as inventory changes are detected.</p>
            </section>
        )
    }

    return (
        <section>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => createNewSession()}>
                    New Session
                </button>
                {lastDeletedSession && (
                    <button onClick={() => undoDeleteSession()}>
                        Undo Delete Session
                    </button>
                )}
                <ImgButton
                    title={showActions === 'autoActions' ? 'Show user actions' : showActions === 'userActions' ? 'Show items list' : 'Show auto actions'}
                    src='img/lightning.png'
                    className='img-btn-lightning'
                    dispatch={() => {
                        if (showActions === 'autoActions') {
                            setShowActions('userActions')
                        } else if (showActions === 'userActions') {
                            setShowActions('items')
                        } else {
                            setShowActions('autoActions')
                        }
                    }}
                />
            </div>
            {virtualSessions.filter(session => session.id !== 'pre-session' || (groupedActions.get(session.id) || []).length > 0).map((session) => {
                const sessionActions = groupedActions.get(session.id) || []
                const isPreSession = session.id === 'pre-session'
                const start = isPreSession ? Math.min(...sessionActions.map(a => a.timestamp)) : session.startTime
                const sessionIndex = isPreSession ? -1 : sessions.findIndex(s => s.id === session.id)
                const end = isPreSession ? (sessions[0]?.startTime || Date.now()) : (sessions[sessionIndex + 1]?.startTime || Date.now())
                const typeIcon = { unknown: '❓', hunt: '🏹', mine: '⛏️', craft: '🔨' }[session.type]
                const isExpanded = expandedSessions.has(session.id)
                return (
                    <div key={session.id} className='actions-group'>
                        <div className='session-header' onClick={() => toggleSession(session.id)} style={{ cursor: sessionActions.length > 0 ? 'pointer' : 'default' }}>
                            <div className='session-header-main'>
                                <span className='session-expand'>{isExpanded ? '▼' : '▶'}</span>
                                {editingSessionId === session.id ? (
                                    <input
                                        value={session.name}
                                        onChange={(e) => updateSessionName({ sessionId: session.id, name: e.target.value })}
                                        onBlur={() => setEditingSessionId(null)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setEditingSessionId(null) }}
                                        autoFocus
                                        className='session-name-input'
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className='session-name'>{session.name}</span>
                                )}
                                {!isPreSession && editingSessionId !== session.id && (
                                    <>
                                        <ImgButton
                                            title="Edit session name"
                                            src="img/edit.png"
                                            className="img-btn-edit"
                                            dispatch={() => setEditingSessionId(session.id)}
                                        />
                                        <ImgButton
                                            title="Delete session"
                                            src="img/trash.png"
                                            className="img-btn-trash-black"
                                            dispatch={() => deleteSession(session.id)}
                                        />
                                    </>
                                )}
                                {sessionDeltas.get(session.id) !== undefined && (
                                    <span className={`difference ${getDeltaClass(sessionDeltas.get(session.id))}`}>
                                        {sessionDeltas.get(session.id)?.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            <span className='session-date'>{formatDateTime(start)}</span>
                        </div>
                        {isExpanded && (
                            <div className='session-content'>
                                <div className='session-meta'>
                                    <span className='session-type'>
                                        {typeIcon}
                                        <select
                                            value={session.type}
                                            onChange={(e) => updateSessionType({ sessionId: session.id, sessionType: e.target.value as SessionType })}
                                            disabled={isPreSession}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="unknown">Any</option>
                                            <option value="hunt">Hunt</option>
                                            <option value="mine">Mine</option>
                                            <option value="craft">Craft</option>
                                        </select>
                                    </span>
                                    {session.inventory && (
                                        <span className='session-inventory'>
                                            {session.inventory.total.toFixed(2)} PED ({session.inventory.items} items)
                                        </span>
                                    )}
                                    <span className='session-meta-actions'>
                                        {sessionActions.length > 0 && (
                                            <ImgButton
                                                title="Copy session to clipboard"
                                                src="img/copy.png"
                                                className="img-btn-copy"
                                                clickPopup="Copied!"
                                                dispatch={() => {
                                                    let text = `${session.name}\n`
                                                    if (showActions === 'autoActions') {
                                                        sessionActions.sort((a, b) => b.timestamp - a.timestamp).forEach(action => {
                                                            text += '\n' + buildCopyTextForAction(action)
                                                        })
                                                     } else {
                                                         // Get all inventory items referenced by actions in this session
                                                         const itemIds = new Set<number>()
                                                         sessionActions.forEach(action => {
                                                             getAllItemIds(action).forEach(itemId => itemIds.add(itemId))
                                                         })
                                                         const items = Array.from(itemIds).map(itemId => getInventoryItem(itemId)).filter(item => item !== undefined) as ActivityItem[]
                                                         text = buildCopyTextForItems(items)
                                                     }
                                                    copyToClipboard(text)
                                                }}
                                            />
                                        )}
                                        {!isPreSession && (
                                            <button className='btn-reinfer' onClick={() => reinferSessionActions(session.id)}>
                                                Re-infer
                                            </button>
                                        )}
                                    </span>
                                </div>
                                {sessionActions.length > 0 && (() => {
                                    if (showActions === 'autoActions') {
                                        const dateGroups: Map<string, StoredAction[]> = new Map()
                                        sessionActions.sort((a, b) => b.timestamp - a.timestamp).forEach(action => {
                                            const date = formatDate(action.timestamp)
                                            if (!dateGroups.has(date)) {
                                                dateGroups.set(date, [])
                                            }
                                            dateGroups.get(date)!.push(action)
                                        })
                                        return Array.from(dateGroups.entries()).map(([date, dateActions]) => (
                                            <div key={date}>
                                                <h5 style={{ margin: '10px 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{date}</h5>
                                                <table className='table-diff'>
                                                    <tbody>
                                                        {dateActions.map((action, idx) => {
                                                            const actionSessionList = sessionActionBlacklist?.[session.id] || []
                                                            const actionPermanentList = permanentActionBlacklist?.[session.type] || []
                                                            const isExcluded = actionSessionList.includes(action.id)
                                                             const permanentKey = `${action.type}:unknown`
                                                            const isPermanentlyExcluded = actionPermanentList.includes(permanentKey)
                                                            const itemSessionList = sessionBlacklist?.[session.id] || []
                                                            const itemPermanentList = permanentItemBlacklist?.[session.type] || []
                                                            return (
                                                                <ActionRow
                                                                    key={action.id || idx}
                                                                    action={action}
                                                                    isExpanded={expandedActionRowsSet.has(action.id)}
                                                                    onToggle={() => toggleActionRow(action.id)}
                                                                    exclusionConfig={{
                                                                        sessionId: session.id,
                                                                        sessionType: session.type,
                                                                        isExcluded: isExcluded || isPermanentlyExcluded,
                                                                        isPermanentlyExcluded,
                                                                        onExclude: () => excludeAction({ sessionId: session.id, actionId: action.id }),
                                                                        onInclude: () => includeAction({ sessionId: session.id, actionId: action.id }),
                                                                         onPermanentExclude: (value: boolean) => permanentExcludeAction({ sessionType: session.type, actionType: action.type, itemName: 'unknown', value })
                                                                    }}
                                                                    itemExclusionConfig={{
                                                                        sessionId: session.id,
                                                                        sessionType: session.type,
                                                                        sessionBlacklist: itemSessionList,
                                                                        permanentBlacklist: itemPermanentList,
                                                                        onExclude: (itemName: string) => excludeItem({ sessionId: session.id, itemName }),
                                                                        onInclude: (itemName: string) => includeItem({ sessionId: session.id, itemName }),
                                                                        onPermanentExclude: (itemName: string, value: boolean) => permanentExcludeItem({ sessionType: session.type, itemName, value })
                                                                    }}
                                                                />
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))
                                    } else {
                                        // Show inventory items
                                        const itemIds = new Set<number>()
                                        sessionActions.forEach(action => {
                                            getAllItemIds(action).forEach(itemId => itemIds.add(itemId))
                                        })
                                        const items: ViewItemData[] = Array.from(itemIds).map(itemId => {
                                            const item = getInventoryItemWithFallback(itemId)
                                            return {
                                                key: item.id,
                                                n: item.name,
                                                q: (item.quantity ?? 0).toString(),
                                                v: (item.value ?? 0).toFixed(2),
                                                c: item.container
                                            }
                                        })
                                        const itemSessionList = sessionBlacklist?.[session.id] || []
                                        const itemPermanentList = permanentItemBlacklist?.[session.type] || []
                                        return <SortableItemsTable
                                            items={items}
                                            exclusionConfig={{
                                                sessionId: session.id,
                                                sessionType: session.type,
                                                sessionBlacklist: itemSessionList,
                                                permanentBlacklist: itemPermanentList,
                                                onExclude: (itemName: string) => excludeItem({ sessionId: session.id, itemName }),
                                                onInclude: (itemName: string) => includeItem({ sessionId: session.id, itemName }),
                                                onPermanentExclude: (itemName: string, value: boolean) => permanentExcludeItem({ sessionType: session.type, itemName, value })
                                            }}
                                        />
                                    }
                                })()}
                            </div>
                        )}
                    </div>
                )
            })}
        </section>
    )
}

export default ActivityPage
