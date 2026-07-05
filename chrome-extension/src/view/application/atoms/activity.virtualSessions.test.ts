import { createStore } from 'jotai'
import { activityAtom, virtualSessionsAtom } from './activity'
import { ActivityState } from '../state/activity'

jest.mock('../../services/api/messages', () => ({
    __esModule: true,
    default: {},
}))

describe('virtualSessionsAtom', () => {
    test('groups items into pre-session and session buckets with correct ranges', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        const activity: ActivityState = {
            schema: 2,
            data: {
                items: [
                    { id: 1, name: 'Pre A', quantity: 1, value: 10, container: 'CARRIED', timestamp: 500, source: 'inventory' },
                    { id: 2, name: 'Pre B', quantity: 1, value: 20, container: 'CARRIED', timestamp: 999, source: 'inventory' },
                    { id: 3, name: 'Session 1', quantity: 1, value: 30, container: 'CARRIED', timestamp: 1000, source: 'inventory' },
                    { id: 4, name: 'Session 1b', quantity: 1, value: 40, container: 'CARRIED', timestamp: 1500, source: 'inventory' },
                    { id: 5, name: 'Session 2', quantity: 1, value: 50, container: 'CARRIED', timestamp: 2000, source: 'inventory' },
                    { id: 6, name: 'Session 2b', quantity: 1, value: 60, container: 'CARRIED', timestamp: 2500, source: 'inventory' },
                ],
                autoActions: [],
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
                session: {
                    'session-1': ['Session 1b']
                },
                sessionAction: {},
                permanentItem: { unknown: [], hunt: [], mine: [], craft: [] },
                permanentAction: { unknown: [], hunt: [], mine: [], craft: [] }
            }
        }

        store.set(activityAtom, activity)

        // ============================================================================
        // ACT
        // ============================================================================
        const sessions = store.get(virtualSessionsAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        expect(sessions).toHaveLength(3)
        expect(sessions[0].id).toBe('session-2')
        expect(sessions[1].id).toBe('session-1')
        expect(sessions[2].id).toBe('pre-session')

        expect(sessions[0].start).toBe(2000)
        expect(sessions[0].end).toBe(Infinity)
        expect(sessions[0].delta).toBe(110)

        expect(sessions[1].start).toBe(1000)
        expect(sessions[1].end).toBe(2000)
        expect(sessions[1].delta).toBe(30)

        expect(sessions[2].start).toBe(0)
        expect(sessions[2].end).toBe(1000)
        expect(sessions[2].delta).toBe(30)
    })
})
