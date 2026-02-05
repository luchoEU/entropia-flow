/**
 * Inventory Side Effects Module
 *
 * Extracted side effect handlers that are called from middleware.
 * These can be reused by Jotai effects or directly by components.
 *
 * Benefits:
 * - Side effects are testable independently
 * - Clear separation of concerns
 * - Can be called from middleware, components, or effects
 * - Easier to understand and maintain
 */

import { InventoryByStore, InventoryState } from '../state/inventory'
import { ItemsMap } from '../state/items'
import { SettingsState } from '../state/settings'
import { TTServiceState } from '../state/ttService'
import { inventoryTabularData } from '../tabular/inventory'
import { cleanForSaveByStore } from '../helpers/inventory.byStore'
import { getDefaultStore } from 'jotai'
import {
  rawInventoryItemsAtom,
  ownedOptionsAtom,
  hideCriteriaAtom,
  tradeItemChainAtom,
  availableCriteriaAtom,
  inventorySortStateAtom,
  byStoreStateAtom
} from '../atoms/inventory'
import { itemsMapAtom } from '../atoms/items'

/**
 * Effect: Update tabular display data
 *
 * Generates formatted display data for SortableTableSection based on current inventory state.
 * This is called whenever inventory state changes (sorting, filtering, hiding, etc.)
 *
 * @param dispatch - Redux dispatch function
 * @param state - Current inventory state
 * @param settings - Settings state
 * @param items - Items map
 * @param ttService - TT Service state
 */
export const updateTabularDataEffect = (
  dispatch: (action: any) => void,
  state: InventoryState,
  settings: SettingsState,
  items: ItemsMap,
  ttService: TTServiceState
): void => {
  try {
    // Import setTabularData here to avoid circular dependencies
    const { setTabularData } = require('../actions/tabular')

    const tabularData = inventoryTabularData(state, settings, items, ttService)
    dispatch(setTabularData(tabularData))
  } catch (error) {
    console.error('Error updating tabular data:', error)
  }
}

/**
 * Effect: Synchronize Redux inventory state to Jotai atoms
 *
 * Keeps Jotai atoms in sync with Redux state during transition period.
 * Once components are fully Jotai-based, this becomes less critical.
 *
 * @param getState - Redux getState function
 */
export const syncReduxToJotaiEffect = (getState: () => any): void => {
  try {
    const { getInventory } = require('../selectors/inventory')

    const state: InventoryState = getInventory(getState())
    const jotaiStore = getDefaultStore()
    const items: ItemsMap = jotaiStore.get(itemsMapAtom)

    // Sync owned items
    if (state?.owned?.items) {
      jotaiStore.set(rawInventoryItemsAtom, state.owned.items)
    }

    // Sync owned options
    if (state?.owned?.options) {
      jotaiStore.set(ownedOptionsAtom, state.owned.options)
    }

    // Sync hide criteria
    if (state?.owned?.hideCriteria) {
      jotaiStore.set(hideCriteriaAtom, state.owned.hideCriteria)
    }

    // Sync trade item chain
    if (state?.tradeItemDataChain !== undefined) {
      jotaiStore.set(tradeItemChainAtom, state.tradeItemDataChain)
    }

    // Sync available criteria (favorites)
    if (state?.availableCriteria) {
      jotaiStore.set(availableCriteriaAtom, state.availableCriteria)
    }

    // Sync sort state
    if (state?.auction || state?.available) {
      jotaiStore.set(inventorySortStateAtom, {
        auctionSortType: state?.auction?.sortType ?? 0,
        availableSortType: state?.available?.sortType ?? 0,
        ownedSortType: state?.owned?.items ? 0 : 0
      })
    }

    // Sync byStore state
    if (state?.byStore) {
      jotaiStore.set(byStoreStateAtom, state.byStore)
    }

    // Sync items map
    if (items) {
      jotaiStore.set(itemsMapAtom, items)
    }
  } catch (error) {
    console.error('Error syncing Redux to Jotai:', error)
  }
}

