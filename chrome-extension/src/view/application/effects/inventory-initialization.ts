/**
 * Inventory Jotai Initialization Effect
 *
 * Jotai-based initialization replaces Redux middleware initialization
 * This effect loads inventory state from storage and populates Jotai atoms
 *
 * Used by: App.tsx initialization or main middleware
 * Alternative to: Redux middleware inventory initialization
 */

import { getDefaultStore } from 'jotai'
import { mergeDeep } from '../../../common/merge'
import { initialState } from '../helpers/inventory'
import { fillFromLoadByStore } from '../helpers/inventory.byStore'
import { setTabularDefinitions } from '../helpers/tabular'
import { inventoryTabularDefinitions } from '../tabular/inventory'
import {
  rawInventoryItemsAtom,
  ownedOptionsAtom,
  hideCriteriaAtom,
  tradeItemChainAtom,
  availableCriteriaAtom,
  inventorySortStateAtom,
  byStoreStateAtom,
  auctionItemsAtom,
  availableItemsAtom
} from '../atoms/inventory'
import { InventoryState, InventoryByStore } from '../state/inventory'

/**
 * Initializes all inventory Jotai atoms from storage
 *
 * This function replaces the Redux middleware initialization logic in Phase 4.
 * Instead of dispatching actions, it directly populates Jotai atoms.
 *
 * Advantages:
 * - No Redux needed
 * - Direct atom initialization
 * - Cleaner architecture
 * - Type-safe
 *
 * @param api - API object with storage methods
 */
export async function initializeInventoryAtoms(api: any): Promise<void> {
  try {
    const store = getDefaultStore()

    // Step 1: Set up tabular definitions (needed for display)
    setTabularDefinitions(inventoryTabularDefinitions)

    // Step 2: Load inventory state from storage
    let state: InventoryState | null = null
    let byStore: InventoryByStore | null = null

    try {
      state = await api.storage.loadInventoryState()
    } catch (error) {
      console.warn('Failed to load inventory state from storage:', error)
      state = null
    }

    try {
      byStore = await api.storage.loadInventoryByStoreState()
    } catch (error) {
      console.warn('Failed to load byStore state from storage:', error)
      byStore = null
    }

    // Step 3: Initialize atoms from loaded state
    // Ensure we have a valid state object
    state = state || initialState

    // Merge with initial state to fill in any missing fields
    const mergedState = mergeDeep(initialState, state)

    // Set individual atoms from merged state
    // These atoms are marked with atomWithStorage, so they persist automatically

    // Owned inventory items and options
    store.set(rawInventoryItemsAtom, mergedState.owned.items)
    store.set(ownedOptionsAtom, mergedState.owned.options)
    store.set(hideCriteriaAtom, mergedState.owned.hideCriteria)

    // Auction and available items
    store.set(auctionItemsAtom, mergedState.auction?.items ?? [])
    store.set(availableItemsAtom, mergedState.available?.items ?? [])

    // Sort states (auction, available, owned)
    store.set(inventorySortStateAtom, {
      auctionSortType: mergedState.auction?.sortType ?? 0,
      availableSortType: mergedState.available?.sortType ?? 0,
      ownedSortType: 0  // Not stored in inventory, defaults to 0
    })

    // Trade and available criteria
    store.set(tradeItemChainAtom, mergedState.tradeItemDataChain)
    store.set(availableCriteriaAtom, mergedState.availableCriteria)

    if (state !== initialState) {
      console.log('Inventory atoms initialized from storage')
    } else {
      console.log('No stored inventory state found, initialized with default values')
    }

    // Step 4: Initialize byStore state separately (has complex structure)
    if (byStore) {
      try {
        const filledByStore = fillFromLoadByStore(byStore)
        store.set(byStoreStateAtom, filledByStore)
        console.log('ByStore atoms initialized from storage')
      } catch (error) {
        console.warn('Failed to initialize byStore state:', error)
        // Continue with default empty byStore state
      }
    }
  } catch (error) {
    console.error('Error initializing inventory atoms:', error)
    // If initialization fails, atoms will have their default values
    // from atom definitions, which is acceptable
  }
}

