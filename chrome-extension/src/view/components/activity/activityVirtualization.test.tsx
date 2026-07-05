import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'jotai'
import { createStore } from 'jotai'
import { activityAtom } from '../../application/atoms/activity'
import { ActivityState } from '../../application/state/activity'
import ActionsView from './views/ActionsView'
import AutoActionsView from './views/AutoActionsView'

const sortableTableMock = jest.fn()

jest.mock('../../services/api/messages', () => ({
    __esModule: true,
    default: {},
}))

jest.mock('../common/jotai/JotaiSortableTable', () => ({
    JotaiSortableTable: (props: any) => {
        sortableTableMock(props)
        return <div data-testid='sortable-table' />
    }
}))

const noopNavigate = (() => {}) as any

const buildActivity = (): ActivityState => ({
    schema: 2,
    data: {
        sessions: [
            { id: 'session-1', name: 'Session 1', type: 'hunt', startTime: 1_000_000 },
        ],
        items: [
            { id: 1, name: 'Item 1', quantity: 1, value: 1, container: 'CARRIED', timestamp: 1_000_010, source: 'inventory' as const },
        ],
        autoActions: [
            { id: 'auto-1', sources: ['inventory'] as any, type: 'gained' as const, relatedItems: { items: [1] } },
        ],
        userActions: [
            { id: 'user-1', type: 'user-type-1', timestamp: 1_000_020, relatedItems: { items: [1] } } as any,
        ],
        actionTypeDefinitions: [],
    },
    lastProcessed: {},
    ui: {
        expanded: { sessions: [], actionRows: [] },
        showActions: 'items',
        userActionDisplay: 'values',
    },
    blacklist: {
        session: {},
        sessionAction: {},
        permanentItem: { unknown: [], hunt: [], mine: [], craft: [] },
        permanentAction: { unknown: [], hunt: [], mine: [], craft: [] },
    },
})

describe('Activity table virtualization', () => {
    beforeEach(() => {
        sortableTableMock.mockClear()
    })

    test('should enable fixed-size virtualization when Activity views are collapsed', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        const activity = buildActivity()
        store.set(activityAtom, activity)

        const sharedProps = {
            userActions: activity.data.userActions,
            actionTypeDefinitions: activity.data.actionTypeDefinitions,
            getInventoryItem: (id: number) => activity.data.items.find(item => item.id === id),
            getInventoryItemWithFallback: (itemId: number, fallbackTimestamp?: number) => {
                return activity.data.items.find(item => item.id === itemId) || {
                    id: itemId,
                    name: 'unknown',
                    quantity: 0,
                    value: 0,
                    container: 'unknown',
                    timestamp: fallbackTimestamp || Date.now(),
                    source: 'inventory' as const,
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
            sessionStartTime: 1_000_000,
            sessionEndTime: 1_000_100,
        }

        // ============================================================================
        // ACT
        // ============================================================================
        render(
            <Provider store={store}>
                <AutoActionsView sessionId='session-1' {...sharedProps} />
            </Provider>
        )

        render(
            <Provider store={store}>
                <ActionsView sessionId='session-1' {...sharedProps} />
            </Provider>
        )

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(sortableTableMock).toHaveBeenCalled()
        expect(sortableTableMock.mock.calls[0][0].useFixedSizeList).toBe(true)
        expect(sortableTableMock.mock.calls[0][0].columnWidthMode).toBe('header')
        expect(sortableTableMock.mock.calls[1][0].useFixedSizeList).toBe(true)
        expect(sortableTableMock.mock.calls[1][0].columnWidthMode).toBe('header')
    })

    test('should disable fixed-size virtualization when an action is expanded', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        const activity = buildActivity()
        store.set(activityAtom, activity)

        const sharedProps = {
            userActions: activity.data.userActions,
            actionTypeDefinitions: activity.data.actionTypeDefinitions,
            getInventoryItem: (id: number) => activity.data.items.find(item => item.id === id),
            getInventoryItemWithFallback: (itemId: number, fallbackTimestamp?: number) => {
                return activity.data.items.find(item => item.id === itemId) || {
                    id: itemId,
                    name: 'unknown',
                    quantity: 0,
                    value: 0,
                    container: 'unknown',
                    timestamp: fallbackTimestamp || Date.now(),
                    source: 'inventory' as const,
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
            expandedActionRows: new Set<string>(['auto-1']),
            editingActionId: null as string | null,
            exclusionConfig: undefined,
            itemExclusionConfig: undefined,
            isBudgetEnabled: false,
            navigate: noopNavigate,
            sessionStartTime: 1_000_000,
            sessionEndTime: 1_000_100,
        }

        // ============================================================================
        // ACT
        // ============================================================================
        render(
            <Provider store={store}>
                <AutoActionsView sessionId='session-1' {...sharedProps} />
            </Provider>
        )

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(sortableTableMock).toHaveBeenCalled()
        expect(sortableTableMock.mock.calls[0][0].useFixedSizeList).toBe(false)
        expect(sortableTableMock.mock.calls[0][0].columnWidthMode).toBe('header')
    })
})
