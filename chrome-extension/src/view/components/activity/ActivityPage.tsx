import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { StoredAction, SessionBoundary, SessionType, formatActionDescription } from '../../application/state/activity'
import { ViewItemData } from '../../application/state/history'
import ItemText from '../common/ItemText'
import { createNewSession, updateSessionName, updateSessionType, updateExpandedSessions, updateExpandedActionRows, setShowActions, reinferSessionActions, excludeItem, includeItem, permanentExcludeItem, excludeAction, includeAction, permanentExcludeAction } from '../../application/actions/activity'
import { getActivity } from '../../application/selectors/activity'
import { getSettings } from '../../application/selectors/settings'
import { isFeatureEnabled, Feature } from '../../application/state/settings'
import { reverseInferActions } from '../../application/helpers/actionInference'
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
const groupBySession = (actions: StoredAction[], sessions: SessionBoundary[]): Map<string, StoredAction[]> => {
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
    const { list: actions, sessions, expandedSessions: expandedArray, expandedActionRows, showActions, sessionBlacklist, sessionActionBlacklist, permanentItemBlacklist, permanentActionBlacklist } = useSelector(getActivity)
    const settings = useSelector(getSettings)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isBudgetEnabled = isFeatureEnabled(settings, Feature.budget)
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
    const virtualSessions = [{ id: preSessionKey, name: 'Pre-Session', type: 'unknown' as SessionType, startTime: 0 }, ...sessions].reverse()
    const groupedActions = groupBySession(actions, sessions)  // Still use real sessions for grouping
    const expandedSessions = new Set(expandedArray)
    const expandedActionRowsSet = new Set(expandedActionRows)
    const useComma = isFeatureEnabled(settings, Feature.commaDecimalSeparator);

    // Build a plain text representation for copying: title + list of items
    const buildCopyTextForAction = (a: StoredAction): string => {
        const time = formatTime(a.timestamp)
        const total = a.value?.toFixed(2) || '0.00'
        const title = formatActionDescription(a)
        const sources = a.sources.join(', ')
        let text = `${time} ${total} PED - ${title} - ${sources}`
        if (a.relatedItems && a.relatedItems.length > 0) {
            a.relatedItems.forEach((it: ViewItemData) => {
                const qty = Number(it.q) || 0
                const val = Number(it.v) || 0
                text += `\n- ${it.n} x ${qty}, ${val.toFixed(2)} PED, ${it.c}`
            })
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
        const total = action.relatedItems.reduce((sum, item) => sum + (Number(item.v) || 0), 0)
        const excluded = exclusionConfig?.isExcluded ?? false
        const permanent = exclusionConfig?.isPermanentlyExcluded ?? false
        return (
            <>
                <tr className={`item-row ${excluded ? 'item-row-excluded' : ''}`} onClick={onToggle}>
                    <td>
                        <span style={{ cursor: 'pointer', marginRight: '5px' }}>
                            {isExpanded ? '▼' : '▶'}
                        </span>
                        <span className='action-time'>{formatTime(action.timestamp)}</span>
                        {` ${total.toFixed(2)} PED `}
                        <ItemText text={formatActionDescription(action)} />
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
                                // Side-effect only; no redux action dispatched
                            }}
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
                    </td>
                    <td className='action-sources'>
                        {action.sources.join(', ')}
                    </td>
                </tr>
                {isExpanded && action.relatedItems.length > 0 &&
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
                            {action.relatedItems.map((item: ViewItemData, idx: number) => {
                                const itemExcluded = itemExclusionConfig?.sessionBlacklist?.includes(item.n) ?? false
                                const itemPermanent = itemExclusionConfig?.permanentBlacklist?.includes(item.n) ?? false
                                const isItemExcludedOrPermanent = itemExcluded || itemPermanent
                                return (
                                    <tr key={idx} className={`item-row ${isItemExcludedOrPermanent ? 'item-row-excluded' : ''}`}>
                                        <td><ItemText text={item.n} /></td>
                                        {itemExclusionConfig && (
                                            <td>
                                                {itemPermanent ? (
                                                    <ImgButton
                                                        title='Remove permanent exclusion from the sum'
                                                        src='img/forbidden.png'
                                                        show
                                                        dispatch={() => itemExclusionConfig.onPermanentExclude(item.n, false)}
                                                    />
                                                ) : itemExcluded ? (
                                                    <>
                                                        <ImgButton
                                                            title='Include this item in the sum'
                                                            src='img/cross.png'
                                                            show
                                                            dispatch={() => itemExclusionConfig.onInclude(item.n)}
                                                        />
                                                        <ImgButton
                                                            title='Permanently exclude this item from the sum'
                                                            src='img/forbidden.png'
                                                            dispatch={() => itemExclusionConfig.onPermanentExclude(item.n, true)}
                                                        />
                                                    </>
                                                ) : (
                                                    <ImgButton
                                                        title='Exclude this item from the sum'
                                                        src='img/cross.png'
                                                        dispatch={() => itemExclusionConfig.onExclude(item.n)}
                                                    />
                                                )}
                                            </td>
                                        )}
                                        <td>{item.q} </td>
                                        <td>{item.v} PED</td>
                                        <td>{item.c}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
            </>
        )
    }

    // Helper to check if an action is excluded
    const isActionExcluded = (sessionId: string, sessionType: SessionType, action: StoredAction): boolean => {
        const sessionList = sessionActionBlacklist?.[sessionId] || []
        const permanentList = permanentActionBlacklist?.[sessionType] || []
        const permanentKey = `${action.type}:${action.item}`
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
        if (showActions) {
            // In actions view, exclude by action and by item
            const delta = sessionActions.reduce((sum, action) => {
                if (isActionExcluded(session.id, session.type, action) || !action.sources.includes('inventory')) return sum
                return sum + action.relatedItems.reduce((itemSum, item) => {
                    if (isItemExcludedInSession(session.id, session.type, item.n)) return itemSum
                    return itemSum + (Number(item.v) || 0)
                }, 0)
            }, 0)
            sessionDeltas.set(session.id, delta)
        } else {
            // In items view, exclude by item name
            const items = reverseInferActions(sessionActions)
            const delta = items.reduce((sum, item) => {
                if (isItemExcludedInSession(session.id, session.type, item.n)) return sum
                return sum + (Number(item.v) || 0)
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
        dispatch(updateExpandedSessions(Array.from(newSet)))
    }

    const toggleActionRow = (id: string) => {
        const newSet = new Set(expandedActionRowsSet)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        dispatch(updateExpandedActionRows(Array.from(newSet)))
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
            <button onClick={() => dispatch(createNewSession())}>
                New Session
            </button>
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
                                        onChange={(e) => dispatch(updateSessionName(session.id, e.target.value))}
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
                                    <ImgButton
                                        title="Edit session name"
                                        src="img/edit.png"
                                        className="img-btn-edit"
                                        dispatch={() => setEditingSessionId(session.id)}
                                    />
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
                                            onChange={(e) => dispatch(updateSessionType(session.id, e.target.value as SessionType))}
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
                                                    if (showActions) {
                                                        sessionActions.sort((a, b) => b.timestamp - a.timestamp).forEach(action => {
                                                            text += '\n' + buildCopyTextForAction(action)
                                                        })
                                                    } else {
                                                        const items = reverseInferActions(sessionActions)
                                                        text = items.map(d => `${d.n}\t${d.q}\t${useComma ? d.v.replace('.', ',') : d.v}`).join('\n')
                                                    }
                                                    copyToClipboard(text)
                                                }}
                                            />
                                        )}
                                        <ImgButton
                                            title={showActions ? 'Show items list' : 'Show grouped actions'}
                                            src='img/lightning.png'
                                            className='img-btn-lightning'
                                            dispatch={() => setShowActions(!showActions)}
                                        />
                                        {!isPreSession && (
                                            <button className='btn-reinfer' onClick={() => dispatch(reinferSessionActions(session.id))}>
                                                Re-infer
                                            </button>
                                        )}
                                    </span>
                                </div>
                                {sessionActions.length > 0 && (() => {
                                    if (showActions) {
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
                                                        const permanentKey = `${action.type}:${action.item}`
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
                                                                    onExclude: () => dispatch(excludeAction(session.id, action.id)),
                                                                    onInclude: () => dispatch(includeAction(session.id, action.id)),
                                                                    onPermanentExclude: (value: boolean) => dispatch(permanentExcludeAction(session.type, action.type, action.item, value))
                                                                }}
                                                                itemExclusionConfig={{
                                                                    sessionId: session.id,
                                                                    sessionType: session.type,
                                                                    sessionBlacklist: itemSessionList,
                                                                    permanentBlacklist: itemPermanentList,
                                                                    onExclude: (itemName: string) => dispatch(excludeItem(session.id, itemName)),
                                                                    onInclude: (itemName: string) => dispatch(includeItem(session.id, itemName)),
                                                                    onPermanentExclude: (itemName: string, value: boolean) => dispatch(permanentExcludeItem(session.type, itemName, value))
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
                                    const items = reverseInferActions(sessionActions)
                                    const itemSessionList = sessionBlacklist?.[session.id] || []
                                    const itemPermanentList = permanentItemBlacklist?.[session.type] || []
                                    return <SortableItemsTable
                                        items={items}
                                        exclusionConfig={{
                                            sessionId: session.id,
                                            sessionType: session.type,
                                            sessionBlacklist: itemSessionList,
                                            permanentBlacklist: itemPermanentList,
                                            onExclude: (itemName: string) => dispatch(excludeItem(session.id, itemName)),
                                            onInclude: (itemName: string) => dispatch(includeItem(session.id, itemName)),
                                            onPermanentExclude: (itemName: string, value: boolean) => dispatch(permanentExcludeItem(session.type, itemName, value))
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