/**
 * Effect: Persist byStore state to browser storage
 *
 * Saves the byStore tree state to persistent storage via the API.
 * Called after any byStore operation (expand, filter, edit, etc.)
 *
 * @param api - API service object with storage methods
 * @param state - ByStore state to persist
 */
export const persistByStoreStateEffect = async (
  api: any,
  state: InventoryByStore
): Promise<void> => {
  try {
    await api.storage.saveInventoryByStoreState(cleanForSaveByStore(state))
  } catch (error) {
    console.error('Error persisting byStore state:', error)
  }
}

/**
 * Effect: Handle trade item data loading
 *
 * Loads trade item data and triggers blueprint loading if needed.
 * Related to trading feature functionality.
 *
 * @param dispatch - Redux dispatch function
 * @param chainData - Trade item data chain
 * @param itemsMap - Items map for usage data lookup
 * @param getState - Redux getState function
 */
export const handleTradeItemDataEffect = (
  dispatch: (action: any) => void,
  chainData: any[],
  itemsMap: ItemsMap,
  getState: () => any
): void => {
  try {
    const { loadItemUsageData } = require('../actions/items')
    const { getItem } = require('../selectors/items')

    if (!chainData) return

    // Load item usage data for each item in chain if not already loaded
    chainData.forEach((item: any) => {
      if (!item?.c) return // Skip if no container

      const itemState = getItem(item.name)(getState())
      const hasUsage = itemState?.web?.usage

      if (!hasUsage) {
        dispatch(loadItemUsageData(item.name))
      }
    })
  } catch (error) {
    console.error('Error handling trade item data:', error)
  }
}

/**
 * Effect: Trigger all necessary side effects for inventory mutations
 *
 * Convenience function that triggers all standard side effects.
 * Used by middleware to handle complex mutations with multiple side effects.
 *
 * @param config - Configuration object with dispatch, getState, api, state references
 */
export const triggerInventoryMutationEffects = (
  config: {
    dispatch: (action: any) => void
    getState: () => any
    api: any
    shouldUpdateTabular?: boolean
    shouldSyncJotai?: boolean
    shouldPersistByStore?: boolean
  }
): void => {
  const {
    dispatch,
    getState,
    api,
    shouldUpdateTabular = true,
    shouldSyncJotai = true,
    shouldPersistByStore = true
  } = config

  // Sync Redux to Jotai first (so derived atoms are up-to-date)
  if (shouldSyncJotai) {
    syncReduxToJotaiEffect(getState)
  }

  // Update tabular display data
  if (shouldUpdateTabular) {
    try {
      const { getInventory } = require('../selectors/inventory')
      const { getTTService } = require('../selectors/ttService')
      const { settingsAtom } = require('../atoms/settings')

      const jotaiStore = getDefaultStore()
      const state: InventoryState = getInventory(getState())
      const settings: SettingsState = jotaiStore.get(settingsAtom)
      const items: ItemsMap = jotaiStore.get(itemsMapAtom)
      const ttService: TTServiceState = getTTService(getState())

      updateTabularDataEffect(dispatch, state, settings, items, ttService)
    } catch (error) {
      console.error('Error triggering tabular data effect:', error)
    }
  }

  // Persist byStore state if it changed
  if (shouldPersistByStore) {
    try {
      const { getInventory } = require('../selectors/inventory')
      const state: InventoryState = getInventory(getState())
      if (state?.byStore) {
        persistByStoreStateEffect(api, state.byStore)
      }
    } catch (error) {
      console.error('Error persisting byStore state:', error)
    }
  }
}

/**
 * Export all effects for testing
 */
export const inventoryEffects = {
  updateTabularDataEffect,
  syncReduxToJotaiEffect,
  persistByStoreStateEffect,
  handleTradeItemDataEffect,
  triggerInventoryMutationEffects
}
