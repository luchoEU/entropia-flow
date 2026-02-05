import { refinedInitialMap, cleanForSaveMain, cleanForSaveCache } from '../helpers/items'
import storageApi from '../../services/api/storage'
import { mergeDeep } from '../../../common/merge'
import { ItemsMap } from '../state/items'

// Initialize items with defaults
export let itemsCache: ItemsMap = JSON.parse(JSON.stringify(refinedInitialMap))
let isInitialized = false

/**
 * Synchronous storage interface for atomWithStorage
 * Uses itemsCache for sync reads, async updates in background
 */
export const itemsMapStorage = {
  getItem: (): ItemsMap => {
    return itemsCache
  },
  setItem: (value: ItemsMap): void => {
    itemsCache = value
    // Schedule async save in background (fire and forget)
    saveItemsToStorageAsync(value).catch(err =>
      console.error('Failed to save items in background:', err)
    )
  },
  removeItem: (): void => {
    // Not used
  }
}

/**
 * Load items from storage and initialize cache
 * Call this early in app initialization
 */
export async function initializeItemsCache(): Promise<ItemsMap> {
  if (isInitialized) {
    return itemsCache
  }

  try {
    const mainState = await storageApi.loadItems()
    const cacheState = await storageApi.loadItemsCache()

    let merged = JSON.parse(JSON.stringify(refinedInitialMap))

    if (mainState?.map) {
      merged = mergeDeep(merged, mainState.map)
    }

    if (cacheState?.map) {
      merged = mergeDeep(merged, cacheState.map)
    }

    itemsCache = merged
    isInitialized = true
    return itemsCache
  } catch (error) {
    console.error('Failed to initialize items cache:', error)
    return itemsCache
  }
}

/**
 * Async save (internal use)
 */
async function saveItemsToStorageAsync(itemsMap: ItemsMap): Promise<void> {
  try {
    // Save main state (without web data)
    const mainState = cleanForSaveMain({ map: itemsMap })
    await storageApi.saveItems(mainState)

    // Also save web cache for faster reloads
    const cacheState = cleanForSaveCache({ map: itemsMap })
    await storageApi.saveItemsCache(cacheState)
  } catch (error) {
    console.error('Failed to save items to storage:', error)
  }
}

/**
 * Save items state to storage (synchronous wrapper)
 */
export function saveItemsToStorage(itemsMap: ItemsMap): void {
  itemsCache = itemsMap
  itemsMapStorage.setItem(itemsMap)
}

/**
 * Save only the web cache portion to local storage
 * Useful when web data is loaded incrementally
 */
export async function saveItemsWebCache(itemsMap: ItemsMap): Promise<void> {
  try {
    itemsCache = itemsMap
    const cacheState = cleanForSaveCache({ map: itemsMap })
    await storageApi.saveItemsCache(cacheState)
  } catch (error) {
    console.error('Failed to save items web cache:', error)
  }
}
