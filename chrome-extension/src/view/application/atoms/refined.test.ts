import { createStore } from 'jotai'
import { refinedMapAtom, setRefinedValueAtom, initializeRefinedAtom } from './refined'

// Mock STORAGE_VIEW_REFINED and LOCAL_STORAGE
const mockStorage: Record<string, any> = {}
jest.mock('../../../chrome/chromeStorageArea', () => ({
  LOCAL_STORAGE: {
    get: jest.fn(async (key: string) => mockStorage[key]),
    set: jest.fn(async (key: string, val: any) => { mockStorage[key] = val }),
    remove: jest.fn(async (key: string) => { delete mockStorage[key] }),
    clear: jest.fn(async () => { for (const k in mockStorage) delete mockStorage[k] })
  },
  SYNC_STORAGE: {
    get: jest.fn(async (key: string) => mockStorage[key]),
    set: jest.fn(async (key: string, val: any) => { mockStorage[key] = val }),
    remove: jest.fn(async (key: string) => { delete mockStorage[key] }),
    clear: jest.fn(async () => { for (const k in mockStorage) delete mockStorage[k] })
  }
}))

const REFINED_ME = 'Mind Essence'

describe('Refined atoms - persistence', () => {
    beforeEach(() => {
        // Clear simulated storage
        for (const k in mockStorage) {
            delete mockStorage[k]
        }
        jest.clearAllMocks()
    })

    test('reproduces the bug: value is lost/reset to default on refresh when storage is empty', () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // Start with a clean store representing a fresh load
        const store = createStore()

        // ============================================================================
        // ACT
        // ============================================================================
        // Read the state directly (mimics a page refresh without loading from storage)
        const state = store.get(refinedMapAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // Passes when the bug exists: the value is default '120'
        expect(state.map[REFINED_ME].calculator.in.value).toBe('120')
    })

    test('asserts the correct behavior: value is preserved on refresh when storage is loaded', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        // 1. In a first session, we change the value to '150'
        const store = createStore()
        store.set(setRefinedValueAtom, REFINED_ME, '150')

        // ============================================================================
        // ACT
        // ============================================================================
        // 2. We simulate a refresh by creating a new store and initializing it
        const newStore = createStore()
        await newStore.set(initializeRefinedAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // Fails before the fix (returns '120' instead of '150'), but passes after the fix
        const state = newStore.get(refinedMapAtom)
        expect(state.map[REFINED_ME].calculator.in.value).toBe('150')
    })
})
