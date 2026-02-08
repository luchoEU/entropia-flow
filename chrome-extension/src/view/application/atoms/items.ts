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
  reduceStartMaterialEditMode,
  reduceEndMaterialEditMode,
  reduceChangeMaterialType,
  reduceChangeMaterialValue,
  reduceSetMaterialSuggestedTypes
} from '../helpers/items'
import { saveItemsToStorage, saveItemsWebCache } from './itemsStorage'
import { BlueprintWebMaterial } from '../../../web/state'
import { CLEAR_WEB_ON_LOAD } from '../../../config'
import { recalculateRefinedMaterialAtom } from './refined'
import { startItemsSheetSyncDebounce, syncItemsSheetFunc } from '../helpers/itemsSheetHelper'

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
 * Calculator state atom - stores calculator data (quantity, total, totalMU) per item
 * Derived from user input, not persisted directly (calculated from inputs)
 */
type CalculatorMap = { [itemName: string]: { quantity?: string; total?: string; totalMU?: string } }
export const itemsCalculatorMapAtom = atomWithStorage<CalculatorMap>(
  'jotai-v1-items-calculator',
  {}
)

/**
 * Compute markup multiplier from item data
 */
const getMarkupMultiplierFromItem = (itemData: ItemState | undefined): number => {
  if (!itemData) return 1
  const mu = parseFloat(itemData?.markup?.value ?? '')
  const unitMultiplier = (unit: string | undefined): number => {
    switch (unit) {
      case '/k': return 100
      case '+': return 1
      case '%': default: return 0.01
    }
  }
  return isNaN(mu) ? 1 : mu * unitMultiplier(itemData.markup.unit)
}

/**
 * Atom factory to get calculator data for a specific item (derived atom)
 */
export const getItemCalculatorAtom = (itemName: string) =>
  atom((get) => {
    const calc = get(itemsCalculatorMapAtom)[itemName]
    return {
      quantity: calc?.quantity ?? '',
      total: calc?.total ?? '',
      totalMU: calc?.totalMU ?? '',
    }
  })

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
export const setItemBuyMarkupAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const itemData = map[item]
    const markupValue = value === '' ? undefined : value

    // Update markup in item state
    const newMap = {
      ...map,
      [item]: {
        ...itemData,
        markup: { ...itemData.markup, value: markupValue, modified: new Date().toString() }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)

    // Recalculate totalMU in calculator if there's a total value
    const calcMap = get(itemsCalculatorMapAtom)
    const calc = calcMap[item]
    if (calc?.total) {
      const numValue = Number(markupValue)
      const mu = isNaN(numValue) ? 1 : numValue / 100
      const n = parseFloat(calc.total)
      if (!isNaN(n)) {
        set(itemsCalculatorMapAtom, {
          ...calcMap,
          [item]: { ...calc, totalMU: (n * mu).toFixed(2) }
        })
      }
    }

    set(triggerItemsSheetSyncAtom)
    set(recalculateRefinedMaterialAtom)
  }
)

/**
 * Change item order markup
 */
export const setItemOrderMarkupAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        refined: { ...map[item].refined, orderMarkup: value }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
    set(triggerItemsSheetSyncAtom)
    set(recalculateRefinedMaterialAtom)
  }
)

/**
 * Set markup unit (%, +, /k)
 */
export const setItemMarkupUnitAtom = atom(
  null,
  (get, set, item: string, unit: MarkupUnit) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        markup: { ...map[item].markup, unit }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
  }
)

/**
 * REFINED ATOMS (4)
 */

/**
 * Change refined buy amount
 */
export const setItemBuyAmountAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        refined: { ...map[item].refined, buyAmount: value }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
  }
)

/**
 * Change refined use amount
 */
export const setItemUseAmountAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        refined: { ...map[item].refined, useAmount: value }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
  }
)

/**
 * Change refined refine amount
 */
