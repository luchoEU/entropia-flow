/**
 * Hook: useInventoryTabularSync
 *
 * Automatically syncs inventory state changes to tabular display data.
 * This hook reads Jotai atoms for inventory state and triggers Redux dispatch
 * to update tabular data whenever inventory changes.
 *
 * Purpose:
 * - Replace middleware-dependent tabular data updates
 * - Enable components to directly drive side effects
 * - Prepare for Phase 3 (optional Redux dispatch)
 *
 * Usage:
 * ```typescript
 * export function MyComponent() {
 *   const dispatch = useDispatch()
 *   useInventoryTabularSync(dispatch)
 *
 *   return <div>My component</div>
 * }
 * ```
 */

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAtomValue } from 'jotai'
import { getDefaultStore } from 'jotai'
import { updateTabularDataEffect } from '../application/effects/inventory-effects'
import { settingsAtom } from '../application/atoms/settings'
import {
  rawInventoryItemsAtom,
  ownedOptionsAtom,
  hideCriteriaAtom,
  byStoreStateAtom,
  availableCriteriaAtom,
  inventorySortStateAtom,
  itemsMapAtom
} from '../application/atoms/inventory'

/**
 * Hook that syncs inventory state to tabular display data
 *
 * @param dispatch - Redux dispatch function (from useDispatch hook)
 * @param enabled - Optional: disable the sync (default: true)
 *
 * @example
 * // In a component that displays inventory
 * function InventoryDisplay() {
 *   const dispatch = useDispatch()
 *   useInventoryTabularSync(dispatch) // Automatic sync
 *   // ...
 * }
 */
export const useInventoryTabularSync = (
  dispatch?: any,
  enabled: boolean = true
): void => {
  // Use provided dispatch or get from hook
  const componentDispatch = dispatch || useDispatch()

  // Subscribe to all inventory atoms that affect tabular data
  // When any of these change, the component will re-render and effect will run
  const rawItems = useAtomValue(rawInventoryItemsAtom)
  const ownedOptions = useAtomValue(ownedOptionsAtom)
  const hideCriteria = useAtomValue(hideCriteriaAtom)
  const byStoreState = useAtomValue(byStoreStateAtom)
  const availableCriteria = useAtomValue(availableCriteriaAtom)
  const sortState = useAtomValue(inventorySortStateAtom)

  // Effect: Update tabular data whenever inventory state changes
  useEffect(() => {
    if (!enabled || !componentDispatch) {
      return
    }

    try {
      // Get Redux state selector functions
      const getState = () => ({
        // This will be called during render, which is not ideal,
        // but necessary to maintain backward compatibility with Redux-dependent code
        // In Phase 3, we'll move to pure Jotai state
      })

      // Get Jotai store
      const jotaiStore = getDefaultStore()
      const settings = jotaiStore.get(settingsAtom)

      // For now, we need to get Redux state to build tabular data
      // This is a workaround during the transition period
      // In Phase 3, we'll have a pure Jotai version of this

      // Now using Jotai atoms for all inventory state
      // Tabular data is computed by inventoryTabularDataAtom

      // Build inventory state from Jotai atoms
      const inventoryState = {
        owned: { items: rawItems, options: ownedOptions, hideCriteria },
        byStore: byStoreState,
        availableCriteria,
        auction: {
          expanded: true,
          sortType: sortState?.auctionSortType ?? 0,
          items: [],
          stats: { count: 0, ped: '0' }
        },
        available: {
          expanded: true,
          sortType: sortState?.availableSortType ?? 0,
          items: [],
          stats: { count: 0, ped: '0' }
        }
      }

      // Trigger the effect to update tabular data
      // This now uses Jotai atoms instead of Redux selectors
      updateTabularDataEffect(
        componentDispatch,
        inventoryState,
        settings,
        jotaiStore.get(itemsMapAtom),
        jotaiStore.get(itemsMapAtom)
      )
    } catch (error) {
      console.error('Error in useInventoryTabularSync:', error)
    }

    // Re-run effect whenever any of these inventory atoms change
    // This ensures tabular data stays in sync with inventory state
  }, [rawItems, ownedOptions, hideCriteria, byStoreState, availableCriteria, sortState, enabled, componentDispatch])
}

/**
 * Alternative: Simpler version that just triggers side effect
 *
 * This version is a placeholder for Phase 3 when we have a computed Jotai atom
 * that generates tabular data, making this hook much simpler.
 */
export const useInventoryTabularSyncSimple = (dispatch?: any): void => {
  const componentDispatch = dispatch || useDispatch()

  // In Phase 3, this will be:
  // const tabularData = useAtomValue(inventoryTabularDataAtom)
  // useEffect(() => {
  //   dispatch(setTabularData(tabularData))
  // }, [tabularData, dispatch])

  // For now, just read atoms to trigger Jotai computations
  useAtomValue(rawInventoryItemsAtom)
  useAtomValue(hideCriteriaAtom)
  useAtomValue(byStoreStateAtom)
}

export default useInventoryTabularSync
