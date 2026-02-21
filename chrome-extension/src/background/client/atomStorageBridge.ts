import { SYNC_STORAGE, LOCAL_STORAGE } from '../../chrome/chromeStorageArea'
import { IApiStorage } from './streamDataBuilder'
import { LastRequiredState } from '../../view/application/state/last'
import { ItemsState } from '../../view/application/state/items'
import { StreamStateIn } from '../../view/application/state/stream'
import {
  STORAGE_VIEW_LAST,
  STORAGE_VIEW_ITEMS,
  STORAGE_VIEW_STREAM
} from '../../common/const'
import pako from 'pako'

/**
 * Atom Storage Bridge
 *
 * Provides IApiStorage interface for background services while state is managed by Jotai atoms.
 * This bridge reads from the same chrome.storage keys that atoms use, ensuring consistency.
 *
 * NOTE: View layer should NEVER import this - use Jotai atoms directly.
 * This is ONLY for background worker communication.
 *
 * Architecture:
 * - Atoms persist to chrome.storage using storage keys (e.g., STORAGE_VIEW_LAST)
 * - Bridge reads from the same keys that atoms write to
 * - No duplication - atoms are the source of truth
 * - Background worker gets read-only access to atom-managed state
 */
class AtomStorageBridge implements IApiStorage {
  async loadLast(): Promise<LastRequiredState> {
    const persisted = await SYNC_STORAGE.get(STORAGE_VIEW_LAST)

    // Return the persisted state with a default computed state
    // This handles the case where no data has been saved yet
    return {
      expanded: persisted?.expanded ?? false,
      sortType: persisted?.sortType ?? 0,
      showMarkup: persisted?.showMarkup ?? false,
      showActions: persisted?.showActions ?? false,
      blacklist: persisted?.blacklist ?? [],
      permanentBlacklist: persisted?.permanentBlacklist ?? [],
      peds: persisted?.peds ?? [],
      notificationsDone: persisted?.notificationsDone ?? [],
      c: {
        anyInventory: false,
        date: 0
      }
    } as LastRequiredState
  }

  async loadItems(): Promise<ItemsState> {
    const compressedState = await SYNC_STORAGE.get(STORAGE_VIEW_ITEMS)
    return this._uncompress(compressedState)
  }

  async loadStream(): Promise<StreamStateIn> {
    return await LOCAL_STORAGE.get(STORAGE_VIEW_STREAM)
  }

  /**
   * Decompresses items data that was compressed with pako deflate
   * This mirrors the compression logic in itemsStorage.ts
   */
  private _uncompress(compressed: any): any {
    if (!compressed) return compressed
    const compressedData = Buffer.from(compressed, 'base64')
    const uncompressed = pako.inflate(compressedData, { to: 'string' })
    return JSON.parse(uncompressed)
  }
}

export default new AtomStorageBridge()
