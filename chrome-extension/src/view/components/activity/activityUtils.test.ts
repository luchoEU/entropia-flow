import { buildActivitySessionBuckets, getSessionActions, getSessionItems } from './activityUtils'
import { ActivityState } from '../../application/state/activity'

describe('activityUtils session bucketing', () => {
    test('builds session buckets once and preserves pre-session boundaries', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const activity: ActivityState = {
            schema: 2,
            data: {
                items: [
                    { id: 1, name: 'Pre Item', quantity: 1, value: 10, container: 'CARRIED', timestamp: 100, source: 'inventory' },
                    { id: 2, name: 'Session 1 Item', quantity: 1, value: 20, container: 'CARRIED', timestamp: 1000, source: 'inventory' },
                    { id: 3, name: 'Session 2 Item', quantity: 1, value: 30, container: 'CARRIED', timestamp: 2000, source: 'inventory' },
                ],
                autoActions: [
                    { id: 'a1', type: 'gained', sources: ['inventory'], relatedItems: { items: [1] } },
                    { id: 'a2', type: 'gained', sources: ['inventory'], relatedItems: { items: [2] } },
                    { id: 'a3', type: 'gained', sources: ['inventory'], relatedItems: { items: [3] } },
                ],
                userActions: [],
                actionTypeDefinitions: [],
                sessions: [
                    { id: 'session-1', name: 'Session 1', type: 'hunt', startTime: 1000 },
                    { id: 'session-2', name: 'Session 2', type: 'mine', startTime: 2000 },
                ]
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

        // ============================================================================
        // ACT
        // ============================================================================
        const buckets = buildActivitySessionBuckets(activity)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(buckets.actionsBySession.get('pre-session')).toHaveLength(1)
        expect(buckets.actionsBySession.get('session-1')).toHaveLength(1)
        expect(buckets.actionsBySession.get('session-2')).toHaveLength(1)
        expect(buckets.itemsBySession.get('pre-session')).toHaveLength(1)
        expect(buckets.itemsBySession.get('session-1')).toHaveLength(1)
        expect(buckets.itemsBySession.get('session-2')).toHaveLength(1)

        expect(getSessionActions('session-1', activity)).toHaveLength(1)
        expect(getSessionItems('session-2', activity)).toHaveLength(1)
    })
})
