import { atomWithStorage } from 'jotai/utils'

export type SelectedStorage = 'sync' | 'local'

/**
 * Raw Storage Page UI Preferences
 *
 * Persists the user's preferences when viewing raw chrome storage:
 * - Selected storage type (sync or local)
 * - Expanded key paths in the tree view
 * - Search query for filtering keys
 *
 * This improves UX by remembering the user's state when they navigate away and back.
 *
 * Note: expandedKeys is stored as an array for JSON serialization.
 */
export const rawStoragePreferencesAtom = atomWithStorage(
  'jotai-v1-rawstorage-preferences',
  {
    selectedStorage: 'sync' as SelectedStorage,
    expandedKeys: [] as string[],
    searchQuery: ''
  }
)
