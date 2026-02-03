import React, { useState } from 'react'
import { useAtomValue } from 'jotai'
import { virtualSessionsAtom } from '../../application/atoms/activity'
import { preSessionKey } from './activityPageUtils'
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
    const virtualSessions = useAtomValue(virtualSessionsAtom)

    const activityData = activity

    // Local state
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
    const [editingActionId, setEditingActionId] = useState<string | null>(null)
    const [showActions, setShowActionsLocal] = useState<'items' | 'userActions'>('items')

    // Guard against undefined activity
    if (!activityData) {
        return (
            <section>
                <p>Loading activity data...</p>
            </section>
        )
    }

    const { data: { items: inventoryItems, autoActions: actions, userActions, actionTypeDefinitions }, ui: { expanded: { sessions: expandedArray, actionRows: expandedActionRows }, showActions: globalShowActions }, blacklist: { session: sessionBlacklist, permanentItem: permanentItemBlacklist } } = activityData

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
    const expandedSessions = new Set(expandedArray)
    const expandedActionRowsSet = new Set(expandedActionRows)

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
            <div className='img-hover-container' style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => createNewSession()}>
                    ✨ New Session
                </button>
                {lastDeletedSession && (
                    <button onClick={() => undoDeleteSession()}>
                        ↩️ Undo Delete Session
                    </button>
                )}
                <button onClick={async () => {
                    await clearAllAndReloadDirect()
                }}>
                    🔁 Reset Items
                </button>
                <button
                    onClick={() => setShowActionsLocal('items')}
                    style={{ fontWeight: showActions === 'items' ? 'bold' : 'normal', opacity: showActions === 'items' ? 1 : 0.6 }}
                    title='Show items list'
                >
                    📦 Items
                </button>
                <button
                    onClick={() => setShowActionsLocal('userActions')}
                    style={{ fontWeight: showActions === 'userActions' ? 'bold' : 'normal', opacity: showActions === 'userActions' ? 1 : 0.6 }}
                    title='Show user actions'
                >
                    👤 User Actions
                </button>
            </div>

            {/* Sessions */}
            {virtualSessions.map((session) => {
                const isPreSession = session.id === preSessionKey
                const isExpanded = expandedSessions.has(session.id)

                return (
                    <div key={session.id} className='actions-group'>
                        {/* Session Header */}
                        <SessionHeader
                            sessionName={session.name}
                            isExpanded={isExpanded}
                            isEditing={editingSessionId === session.id}
                            isPreSession={isPreSession}
                            startTime={session.start}
                            delta={session.delta}
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
                                    sessionName={session.name}
                                    typeIcon={typeIcon[session.type as keyof typeof typeIcon]}
                                    isPreSession={isPreSession}
                                    inventory={session.inventory}
                                    showActions={showActions}
                                    onUpdateType={(type) => updateSessionType({ sessionId: session.id, sessionType: type })}
                                    onCopy={() => copyToClipboard('')}
                                    onReinfer={() => reinferSessionActions(session.id)}
                                    buildCopyTextForAction={buildCopyTextForAction}
                                    buildCopyTextForItems={buildCopyTextForItems}
                                />

                                {/* Main Layout: Items/User Actions on left, Auto Actions on right */}
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    {/* Left: Items/User Actions toggle view */}
                                    <div style={{ flex: 1 }}>
                                        {(() => {
                                            if (showActions === 'items') {
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
                                                        sessionStartTime={session.start}
                                                        sessionEndTime={session.end}
                                                    />
                                                )
                                            } else if (showActions === 'userActions') {
                                                return (
                                                    <ActionsView
                                                        sessionId={session.id}
                                                        userActions={userActions}
                                                        actionTypeDefinitions={actionTypeDefinitions}
                                                        onCreateAction={handleCreateAction}
                                                        onRemoveUserAction={removeUserAction}
                                                        getInventoryItem={getInventoryItem}
                                                        getInventoryItemWithFallback={getInventoryItemWithFallback}
                                                        getAllItemIds={getAllItemIds}
                                                        isValidEmoji={isValidEmoji}
                                                        onSaveActionType={updateActionTypeDefinition}
                                                        sessionStartTime={session.start}
                                                        sessionEndTime={session.end}
                                                    />
                                                )
                                            }
                                        })()}
                                    </div>

                                    {/* Right: Auto Actions */}
                                    <div style={{ flex: 1 }}>
                                        <h3>Auto Actions</h3>
                                        <AutoActionsView
                                            sessionId={session.id}
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
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </section>
    )
}

export default ActivityPage