export const setItemRefineAmountAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        refined: { ...map[item].refined, refineAmount: value }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
  }
)

/**
 * Change refined order value
 */
export const setItemOrderValueAtom = atom(
  null,
  (get, set, item: string, value: string) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        refined: { ...map[item].refined, orderValue: value }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
  }
)

/**
 * CALCULATOR ATOMS (3)
 */

/**
 * Set calculator quantity (derived atom - computes total and totalMU)
 */
export const setItemCalculatorQuantityAtom = atom(
  null,
  (get, set, item: string, quantity: string) => {
    const itemData = get(itemsMapAtom)[item]
    const itemValue = itemData?.web?.item?.data?.value.value ?? 0
    const markupMultiplier = getMarkupMultiplierFromItem(itemData)

    const n = parseFloat(quantity)
    const calc = {
      quantity,
      total: (itemValue * n).toFixed(2),
      totalMU: (itemValue * n * markupMultiplier).toFixed(2)
    }

    const calcMap = get(itemsCalculatorMapAtom)
    set(itemsCalculatorMapAtom, { ...calcMap, [item]: calc })
  }
)

/**
 * Set calculator total (derived atom - computes quantity and totalMU)
 */
export const setItemCalculatorTotalAtom = atom(
  null,
  (get, set, item: string, total: string) => {
    const itemData = get(itemsMapAtom)[item]
    const itemValue = itemData?.web?.item?.data?.value.value ?? 0
    const markupMultiplier = getMarkupMultiplierFromItem(itemData)

    const n = parseFloat(total)
    const calc = {
      quantity: (n / itemValue).toFixed(0),
      total,
      totalMU: (n * markupMultiplier).toFixed(2)
    }

    const calcMap = get(itemsCalculatorMapAtom)
    set(itemsCalculatorMapAtom, { ...calcMap, [item]: calc })
  }
)

/**
 * Set calculator total MU (derived atom - computes quantity and total)
 */
export const setItemCalculatorTotalMUAtom = atom(
  null,
  (get, set, item: string, totalMU: string) => {
    const itemData = get(itemsMapAtom)[item]
    const itemValue = itemData?.web?.item?.data?.value.value ?? 0
    const markupMultiplier = getMarkupMultiplierFromItem(itemData)

    const n = parseFloat(totalMU)
    const calc = {
      quantity: (n / itemValue / markupMultiplier).toFixed(0),
      total: (n / markupMultiplier).toFixed(2),
      totalMU
    }

    const calcMap = get(itemsCalculatorMapAtom)
    set(itemsCalculatorMapAtom, { ...calcMap, [item]: calc })
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
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        web: { ...map[item].web, ...change }
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)

    // Side effect: Save cache to local storage
    await saveItemsWebCache(newMap)
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
export const setItemNotesAtom = atom(
  null,
  (get, set, item: string, notes: string) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        notes
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
    set(triggerItemsSheetSyncAtom)
  }
)

/**
 * Change item reserve amount
 */
export const setItemReserveAmountAtom = atom(
  null,
  (get, set, item: string, reserveAmount: string) => {
    const map = get(itemsMapAtom)
    const newMap = {
      ...map,
      [item]: {
        ...map[item],
        reserveAmount
      }
    } as ItemsMap
    set(itemsMapAtom, newMap)
    saveItemsToStorage(newMap)
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
  (get, set) => {
    // Clear existing timeout
    const existingTimeout = get(itemsSyncTimeoutAtom)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Delegate to helper with callbacks
    startItemsSheetSyncDebounce(
      (status) => set(itemsSyncStatusAtom, status),
      (time) => set(itemsDebounceTimeAtom, time),
      syncItemsSheetFunc
    )
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
 * Cache the items sheet URL when it's loaded
 * Used to open the correct sheet from ItemSyncStatus
 */
export const itemsSheetUrlAtom = atom<string | undefined>(undefined) as WritableAtom<string | undefined, [string | undefined], void>
