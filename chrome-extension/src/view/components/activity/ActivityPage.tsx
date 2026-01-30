import React, { useState } from 'react'
import { useAtomValue } from 'jotai'
import { SessionType, getActionTimestamp } from '../../application/state/activity'
import { itemsBySessionAtom } from '../../application/atoms/activity'
import { preSessionKey, groupBySession } from './activityPageUtils'
import { useActivityPage, useClearAllAndReload } from './useActivityPage'
import SessionHeader from './SessionHeader'
import SessionMeta from './SessionMeta'
import AutoActionsView from './views/AutoActionsView'
import ItemsView from './views/ItemsView'
import ActionsView from './views/ActionsView'

function ActivityPage() {
    const {
        activity,
        lastDeletedSession,
        isBudgetEnabled,
        navigate,
        createNewSession,
        updateSessionName,
        updateSessionType,
        updateExpandedSessions,
        updateExpandedActionRows,
        setShowActions,
        reinferSessionActions,
        excludeItem,
        includeItem,
        permanentExcludeItem,
        updateActionType,
        deleteSession,
        undoDeleteSession,
        addActionTypeDefinition,
        updateActionTypeDefinition,
        addUserAction,
        removeUserAction,
        getAllItemIds,
        getInventoryItem,
        getInventoryItemWithFallback,
        buildCopyTextForItems,
        buildCopyTextForAction,
        copyToClipboard,
    } = useActivityPage()
    const clearAllAndReloadDirect = useClearAllAndReload()
    const itemsBySession = useAtomValue(itemsBySessionAtom)

    const activityData = activity

    // Local state
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
    const [editingActionId, setEditingActionId] = useState<string | null>(null)

    // Guard against undefined activity
    if (!activityData) {
        return (
            <section>
                <p>Loading activity data...</p>
            </section>
        )
    }

    const { data: { items: inventoryItems, autoActions: actions, sessions, userActions, actionTypeDefinitions }, ui: { expanded: { sessions: expandedArray, actionRows: expandedActionRows }, showActions }, blacklist: { session: sessionBlacklist, sessionAction: sessionActionBlacklist, permanentItem: permanentItemBlacklist, permanentAction: permanentActionBlacklist } } = activityData

    // Guard against undefined arrays
    if (!inventoryItems || !actions) {
        return (
            <section>
                <p>Loading activity data...</p>
            </section>
        )
    }

    if (actions.length === 0) {
        return (
            <section>
                <p>No actions recorded yet.</p>
                <p>Actions will appear here as inventory changes are detected.</p>
            </section>
        )
    }

    // Helper functions
    const isValidEmoji = (str: string): boolean => {
        if (!str) return false
        const emoji = new RegExp(/(?:[\u2600-\u27BF]|(?:\ud83c[\ud000-\udfff])|(?:\ud83d[\ud000-\ude4f])|(?:\ud83d[\ude80-\udeff])|(?:\ud83e[\udd00-\uddff]))/g)
        const matches = str.match(emoji)
        return matches !== null && matches.length === 1 && matches[0] === str
    }

    const handleCreateAction = async (emoji: string, name: string, items: any[]) => {
        if (!name.trim()) return

        const validEmoji = emoji.trim() || '🎯'
        if (!isValidEmoji(validEmoji)) return

        // Extract item IDs from ViewItemData
        const itemIds = items.map(item => item.key as number)
        if (itemIds.length === 0) return

        const inferenceRule = {
            items: itemIds.map(itemId => {
                const item = getInventoryItem(itemId)
                return {
                    name: item ? { type: 'exact' as const, value: item.name } : { type: 'any' as const },
                    quantity: { type: 'any' as const },
                    value: { type: 'any' as const },
                    container: { type: 'any' as const },
                    fieldName: 'items'
                }
            })
        }

        const typeId = crypto.randomUUID()
        const definition = {
            id: typeId,
            name: name.trim(),
            emoji: validEmoji,
            inferenceRule: inferenceRule,
            createdAt: Date.now()
        }

        await addActionTypeDefinition(definition)

        const action = {
            type: typeId,
            timestamp: Date.now(),
            relatedItems: {
                items: itemIds
            }
        }

        await addUserAction(action)
    }

    // Derived state
    const virtualSessions = [{ id: preSessionKey, name: 'Pre-Session', type: 'unknown' as SessionType, startTime: 0 }, ...sessions].reverse()
    const groupedActions = groupBySession(actions, sessions, inventoryItems)
    const expandedSessions = new Set(expandedArray)
    const expandedActionRowsSet = new Set(expandedActionRows)

    // Calculate session time ranges (based on sorted sessions, not reversed virtualSessions)
    const sessionTimeRanges = new Map<string, { start: number; end: number }>()
    for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i]
        const start = session.startTime
        const end = i + 1 < sessions.length ? sessions[i + 1].startTime : Infinity
        sessionTimeRanges.set(session.id, { start, end })
    }
    // Pre-session time range
    const preSessionEnd = sessions.length > 0 ? sessions[0].startTime : Infinity
    sessionTimeRanges.set(preSessionKey, { start: 0, end: preSessionEnd })

    // Calculate session deltas and inventory summaries
    const sessionDeltas = new Map<string, number>()
    const sessionInventorySummaries = new Map<string, { total: number; items: number }>()
    for (const session of virtualSessions) {
        const sessionItems = itemsBySession.get(session.id) || []
        const delta = sessionItems.reduce((sum: number, item: any) => {
            if (!sessionBlacklist?.[session.id]?.includes(item.name) && typeof item.value === 'number') {
                return sum + item.value
            }
            return sum
        }, 0)
        sessionDeltas.set(session.id, delta)

        // Calculate inventory summary (all unique items in session, excluding blacklisted items)
        let totalValue = 0
        let totalItems = 0
        sessionItems.forEach((item: any) => {
            if (!sessionBlacklist?.[session.id]?.includes(item.name)) {
                if (typeof item.value === 'number') {
                    totalValue += item.value
                }
                const quantity = typeof item.quantity === 'number' ? item.quantity : 1
                totalItems += quantity
            }
        })
        sessionInventorySummaries.set(session.id, { total: totalValue, items: totalItems })
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

    const typeIcon = { unknown: '❓', hunt: '🏹', mine: '⛏️', craft: '🔨' }

    return (
        <section>
            {/* Toolbar */}
            <div className='img-container-hover' style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => createNewSession()}>
                    New Session
                </button>
                {lastDeletedSession && (
                    <button onClick={() => undoDeleteSession()}>
                        Undo Delete Session
                    </button>
                )}
                <button onClick={async () => {
                    await clearAllAndReloadDirect()
                }}>
                    Reset Items
                </button>
                <button
                    onClick={() => setShowActions('autoActions')}
                    style={{ fontWeight: showActions === 'autoActions' ? 'bold' : 'normal', opacity: showActions === 'autoActions' ? 1 : 0.6 }}
                    title='Show auto actions'
                >
                    Auto Actions
                </button>
                <button
                    onClick={() => setShowActions('userActions')}
                    style={{ fontWeight: showActions === 'userActions' ? 'bold' : 'normal', opacity: showActions === 'userActions' ? 1 : 0.6 }}
                    title='Show user actions'
                >
                    User Actions
                </button>
                <button
                    onClick={() => setShowActions('items')}
                    style={{ fontWeight: showActions === 'items' ? 'bold' : 'normal', opacity: showActions === 'items' ? 1 : 0.6 }}
                    title='Show items list'
                >
                    Items
                </button>
            </div>

            {/* Sessions */}
            {virtualSessions.filter(session => session.id !== 'pre-session' || (groupedActions.get(session.id) || []).length > 0).map((session) => {
                const sessionActions = groupedActions.get(session.id) || []
                const isPreSession = session.id === preSessionKey
                const start = isPreSession ? Math.min(...sessionActions.map(a => getActionTimestamp(a, getInventoryItem))) : session.startTime

                // Get the correct session time range (handles both normal sessions and pre-session)
                const timeRange = sessionTimeRanges.get(session.id) || { start, end: Infinity }
                const end = timeRange.end

                const isExpanded = expandedSessions.has(session.id)

                return (
                    <div key={session.id} className='actions-group'>
                        {/* Session Header */}
                        <SessionHeader
                            sessionId={session.id}
                            sessionName={session.name}
                            sessionType={session.type}
                            isExpanded={isExpanded}
                            isEditing={editingSessionId === session.id}
                            isPreSession={isPreSession}
                            startTime={start}
                            delta={sessionDeltas.get(session.id)}
                            onToggleExpand={() => toggleSession(session.id)}
                            onStartEdit={() => setEditingSessionId(session.id)}
                            onSaveName={(name) => {
                                updateSessionName({ sessionId: session.id, name })
                                setEditingSessionId(null)
                            }}
                            onDelete={() => deleteSession(session.id)}
                        />

                        {/* Session Content */}
                        {isExpanded && (
                            <div className='session-content'>
                                {/* Session Meta */}
                                <SessionMeta
                                    sessionId={session.id}
                                    sessionType={session.type}
                                    sessionActions={sessionActions}
                                    sessionName={session.name}
                                    typeIcon={typeIcon[session.type as keyof typeof typeIcon]}
                                    isPreSession={isPreSession}
                                    inventory={sessionInventorySummaries.get(session.id)}
                                    showActions={showActions}
                                    onUpdateType={(type) => updateSessionType({ sessionId: session.id, sessionType: type })}
                                    onCopy={() => copyToClipboard('')}
                                    onReinfer={() => reinferSessionActions(session.id)}
                                    getAllItemIds={getAllItemIds}
                                    buildCopyTextForAction={buildCopyTextForAction}
                                    buildCopyTextForItems={buildCopyTextForItems}
                                    getInventoryItem={getInventoryItem}
                                />

                                {/* Views */}
                                {sessionActions.length > 0 && (() => {
                                    if (showActions === 'autoActions') {
                                        return (
                                            <AutoActionsView
                                                sessionId={session.id}
                                                sessionType={session.type}
                                                sessionActions={sessionActions}
                                                expandedActionRows={expandedActionRowsSet}
                                                editingActionId={editingActionId}
                                                onToggleActionRow={toggleActionRow}
                                                onStartEditAction={(id) => setEditingActionId(id)}
                                                onUpdateActionType={(actionId, type) => updateActionType({ actionId, type: type as any })}
                                                isBudgetEnabled={isBudgetEnabled}
                                                navigate={navigate}
                                                getInventoryItem={getInventoryItem}
                                                getInventoryItemWithFallback={getInventoryItemWithFallback}
                                                getAllItemIds={getAllItemIds}
                                                buildCopyTextForAction={buildCopyTextForAction}
                                                copyToClipboard={copyToClipboard}
                                            />
                                        )
                                    } else if (showActions === 'items') {
                                        const itemSessionList = sessionBlacklist?.[session.id] || []
                                        const itemPermanentList = permanentItemBlacklist?.[session.type] || []
                                        return (
                                            <ItemsView
                                                itemExclusionConfig={{
                                                    sessionId: session.id,
                                                    sessionType: session.type,
                                                    sessionBlacklist: itemSessionList,
                                                    permanentBlacklist: itemPermanentList,
                                                    onExclude: (itemName: string) => excludeItem({ sessionId: session.id, itemName }),
                                                    onInclude: (itemName: string) => includeItem({ sessionId: session.id, itemName }),
                                                    onPermanentExclude: (itemName: string, value: boolean) => permanentExcludeItem({ sessionType: session.type, itemName, value })
                                                }}
                                                sessionStartTime={start}
                                                sessionEndTime={end}
                                            />
                                        )
                                    } else if (showActions === 'userActions') {
                                        const itemSessionList = sessionBlacklist?.[session.id] || []
                                        const itemPermanentList = permanentItemBlacklist?.[session.type] || []
                                        return (
                                            <ActionsView
                                                sessionId={session.id}
                                                sessionActions={sessionActions}
                                                userActions={userActions}
                                                actionTypeDefinitions={actionTypeDefinitions}
                                                onCreateAction={handleCreateAction}
                                                onRemoveUserAction={removeUserAction}
                                                getInventoryItem={getInventoryItem}
                                                getInventoryItemWithFallback={getInventoryItemWithFallback}
                                                getAllItemIds={getAllItemIds}
                                                isValidEmoji={isValidEmoji}
                                                onSaveActionType={updateActionTypeDefinition}
                                            />
                                        )
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
