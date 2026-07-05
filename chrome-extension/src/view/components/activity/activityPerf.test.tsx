import React, { Profiler } from 'react'
import { render, cleanup } from '@testing-library/react'
import { Provider } from 'jotai'
import { createStore } from 'jotai'
import { activityAtom } from '../../application/atoms/activity'
import { ActivityState } from '../../application/state/activity'
import ActionsView from './views/ActionsView'
import AutoActionsView from './views/AutoActionsView'

jest.mock('../../services/api/messages', () => ({
    __esModule: true,
    default: {},
}))

const noopNavigate = (() => {}) as any

const buildLargeActivity = (): ActivityState => {
    const sessions = Array.from({ length: 18 }, (_, index) => ({
        id: `session-${index + 1}`,
        name: `Session ${index + 1}`,
        type: (index % 3 === 0 ? 'hunt' : index % 3 === 1 ? 'mine' : 'craft') as ActivityState['data']['sessions'][number]['type'],
        startTime: 1_000_000 + index * 10_000
    }))

    const items = Array.from({ length: 3600 }, (_, index) => ({
        id: index + 1,
        name: `Item ${index + 1}`,
        quantity: (index % 5) + 1,
        value: ((index % 100) + 1) / 10,
        container: index % 2 === 0 ? 'CARRIED' : `Storage ${index % 7}`,
        timestamp: 1_000_000 + Math.floor(index / 10) * 100,
        source: 'inventory' as const
    }))

    const autoActions = Array.from({ length: 1600 }, (_, index) => ({
        id: `action-${index + 1}`,
        sources: ['inventory'] as any,
        type: 'gained' as const,
        relatedItems: {
            items: [index + 1]
        }
    }))

    const userActions = Array.from({ length: 260 }, (_, index) => ({
        id: `user-${index + 1}`,
        type: `user-type-${index + 1}`,
        sources: ['client'] as any,
        timestamp: 1_000_000 + index * 2500,
        relatedItems: {
            items: [(index * 11) % items.length + 1]
        }
    }))

    return {
        schema: 2,
        data: {
            items,
            autoActions,
            userActions,
            actionTypeDefinitions: [],
            sessions
        },
        lastProcessed: {},
        ui: {
            expanded: { sessions: [], actionRows: [] },
            showActions: 'items',
            userActionDisplay: 'values'
        },
        blacklist: {
            session: {},
            sessionAction: {},
            permanentItem: { unknown: [], hunt: [], mine: [], craft: [] },
            permanentAction: { unknown: [], hunt: [], mine: [], craft: [] }
        }
    }
}

function profileRender(label: string, element: React.ReactElement) {
    const timings: number[] = []
    const onRender = (_id: string, _phase: string, actualDuration: number) => {
        timings.push(actualDuration)
    }

    const started = performance.now()
    const result = render(<Profiler id={label} onRender={onRender}>{element}</Profiler>)
    const ended = performance.now()
    const total = ended - started
    const actual = timings.reduce((sum, value) => sum + value, 0)

    console.log(`${label}: actualDuration=${actual.toFixed(2)}ms wall=${total.toFixed(2)}ms`)
    result.unmount()
    cleanup()

    return { actual, total }
}

describe('Activity performance profile', () => {
    test('measures the main Activity subviews on a large synthetic data set', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        const activity = buildLargeActivity()
        store.set(activityAtom, activity)

        const commonProps = {
            getInventoryItem: (id: number) => activity.data.items.find(item => item.id === id),
            getInventoryItemWithFallback: (itemId: number, fallbackTimestamp?: number) => {
                return activity.data.items.find(item => item.id === itemId) || {
                    id: itemId,
                    name: 'unknown',
                    quantity: 0,
                    value: 0,
                    container: 'unknown',
                    timestamp: fallbackTimestamp || Date.now(),
                    source: 'inventory' as const
                }
            },
            getAllItemIds: (action: any) => {
                const items = action?.relatedItems?.items
                return Array.isArray(items) ? items : typeof items === 'number' ? [items] : []
            },
            buildCopyTextForAction: () => '',
            copyToClipboard: async () => undefined,
            isValidEmoji: () => true,
            onCreateAction: async () => undefined,
            onRemoveUserAction: () => undefined,
            onSaveActionType: async () => undefined,
            onToggleActionRow: () => undefined,
            onStartEditAction: () => undefined,
            onUpdateActionType: () => undefined,
            expandedActionRows: new Set<string>(),
            editingActionId: null as string | null,
            exclusionConfig: undefined,
            itemExclusionConfig: undefined,
            isBudgetEnabled: false,
            navigate: noopNavigate,
            userActions: activity.data.userActions,
            actionTypeDefinitions: activity.data.actionTypeDefinitions,
            sessionStartTime: 1_000_000,
            sessionEndTime: 1_000_000 + 200_000,
        }

        // ============================================================================
        // ACT
        // ============================================================================
        const auto = profileRender(
            'AutoActionsView',
            <Provider store={store}>
                <AutoActionsView
                    sessionId={activity.data.sessions[10].id}
                    {...commonProps}
                />
            </Provider>
        )

        const actions = profileRender(
            'ActionsView',
            <Provider store={store}>
                <ActionsView
                    sessionId={activity.data.sessions[10].id}
                    {...commonProps}
                />
            </Provider>
        )

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(auto.actual).toBeGreaterThan(0)
        expect(actions.actual).toBeGreaterThan(0)

        console.log('PROFILE_SUMMARY', {
            autoActionsActualMs: auto.actual.toFixed(2),
            autoActionsWallMs: auto.total.toFixed(2),
            actionsActualMs: actions.actual.toFixed(2),
            actionsWallMs: actions.total.toFixed(2)
        })
    })
})
