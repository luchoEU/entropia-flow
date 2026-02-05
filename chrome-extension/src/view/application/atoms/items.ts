import { Atom, atom, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  ItemsMap,
  ItemsState,
  ItemState,
  MarkupUnit,
  ItemStateWebData
} from '../state/items'
import {
  refinedInitialMap,
  cleanWeb,
  reduceItemBuyMarkupChanged,
  reduceItemOrderMarkupChanged,
  reduceSetItemMarkupUnit,
  reduceItemBuyAmountChanged,
  reduceItemUseAmountChanged,
  reduceItemRefineAmountChanged,
  reduceItemOrderValueChanged,
  reduceItemNotesValueChanged,
  reduceItemReserveValueChanged,
  reduceSetItemPartialWebData,
  reduceSetItemCalculatorQuantity,
  reduceSetItemCalculatorTotal,
  reduceSetItemCalculatorTotalMU,
  reduceStartMaterialEditMode,
  reduceEndMaterialEditMode,
  reduceChangeMaterialType,
  reduceChangeMaterialValue,
  reduceSetMaterialSuggestedTypes,
  reduceSetState
} from '../helpers/items'
import { saveItemsToStorage, saveItemsWebCache } from './itemsStorage'
import { BlueprintWebMaterial } from '../../../web/state'
import { CLEAR_WEB_ON_LOAD } from '../../../config'

/**
 * Base atom for items map - writable atom
 * Persistence handled by write atoms calling saveItemsToStorage
 */
export const itemsMapAtom = atom<ItemsMap>(
  JSON.parse(JSON.stringify(refinedInitialMap))
) as WritableAtom<ItemsMap, [ItemsMap], void>

/**
 * Edit mode material name atom - which item is currently being edited
 */
export const editModeMaterialNameAtom = atomWithStorage<string | undefined>(
  'jotai-v1-items-editModeMaterialName',
  undefined
)

/**
 * Atom factory to get a single item by name
 */
export const getItemAtom = (itemName: string): Atom<ItemState | undefined> =>
  atom<ItemState | undefined>((get) => get(itemsMapAtom)[itemName])

/**
 * ============================================================================
 * WRITE ATOMS - All 20 Redux actions converted to Jotai write atoms
 * ============================================================================
 */

/**
 * Set entire items state (used during initialization)
 */
export const setItemsStateAtom = atom(
  null,
  (get, set, newState: ItemsState) => {
    set(itemsMapAtom, newState.map)
    set(editModeMaterialNameAtom, newState.editModeMaterialName)
    saveItemsToStorage(newState.map)
  }
)

/**
 * MARKUP ATOMS (3)
 */

/**
 * Change item buy markup
 */
export const itemBuyMarkupChangedAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemBuyMarkupChanged({ map }, item, value)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
    set(triggerItemsSheetSyncAtom)
  }
)

/**
 * Change item order markup
 */
export const itemOrderMarkupChangedAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemOrderMarkupChanged({ map }, item, value)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
    set(triggerItemsSheetSyncAtom)
  }
)

/**
 * Set markup unit (%, +, /k)
 */
