import { createStore } from 'jotai'
import { lastPersistedAtom, resetHunterSessionAtom, undoResetHunterSessionAtom } from './last'

// Mock STORAGE_VIEW_LAST and LOCAL_STORAGE/SYNC_STORAGE
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

const mockRequestSetLast = jest.fn()
const mockRestoreGameLog = jest.fn()
jest.mock('../../services/api/messages', () => ({
  __esModule: true,
  default: {
    requestSetLast: (...args: any[]) => mockRequestSetLast(...args),
    restoreGameLog: (...args: any[]) => mockRestoreGameLog(...args)
  }
}))

describe('last atoms - session reset', () => {
    beforeEach(() => {
        // Clear simulated storage
        for (const k in mockStorage) {
            delete mockStorage[k]
        }
        jest.clearAllMocks()
    })

    test('asserts the correct behavior: blacklist is preserved on Reset Session', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        // Setup state with an item in the blacklist
        store.set(lastPersistedAtom, {
            ...store.get(lastPersistedAtom),
            blacklist: ['Ammo', 'Weapon']
        })

        // ============================================================================
        // ACT
        // ============================================================================
        // Trigger session reset
        await store.set(resetHunterSessionAtom)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // The blacklist should be preserved
        const state = store.get(lastPersistedAtom)
        expect(state.blacklist).toEqual(['Ammo', 'Weapon'])
    })

    test('asserts the correct behavior: undoing Reset Session restores the previous blacklist', async () => {
        // ============================================================================
        // ARRANGE
        // ============================================================================
        const store = createStore()
        // Setup state with an item in the blacklist
        store.set(lastPersistedAtom, {
            ...store.get(lastPersistedAtom),
            blacklist: ['Ammo', 'Weapon']
        })
        const snapshot = await store.set(resetHunterSessionAtom)

        // Modify the blacklist to simulate further user actions
        store.set(lastPersistedAtom, {
            ...store.get(lastPersistedAtom),
            blacklist: ['DifferentItem']
        })

        // ============================================================================
        // ACT
        // ============================================================================
        // Trigger undo
        await store.set(undoResetHunterSessionAtom, snapshot)

        // ============================================================================
        // ASSERT
        // ============================================================================
        // The blacklist should be restored to its original value
        const state = store.get(lastPersistedAtom)
        expect(state.blacklist).toEqual(['Ammo', 'Weapon'])
    })
})
