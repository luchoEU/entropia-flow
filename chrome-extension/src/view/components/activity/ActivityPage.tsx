import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { StoredAction, SessionBoundary, SessionType, formatActionDescription } from '../../application/state/activity'
import { ViewItemData } from '../../application/state/history'
import ItemText from '../common/ItemText'
import TextButton from '../common/TextButton'
import { createNewSession, updateSessionName, updateSessionType, updateExpandedSessions, updateExpandedActionRows, setShowActions, reinferSessionActions } from '../../application/actions/activity'
import { getActivity } from '../../application/selectors/activity'
import { getSettings } from '../../application/selectors/settings'
import { isFeatureEnabled, Feature } from '../../application/state/settings'
import { reverseInferActions } from '../../application/helpers/actionInference'
import { formatDate, formatDateTime, formatTime } from '../../../common/time'
import { budgetItemUrl } from '../../application/actions/navigation'

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
    const { list: actions, sessions, expandedSessions: expandedArray, expandedActionRows, showActions } = useSelector(getActivity)
    const settings = useSelector(getSettings)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const isBudgetEnabled = isFeatureEnabled(settings, Feature.budget)
    const virtualSessions = [{ id: preSessionKey, name: 'Pre-Session', type: 'unknown' as SessionType, startTime: 0 }, ...sessions].reverse()
    const groupedActions = groupBySession(actions, sessions)  // Still use real sessions for grouping
    const expandedSessions = new Set(expandedArray)
    const expandedActionRowsSet = new Set(expandedActionRows)

    const ActionRow = ({ action, isExpanded, onToggle }: { action: StoredAction, isExpanded: boolean, onToggle: () => void }) => {
        const total = action.relatedItems.reduce((sum, item) => sum + (Number(item.v) || 0), 0)
        return (
            <>
                <tr className='item-row' onClick={onToggle}>
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
                    </td>
                    <td className='action-sources'>
                        {action.sources.join(', ')}
                    </td>
                </tr>
                {isExpanded && action.relatedItems.length > 0 &&
                    <table className='table-diff' style={{ paddingLeft: '40px' }}>
                        <thead>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Value</th>
                            <th>Container</th>
                        </thead>
                        <tbody>
                            {action.relatedItems.map((item: ViewItemData, idx: number) => (
                                <tr key={idx} className='item-row'>
                                    <td><ItemText text={item.n} /></td>
                                    <td>{item.q} </td>
                                    <td>{item.v} PED</td>
                                    <td>{item.c}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </>
        )
    }

    // Compute delta for each virtual session
    const sessionDeltas = new Map<string, number>()
    for (const session of virtualSessions) {
        const sessionActions = groupedActions.get(session.id) || []
        const delta = sessionActions.reduce((sum, action) => {
            return sum + action.relatedItems.reduce((itemSum, item) => itemSum + (Number(item.v) || 0), 0)
        }, 0)
        sessionDeltas.set(session.id, delta)
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
            <TextButton
                title={ showActions ? 'Show items list' : 'Show grouped actions' }
                className={ `button-actions ${showActions ? 'active' : ''}` }
                text={ showActions ? 'Actions' : 'Items' }
                dispatch={() => dispatch(setShowActions(!showActions))} />
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
                         <h4 className='actions-date' onClick={() => toggleSession(session.id)} style={{ cursor: sessionActions.length > 0 ? 'pointer' : 'default', fontSize: '18px' }}>
                             <span style={{ marginRight: '5px' }}>{isExpanded ? '▼' : '▶'}</span>
                            <input
                                value={session.name}
                                onChange={(e) => dispatch(updateSessionName(session.id, e.target.value))}
                                disabled={isPreSession}
                                style={{ border: 'none', background: 'transparent', fontSize: 'inherit', fontWeight: 'bold' }}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {sessionDeltas.get(session.id) !== undefined && <span style={{ marginRight: '10px' }} className={`difference ${getDeltaClass(sessionDeltas.get(session.id))}`}>{sessionDeltas.get(session.id)?.toFixed(2)}</span>}
                            {formatDateTime(start)}
                         </h4>
                        {isExpanded && (
                            <>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                     <span>
                                         <strong>Type:</strong> {typeIcon}
                                         <select
                                             value={session.type}
                                             onChange={(e) => dispatch(updateSessionType(session.id, e.target.value as SessionType))}
                                             disabled={isPreSession}
                                             style={{ border: 'none', background: 'transparent' }}
                                             onClick={(e) => e.stopPropagation()}
                                         >
                                             <option value="unknown">Unknown</option>
                                             <option value="hunt">Hunt</option>
                                             <option value="mine">Mine</option>
                                             <option value="craft">Craft</option>
                                         </select>
                                     </span>
                                     {!isPreSession && (
                                         <button onClick={() => dispatch(reinferSessionActions(session.id))}>
                                             Re-infer Actions
                                         </button>
                                     )}
                                 </div>
                                {session.inventory && (
                                    <p style={{ margin: '10px 0', fontSize: '14px' }}>
                                        <span><strong>Inventory</strong>: {session.inventory.total.toFixed(2)} PED ({session.inventory.items} items)</span>
                                    </p>
                                )}
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
                                                    {dateActions.map((action, idx) => (
                                                        <ActionRow key={action.id || idx} action={action} isExpanded={expandedActionRowsSet.has(action.id)} onToggle={() => toggleActionRow(action.id)} />
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))
                                    } else {
                                    // Show inventory items
                                    const items = reverseInferActions(sessionActions)
                                    return (
                                        <table className='table-diff'>
                                            <thead>
                                                <th>Item</th>
                                                <th>Quantity</th>
                                                <th>Value</th>
                                                <th>Container</th>
                                            </thead>
                                            <tbody>
                                            {items.map((item) => (
                                                <tr key={item.key}>
                                                    <td><ItemText text={item.n} /></td>
                                                    <td>{item.q}</td>
                                                    <td>{item.v} PED</td>
                                                    <td>{item.c}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    )
                                    }
                                })()}
                            </>
                        )}
                    </div>
                )
            })}
        </section>
    )
}

export default ActivityPage