export const setItemMarkupUnitAtom = atom(
  null,
  (get, set, item: string, unit: MarkupUnit) => {
    const map = get(itemsMapAtom)
    const newState = reduceSetItemMarkupUnit({ map }, item, unit)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * REFINED ATOMS (4)
 */

/**
 * Change refined buy amount
 */
export const itemBuyAmountChangedAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemBuyAmountChanged({ map }, item, value)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * Change refined use amount
 */
export const itemUseAmountChangedAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemUseAmountChanged({ map }, item, value)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * Change refined refine amount
 */
export const itemRefineAmountChangedAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemRefineAmountChanged({ map }, item, value)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * Change refined order value
 */
export const itemOrderValueChangedAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemOrderValueChanged({ map }, item, value)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * CALCULATOR ATOMS (3)
 */

/**
 * Set calculator quantity
 */
export const setItemCalculatorQuantityAtom = atom(
  null,
  (get, set, item: string, quantity: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceSetItemCalculatorQuantity({ map }, item, quantity)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * Set calculator total
 */
export const setItemCalculatorTotalAtom = atom(
  null,
  (get, set, item: string, total: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceSetItemCalculatorTotal({ map }, item, total)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * Set calculator total MU
 */
export const setItemCalculatorTotalMUAtom = atom(
  null,
  (get, set, item: string, totalMU: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceSetItemCalculatorTotalMU({ map }, item, totalMU)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * EDIT MODE ATOMS (5)
 */

/**
 * Start material edit mode
 */
export const startMaterialEditModeAtom = atom(
  null,
  (get, set, item: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceStartMaterialEditMode({ map, editModeMaterialName: undefined }, item)
    set(itemsMapAtom, newState.map)
    set(editModeMaterialNameAtom, item)
    saveItemsToStorage(newState.map)
  }
)

/**
 * End material edit mode
 */
export const endMaterialEditModeAtom = atom(
  null,
  (get, set) => {
    const map = get(itemsMapAtom)
    const editModeMaterialName = get(editModeMaterialNameAtom)
    const newState = reduceEndMaterialEditMode({ map, editModeMaterialName })
    set(itemsMapAtom, newState.map)
    set(editModeMaterialNameAtom, undefined)
    saveItemsToStorage(newState.map)
  }
)

/**
 * Change material type (with auto-suggest side effect)
 */
export const changeMaterialTypeAtom = atom(
  null,
  (get, set, item: string, type: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceChangeMaterialType({ map }, item, type)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)

    // Side effect: Auto-suggest types from existing items
    const allTypes = Object.values(newState.map)
      .map(m => m.web?.item?.data?.value.type?.toString())
      .filter((t): t is string => t !== undefined && t !== '')
    const uniqueTypes = Array.from(new Set(allTypes))
      .filter(t => t.startsWith(type))
      .sort()

    set(setMaterialSuggestedTypesAtom, item, uniqueTypes)
  }
)

/**
 * Change material value
 */
export const changeMaterialValueAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceChangeMaterialValue({ map }, item, value)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * Set material suggested types
 */
export const setMaterialSuggestedTypesAtom = atom(
  null,
  (get, set, item: string, types: string[]) => {
    const map = get(itemsMapAtom)
    const newState = reduceSetMaterialSuggestedTypes({ map }, item, types)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
  }
)

/**
 * WEB DATA ATOMS (4)
 */

/**
 * Set partial web data
 */
export const setItemPartialWebDataAtom = atom(
  null,
  async (get, set, item: string, change: Partial<ItemStateWebData>) => {
    const map = get(itemsMapAtom)
    const newState = reduceSetItemPartialWebData({ map }, item, change)
    set(itemsMapAtom, newState.map)

    // Side effect: Save cache to local storage
    await saveItemsWebCache(newState.map)
  }
)

/**
 * Load item data from web
 */
export const loadItemDataAtom = atom(
  null,
  async (get, set, item: string, bpMaterial?: BlueprintWebMaterial) => {
    try {
      const { loadFromWeb } = await import('../../../web/loader')
      for await (const r of loadFromWeb(s => s.loadItem(item, bpMaterial))) {
        set(setItemPartialWebDataAtom, item, { item: r })
      }
    } catch (error) {
      console.error(`Failed to load item data for ${item}:`, error)
    }
  }
)

/**
 * Load raw materials from web
 */
export const loadItemRawMaterialsAtom = atom(
  null,
  async (get, set, item: string) => {
    try {
      const { loadFromWeb } = await import('../../../web/loader')
      for await (const r of loadFromWeb(s => s.loadRawMaterials(item))) {
        set(setItemPartialWebDataAtom, item, { rawMaterials: r })
      }
    } catch (error) {
      console.error(`Failed to load raw materials for ${item}:`, error)
    }
  }
)

/**
 * Load item usage data from web
 */
export const loadItemUsageDataAtom = atom(
  null,
  async (get, set, item: string) => {
    try {
      const { loadFromWeb } = await import('../../../web/loader')
      for await (const r of loadFromWeb(s => s.loadUsage(item))) {
        set(setItemPartialWebDataAtom, item, { usage: r })
      }
    } catch (error) {
      console.error(`Failed to load usage data for ${item}:`, error)
    }
  }
)

/**
 * SIMPLE FIELD ATOMS (2)
 */

/**
 * Change item notes
 */
export const itemNotesValueChangedAtom = atom(
  null,
  (get, set, item: string, notes: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemNotesValueChanged({ map }, item, notes)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
    set(triggerItemsSheetSyncAtom)
  }
)

/**
 * Change item reserve amount
 */
export const itemReserveValueChangedAtom = atom(
  null,
  (get, set, item: string, reserveAmount: string) => {
    const map = get(itemsMapAtom)
    const newState = reduceItemReserveValueChanged({ map }, item, reserveAmount)
    set(itemsMapAtom, newState.map)
    saveItemsToStorage(newState.map)
    set(triggerItemsSheetSyncAtom)
  }
)

/**
 * ============================================================================
 * INITIALIZATION
 * ============================================================================
 */

/**
 * Initialize items state on app startup
 */
export const initializeItemsStateAtom = atom(
  null,
  async (get, set) => {
    try {
      // Import here to avoid circular dependencies
      const { initializeItemsCache } = await import('./itemsStorage')

      // Load items from storage
      const loadedMap = await initializeItemsCache()

      // Update atom with loaded state
      set(itemsMapAtom, loadedMap)

      // Handle CLEAR_WEB_ON_LOAD flag if needed
      if (CLEAR_WEB_ON_LOAD) {
        const cleaned = cleanWeb({ map: loadedMap })
        set(itemsMapAtom, cleaned.map)
        await saveItemsToStorage(cleaned.map)
      }

      console.log('Items initialized with', Object.keys(loadedMap).length, 'items')
    } catch (error) {
      console.error('Failed to initialize items:', error)
    }
  }
)

/**
 * ============================================================================
 * GOOGLE SHEETS SYNC (DEBOUNCED)
 * ============================================================================
 */

/**
 * Atom to track debounce timeout for items sheet sync
 * Stored as a primitive atom with read+write capability
 */
export const itemsSyncTimeoutAtom = atom<any>(
  undefined
) as WritableAtom<any, [any], void>

/**
 * Trigger debounced sync to Google Sheets
 * This sets a timeout that will sync items to the sheet after DEBOUNCE_MS with no changes
 */
export const triggerItemsSheetSyncAtom = atom(
  null,
  async (get, set) => {
    // Clear existing timeout
    const existingTimeout = get(itemsSyncTimeoutAtom)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Import here to avoid circular dependencies
    const { startItemsSheetSyncDebounce } = await import('../helpers/itemsSheetHelper')

    // Delegate to helper which manages the debounce and countdown
    await startItemsSheetSyncDebounce(set, setItemsSyncStatusAtom, setItemsDebounceTimeAtom)
  }
)

/**
 * Manually reload items from Google Sheet
 */
export const reloadItemsFromSheetAtom = atom(
  null,
  async (get, set) => {
    try {
      // Import here to avoid circular dependencies
      const { reloadItemsSheetFunc } = await import('../helpers/itemsSheetHelper')
      await reloadItemsSheetFunc()
    } catch (error) {
      console.error('Failed to reload items from sheet:', error)
      throw error
    }
  }
)

/**
 * ============================================================================
 * SYNC STATUS TRACKING
 * ============================================================================
 */

/**
 * Track sync status: 'idle' | 'pending' | 'syncing' | 'error'
 * Used to display save status indicators
 */
export const itemsSyncStatusAtom = atom<'idle' | 'pending' | 'syncing' | 'error'>('idle')

/**
 * Track remaining debounce time in milliseconds
 * Used to display countdown timer
 */
export const itemsDebounceTimeAtom = atom<number>(0)

/**
 * Update sync status
 */
export const setItemsSyncStatusAtom = atom(
  null,
  (get, set, status: 'idle' | 'pending' | 'syncing' | 'error') => {
    set(itemsSyncStatusAtom, status)
  }
)

/**
 * Update debounce countdown time
 */
export const setItemsDebounceTimeAtom = atom(
  null,
  (get, set, time: number) => {
    set(itemsDebounceTimeAtom, time)
  }
)
