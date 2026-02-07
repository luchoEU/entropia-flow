/**
 * Inventory Jotai Utilities
 *
 * Helper functions for managing Jotai inventory atoms
 */

import { getDefaultStore } from 'jotai'
import { initialState } from '../helpers/inventory'
import {
  rawInventoryItemsAtom,
  ownedOptionsAtom,
  hideCriteriaAtom,
  tradeItemChainAtom,
  availableCriteriaAtom,
  inventorySortStateAtom,
  byStoreContainersAtom,
  byStoreStaredExpandedAtom,
  byStoreMaterialExpandedAtom
} from '../atoms/inventory'

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

    // Reset byStore user preferences
    store.set(byStoreContainersAtom, {})
    store.set(byStoreStaredExpandedAtom, [])
    store.set(byStoreMaterialExpandedAtom, [])

    // Note: byStoreStateAtom is a derived atom and will automatically recompute
    // from rawInventoryItemsAtom and the persistent preference atoms
    // Note: auctionItemsAtom and availableItemsAtom are derived atoms and will
    // automatically recompute from rawInventoryItemsAtom, so we don't reset them directly

    // atomWithStorage atoms will update localStorage automatically
    console.log('Inventory atoms reset to initial state')
  } catch (error) {
    console.error('Error resetting inventory atoms:', error)
  }
}
