import { refinedInitialMap, cleanForSaveMain, cleanForSaveCache } from '../helpers/items'
import { SYNC_STORAGE, LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { STORAGE_VIEW_ITEMS } from '../../../common/const'
import { mergeDeep } from '../../../common/merge'
import { ItemsMap } from '../state/items'
import pako from 'pako'

// Initialize items with defaults
export let itemsCache: ItemsMap = JSON.parse(JSON.stringify(refinedInitialMap))
let isInitialized = false

/**
 * Compression/decompression utilities for items storage
 * Uses pako deflate for efficient storage quota usage
 */
function _compress(json: object): string {
  const jsonString = JSON.stringify(json)
  const compressed = pako.deflate(jsonString, { to: 'string' })
  return Buffer.from(compressed).toString('base64')
}

function _uncompress(compressed: any): any {
  if (!compressed) return compressed
  const compressedData = Buffer.from(compressed, 'base64')
  const uncompressed = pako.inflate(compressedData, { to: 'string' })
  return JSON.parse(uncompressed)
}

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
    // Load main state (compressed in SYNC_STORAGE)
    const compressedMainState = await SYNC_STORAGE.get(STORAGE_VIEW_ITEMS)
    const mainState = _uncompress(compressedMainState)

    // Load cache state (uncompressed in LOCAL_STORAGE)
    const cacheState = await LOCAL_STORAGE.get(STORAGE_VIEW_ITEMS)

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
    // Save main state (without web data) - compressed in SYNC_STORAGE
    const mainState = cleanForSaveMain({ map: itemsMap })
    const compressedMainState = _compress(mainState)
    await SYNC_STORAGE.set(STORAGE_VIEW_ITEMS, compressedMainState)

    // Also save web cache for faster reloads - uncompressed in LOCAL_STORAGE
    const cacheState = cleanForSaveCache({ map: itemsMap })
    await LOCAL_STORAGE.set(STORAGE_VIEW_ITEMS, cacheState)
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
    await LOCAL_STORAGE.set(STORAGE_VIEW_ITEMS, cacheState)
  } catch (error) {
    console.error('Failed to save items web cache:', error)
  }
}
