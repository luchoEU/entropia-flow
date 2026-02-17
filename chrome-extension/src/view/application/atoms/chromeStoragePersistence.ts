import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'

/**
 * Generic helpers for persisting atom state to Chrome storage
 * Provides consistent pattern across all atoms that need persistence
 */

export const createStorageHelpers = <T>(storageKey: string) => ({
  save: async (state: T) => {
    await LOCAL_STORAGE.set(storageKey, state)
  },
  load: async (): Promise<T | null> => {
    return await LOCAL_STORAGE.get(storageKey)
  }
})