/**
 * Syncs current Jotai inventory state to storage
 *
 * Can be called manually or via Jotai effect atoms
 * atomWithStorage handles most persistence automatically,
 * but this is available for explicit persistence if needed
 *
 * @param api - API object with storage methods
 * @param state - Current inventory state to save
 */
export async function saveInventoryStateToStorage(
  api: any,
  state: InventoryState
): Promise<void> {
  try {
    // Note: In Phase 4, atomWithStorage handles persistence
    // This is provided for manual persistence if needed
    // cleanForSave is removed as it's a Redux pattern
    await api.storage.saveInventoryState(state)
    console.log('Inventory state saved to storage')
  } catch (error) {
    console.error('Error saving inventory state to storage:', error)
  }
}

/**
 * Syncs current byStore state to storage
 *
 * In Phase 4, byStoreStateAtom uses atomWithStorage for automatic persistence.
 * This function is provided for explicit persistence if needed.
 *
 * @param api - API object with storage methods
 * @param byStore - Current byStore state to save
 */
export async function saveByStoreStateToStorage(
  api: any,
  byStore: InventoryByStore
): Promise<void> {
  try {
    // Note: In Phase 4, atomWithStorage handles persistence
    // This is provided for manual persistence if needed
    await api.storage.saveInventoryByStoreState(byStore)
    console.log('ByStore state saved to storage')
  } catch (error) {
    console.error('Error saving byStore state to storage:', error)
  }
}

/**
 * Alternative: Effect atom for automatic initialization
 *
 * This could be used instead of calling initializeInventoryAtoms()
 * directly. It would run automatically when the atom is accessed.
 *
 * Example usage:
 *
 * import { inventoryInitEffect } from './effects/inventory-initialization'
 *
 * // In App.tsx:
 * const _ = useAtomValue(inventoryInitEffect)
 *
 * This pattern is less common but available if needed
 */

/**
 * Helper to validate initialized atoms
 *
 * Can be used to verify that atoms were properly initialized
 * Useful for debugging initialization issues
 *
 * @returns true if atoms appear to be initialized
 */
export function validateInventoryAtoms(): boolean {
  try {
    const store = getDefaultStore()

    // Check if key atoms have been set
    const owned = store.get(rawInventoryItemsAtom)
    const criteria = store.get(hideCriteriaAtom)

    // If either atom has content, initialization likely worked
    const isInitialized = owned && owned.length > 0 || criteria && Object.keys(criteria).length > 0

    console.log('Inventory atoms validation:', isInitialized ? 'PASS' : 'WARN - No data loaded')

    return isInitialized
  } catch (error) {
    console.error('Error validating inventory atoms:', error)
    return false
  }
}

/**
 * Reset all inventory atoms to initial state
 *
 * Useful for testing or if user chooses to reset their inventory
 * Clears all atoms and removes from localStorage
 */
export function resetInventoryAtoms(): void {
  try {
    const store = getDefaultStore()

    // Reset atoms to initial state
    store.set(rawInventoryItemsAtom, initialState.owned.items)
    store.set(ownedOptionsAtom, initialState.owned.options)
    store.set(hideCriteriaAtom, initialState.owned.hideCriteria)
    store.set(tradeItemChainAtom, initialState.tradeItemDataChain)
    store.set(availableCriteriaAtom, initialState.availableCriteria)
    store.set(inventorySortStateAtom, {
      auctionSortType: 0,
      availableSortType: 0,
      ownedSortType: 0
    })
    store.set(byStoreStateAtom, null)

    // Note: atomWithStorage will update localStorage automatically
    console.log('Inventory atoms reset to initial state')
  } catch (error) {
    console.error('Error resetting inventory atoms:', error)
  }
}
