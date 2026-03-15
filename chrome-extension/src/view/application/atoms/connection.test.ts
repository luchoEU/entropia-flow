import { createStore } from 'jotai'
import { connectionAtom, restoreConnectionWebSocketAtom, setConnectionWebSocketAtom } from './connection'

const mockSetWebSocketUrl = jest.fn()

jest.mock('../../services/api/messages', () => ({
    __esModule: true,
    default: {
        setWebSocketUrl: (...args: any[]) => mockSetWebSocketUrl(...args)
    }
}))

describe('connection atoms', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('restoreConnectionWebSocketAtom updates URL without calling messages API', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()

        // ============================================================================
        // ACT
        // ============================================================================
        store.set(restoreConnectionWebSocketAtom, 'ws://restored:9999')

        // ============================================================================
        // ASSERT
        // ============================================================================
        const state = store.get(connectionAtom)
        expect(state.client.webSocket).toBe('ws://restored:9999')
        expect(mockSetWebSocketUrl).not.toHaveBeenCalled()
    })

    test('setConnectionWebSocketAtom updates URL AND calls messages API', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()

        // ============================================================================
        // ACT
        // ============================================================================
        store.set(setConnectionWebSocketAtom, 'ws://new-url:1234')

        // ============================================================================
        // ASSERT
        // ============================================================================
        const state = store.get(connectionAtom)
        expect(state.client.webSocket).toBe('ws://new-url:1234')
        expect(mockSetWebSocketUrl).toHaveBeenCalledWith('ws://new-url:1234')
    })

    test('restoreConnectionWebSocketAtom skips update when URL is same', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        store.set(restoreConnectionWebSocketAtom, 'ws://same:5555')
        const stateBefore = store.get(connectionAtom)

        // ============================================================================
        // ACT
        // ============================================================================
        store.set(restoreConnectionWebSocketAtom, 'ws://same:5555')

        // ============================================================================
        // ASSERT
        // ============================================================================
        const stateAfter = store.get(connectionAtom)
        expect(stateAfter).toBe(stateBefore)
    })
})
