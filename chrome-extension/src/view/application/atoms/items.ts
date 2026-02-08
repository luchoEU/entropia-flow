import { Atom, atom, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  ItemsMap,
  ItemsState,
  ItemState,
  MarkupUnit,
  ItemStateWebData
} from '../state/items'
import { BlueprintData } from '../state/craft'
import {
  refinedInitialMap,
  cleanWeb,
  reduceStartMaterialEditMode,
  reduceEndMaterialEditMode,
  reduceChangeMaterialType,
  reduceChangeMaterialValue,
  reduceSetMaterialSuggestedTypes
} from '../helpers/items'
import { compress, uncompress } from './compressionUtils'
import { SYNC_STORAGE, LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { STORAGE_VIEW_ITEMS } from '../../../common/const'
import { mergeDeep } from '../../../common/merge'
import { cleanForSaveMain, cleanForSaveCache } from '../helpers/items'
import { BlueprintWebMaterial, ItemWebData, ItemUsageWebData, BlueprintWebData } from '../../../web/state'
import { CLEAR_WEB_ON_LOAD } from '../../../config'
import { recalculateRefinedMaterialAtom } from './refined'
import { WebLoadResponse } from '../../../web/loader'
import sheetsApi from '../../services/api/sheets/sheets'
import { syncItemsToSheet, reloadItemsFromSheet, ItemsSheetInterfaceCallbacks } from '../helpers/itemsSheetSynchronization'
import { IWebSource, SourceLoadResponse } from '../../../web/sources'
import { blueprintsAtom, staredAtom } from './craft'
import { rawInventoryItemsAtom } from './inventory'
import { settingsAtom } from './settings'

// Cached storage data - initialized asynchronously on app startup
let cachedItemsData = JSON.parse(JSON.stringify(refinedInitialMap))
let initPromise: Promise<void> | null = null

/**
 * Initialize items from storage
 * Called on app startup to load persisted data
 */
export async function initializeItemsFromStorage(): Promise<void> {
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      // Load main state (compressed in SYNC_STORAGE)
      const compressedMainState = await SYNC_STORAGE.get(STORAGE_VIEW_ITEMS)
      const mainState = compressedMainState ? uncompress(compressedMainState) : null

      // Load cache state (uncompressed in LOCAL_STORAGE)
      const cacheState = await LOCAL_STORAGE.get(STORAGE_VIEW_ITEMS)

      let merged = JSON.parse(JSON.stringify(refinedInitialMap))

      if (mainState?.map) {
        merged = mergeDeep(merged, mainState.map)
      }

      if (cacheState?.map) {
        merged = mergeDeep(merged, cacheState.map)
      }

      cachedItemsData = merged
    } catch (error) {
      console.error('Failed to initialize items from storage:', error)
      cachedItemsData = JSON.parse(JSON.stringify(refinedInitialMap))
    }
  })()

  await initPromise
}

/**
 * Initialize items atom - loads from storage and syncs atom value
 * Call once on app startup via: await store.set(initializeItemsAtom)
 */
export const initializeItemsAtom = atom(
  null,
  async (get, set) => {
    await initializeItemsFromStorage()
    set(itemsMapAtom, cachedItemsData)
  }
)

/**
 * Base atom for items map - persisted with atomWithStorage
 * Uses SyncStorage with cached data to avoid Promise exposure
 * Call initializeItemsFromStorage() on app startup to load persisted data
 */
export const itemsMapAtom = atomWithStorage<ItemsMap>(
  'jotai-v1-items-map',
  JSON.parse(JSON.stringify(refinedInitialMap)),
  {
    getItem: (_key: string): ItemsMap => cachedItemsData,
    setItem: async (_key: string, value: ItemsMap): Promise<void> => {
      try {
        cachedItemsData = value

        // Save main state (without web data) - compressed in SYNC_STORAGE
        const mainState = cleanForSaveMain({ map: value })
        const compressedMainState = compress(mainState)
        await SYNC_STORAGE.set(STORAGE_VIEW_ITEMS, compressedMainState)

        // Also save web cache for faster reloads - uncompressed in LOCAL_STORAGE
        const cacheState = cleanForSaveCache({ map: value })
        await LOCAL_STORAGE.set(STORAGE_VIEW_ITEMS, cacheState)
      } catch (error) {
        console.error('Failed to save items to storage:', error)
      }
    },
    removeItem: (_key: string): void => {
      // Not used
    }
  }
)

/**
 * Edit mode material name atom - which item is currently being edited
 */
export const editModeMaterialNameAtom = atomWithStorage<string | undefined>(
  'jotai-v1-items-editModeMaterialName',
  undefined
)

/**
 * Full ItemsState atom - combines itemsMap and editModeMaterialName
 * Derived atom that computes the full state object
 */
export const itemsStateAtom = atom<ItemsState>((get) => ({
  map: get(itemsMapAtom),
  editModeMaterialName: get(editModeMaterialNameAtom)
}))

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
 * Atom factory to get the web item data for a specific item
 */
export const getItemWebAtom = (itemName: string): Atom<WebLoadResponse<ItemWebData> | undefined> =>
  atom<WebLoadResponse<ItemWebData> | undefined>((get) => {
    const item = get(getItemAtom(itemName))
    return item?.web?.item
  })

/**
 * Atom factory to get the usage data for a specific item
 */
export const getItemUsageWebAtom = (itemName: string) =>
  atom<WebLoadResponse<ItemUsageWebData> | undefined>((get) => {
    const item = get(getItemAtom(itemName))
    return item?.web?.usage
  })

/**
 * Generic loader for item web data fields
 * Used to load item details, usage data, etc. from web sources
 */
export const loadItemFieldDataAtom = <T>(
  field: string,
  _loadFrom: (source: IWebSource) => Promise<SourceLoadResponse<T>>,
  itemName: string
) => atom(
  null,
  async (get, set) => {
    const { loadFromWeb } = await import('../../../web/loader')
    for await (const r of loadFromWeb(_loadFrom)) {
      const map = get(itemsMapAtom)
      const item = map[itemName]
      const newMap = {
        ...map,
        [itemName]: {
          ...item,
          web: { ...(item?.web ?? {}), [field]: r }
        }
      } as ItemsMap
      set(itemsMapAtom, newMap)
    }
  }
)

/**
 * Load item web data
 */
export const loadItemWebAtom = (itemName: string) =>
  loadItemFieldDataAtom('item', (s) => s.loadItem(itemName), itemName)

/**
 * Load item usage web data
 */
export const loadItemUsageWebAtom = (itemName: string) =>
  loadItemFieldDataAtom('usage', (s) => s.loadUsage(itemName), itemName)

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
    set(triggerItemsSheetSyncAtom)
  }
)

/**
 * ============================================================================
 * INITIALIZATION
 * ============================================================================
 */

/**
 * Handle CLEAR_WEB_ON_LOAD flag on app startup
 * This should be called once after the app initializes, before users interact with items
 */
export const handleClearWebOnLoadAtom = atom(
  null,
  async (get, set) => {
    if (!CLEAR_WEB_ON_LOAD) return

    try {
      const map = get(itemsMapAtom)
      const cleaned = cleanWeb({ map: map as ItemsMap })
      set(itemsMapAtom, cleaned.map)
      console.log('Cleared web data on load')
    } catch (error) {
      console.error('Failed to clear web data on load:', error)
    }
  }
)

/**
 * ============================================================================
 * BLUEPRINT CATEGORY ATOMS
 * ============================================================================
 */

/**
 * Atom factory to categorize blueprints for a specific item
 * Returns {favorite: string[], owned: string[], other: string[]}
 */
export const getBlueprintCategoriesAtom = (itemName: string) => atom<{
  favorite: string[]
  owned: string[]
  other: string[]
}>((get) => {
  const blueprintsState = get(blueprintsAtom)
  const staredState = get(staredAtom)
  const itemUsage = get(getItemUsageWebAtom(itemName))
  const rawInventory = get(rawInventoryItemsAtom)

  if (!blueprintsState || !itemUsage) {
    return { favorite: [], owned: [], other: [] }
  }

  const blueprints: Array<BlueprintWebData> = itemUsage?.data?.value?.blueprints ?? []
  const starredNames = new Set(staredState.list)
  const ownedItemNames = new Set(rawInventory.map(item => item.data.n))

  // Convert blueprint data
  const getWebBp = (bp: BlueprintData): BlueprintWebData | undefined =>
    bp.web?.blueprint?.data?.value ?? blueprints.find((b: any) => b.name === bp.name)

  // Categorize blueprints
  const favorite: string[] = []
  const owned: string[] = []
  const usedBpNames = new Set<string>()

  // Process starred blueprints (favorites)
  staredState.list.forEach((name: string) => {
    const bp = blueprintsState[name]
    if (bp) {
      const webBp = getWebBp(bp)
      if (webBp) {
        const quantity = webBp.materials
          ? (webBp.materials.find(m => m.name === itemName)?.quantity ?? 0)
          : -1
        if (quantity !== 0) {
          favorite.push(webBp.name)
          usedBpNames.add(webBp.name)
        }
      }
    }
  })

  // Process non-starred blueprints (owned)
  Object.values(blueprintsState).forEach((bp: any) => {
    if (!starredNames.has(bp.name)) {
      const webBp = getWebBp(bp)
      if (webBp) {
        const quantity = webBp.materials
          ? (webBp.materials.find((m: any) => m.name === itemName)?.quantity ?? 0)
          : -1
        if (quantity !== 0) {
          owned.push(webBp.name)
          usedBpNames.add(webBp.name)
        }
      }
    }
  })

  // Check if item is in inventory and add those blueprints to owned
  blueprints.forEach((bp: any) => {
    if (!usedBpNames.has(bp.name) && ownedItemNames.has(bp.name)) {
      const quantity = bp.materials
        ? (bp.materials.find((m: any) => m.name === itemName)?.quantity ?? 0)
        : -1
      if (quantity !== 0) {
        owned.push(bp.name)
        usedBpNames.add(bp.name)
      }
    }
  })

  // Process usage blueprints (other)
  const other = blueprints
    .filter((bp: BlueprintWebData) => {
      const quantity = bp.materials
        ? (bp.materials.find((m: BlueprintWebMaterial) => m.name === itemName)?.quantity ?? 0)
        : -1
      return quantity !== 0 && !usedBpNames.has(bp.name)
    })
    .map((bp: BlueprintWebData) => bp.name)

  return { favorite, owned, other }
})

/**
 * Compute favorite blueprints for a given item name lazily
 * Favorite = blueprints starred in craft tab that use the item
 */
export const getFavoriteBlueprintsAtom = (itemName: string) => atom<string[]>((get) => {
  const categories = get(getBlueprintCategoriesAtom(itemName))
  return categories.favorite
})

/**
 * Compute owned blueprints for a given item name lazily
 * Owned = blueprints opened in craft tab (not starred) that use the item
 */
export const getOwnedBlueprintsAtom = (itemName: string) => atom<string[]>((get) => {
  const categories = get(getBlueprintCategoriesAtom(itemName))
  return categories.owned
})

/**
 * Compute other blueprints for a given item name lazily
 * Other = blueprints from usage API that aren't favorites or owned
 */
export const getOtherBlueprintsAtom = (itemName: string) => atom<string[]>((get) => {
  const categories = get(getBlueprintCategoriesAtom(itemName))
  return categories.other
})

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
 * Atom to track countdown interval for items sheet sync
 * Stored as a primitive atom with read+write capability
 */
export const itemsSyncCountdownIntervalAtom = atom<any>(
  undefined
) as WritableAtom<any, [any], void>

/**
 * Sync items to Google Sheet - action atom
 * Reads current items and syncs to configured sheet
 */
export const syncItemsToSheetAtom = atom(
  null,
  async (get, set) => {
    const itemsState = get(itemsMapAtom)
    const settings = get(settingsAtom)

    // Skip if persistence mode is 'browser' or if sheet credentials are not configured
    if (
      !settings.sheet ||
      settings.sheet.itemsSheetPersistenceMode === 'browser' ||
      !settings.sheet.budgetDocumentId ||
      settings.sheet.itemsSheetPersistenceMode === undefined
    ) {
      let errorMsg = 'Sheet sync disabled'
      if (!settings.sheet) {
        errorMsg = 'Sheet configuration not loaded'
      } else if (settings.sheet.itemsSheetPersistenceMode === undefined) {
        errorMsg = 'Sheet persistence mode not configured'
      } else if (settings.sheet.itemsSheetPersistenceMode === 'browser') {
        errorMsg = 'Using browser storage (sheet sync disabled)'
      } else if (!settings.sheet.budgetDocumentId) {
        errorMsg = 'Google Sheets not configured'
      }
      console.warn('[ItemsSync] Skipping sync -', errorMsg)
      set(itemsSyncErrorAtom, errorMsg)
      return
    }

    set(itemsSyncErrorAtom, undefined)

    // Build the state object with the map
    const itemsStateWithMap = {
      map: itemsState,
      editModeMaterialName: undefined
    }

    let currentStage = 0
    const getCallbacks = (): ItemsSheetInterfaceCallbacks => ({
      setStage: (stage: number) => {
        currentStage = stage
      },
      getItemsSheet: async (sheetSettings: any) => {
        const sheet = await sheetsApi.loadItemsSheet(sheetSettings, (stage: number) => {
          currentStage = stage
        })
        if (!sheet) {
          throw new Error('Failed to load items sheet')
        }
        return sheet
      }
    })

    try {
      // Load the sheet and cache its URL
      const itemsSheet = await sheetsApi.loadItemsSheet(settings, (stage: number) => {
        currentStage = stage
      })
      if (itemsSheet) {
        const url = itemsSheet.getUrl()
        set(itemsSheetUrlAtom, url)
      } else {
        console.warn('Failed to load items sheet - returned undefined')
      }

      await syncItemsToSheet(settings as any, itemsStateWithMap, getCallbacks())
    } catch (error) {
      console.error('Error in syncItemsToSheet:', error)
      throw error
    }
  }
)

/**
 * Trigger debounced sync to Google Sheets
 * This sets a timeout that will sync items to the sheet after DEBOUNCE_MS with no changes
 */
export const triggerItemsSheetSyncAtom = atom(
  null,
  (get, set) => {
    const DEBOUNCE_MS = 3000

    // Clear existing timeout and countdown interval
    const existingTimeout = get(itemsSyncTimeoutAtom)
    const existingInterval = get(itemsSyncCountdownIntervalAtom)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Set status to pending
    set(itemsSyncStatusAtom, 'pending')
    set(itemsDebounceTimeAtom, DEBOUNCE_MS)

    // Start countdown timer
    let remaining = DEBOUNCE_MS
    const countdownIntervalId = setInterval(() => {
      remaining -= 100
      if (remaining > 0) {
        set(itemsDebounceTimeAtom, remaining)
      } else {
        clearInterval(countdownIntervalId)
        set(itemsDebounceTimeAtom, 0)
      }
    }, 100)
    set(itemsSyncCountdownIntervalAtom, countdownIntervalId)

    // Set debounce timeout
    const timeoutId = setTimeout(async () => {
      if (countdownIntervalId) clearInterval(countdownIntervalId)

      try {
        set(itemsSyncStatusAtom, 'syncing')
        await set(syncItemsToSheetAtom)
        set(itemsSyncStatusAtom, 'idle')
      } catch (error) {
        console.error('[ItemsSync] Failed to sync items to sheet:', error)
        set(itemsSyncStatusAtom, 'error')
      }
    }, DEBOUNCE_MS)
    set(itemsSyncTimeoutAtom, timeoutId)
  }
)

/**
 * Manually reload items from Google Sheet - action atom
 * Loads items from configured sheet and merges with local data
 */
export const reloadItemsFromSheetAtom = atom(
  null,
  async (get, set) => {
    const settings = get(settingsAtom) as any
    const currentItems = get(itemsMapAtom)

    // Skip if persistence mode is 'browser' or if sheet credentials are not configured
    if (
      !settings.sheet ||
      settings.sheet.itemsSheetPersistenceMode === 'browser' ||
      !settings.sheet.budgetDocumentId ||
      settings.sheet.itemsSheetPersistenceMode === undefined
    ) {
      console.log('Items persistence mode is browser storage or not configured, skipping sheet reload')
      return
    }

    let currentStage = 0
    const getCallbacks = (): ItemsSheetInterfaceCallbacks => ({
      setStage: (stage: number) => {
        currentStage = stage
      },
      getItemsSheet: async (sheetSettings: any) => {
        const sheet = await sheetsApi.loadItemsSheet(sheetSettings, (stage: number) => {
          currentStage = stage
        })
        if (!sheet) {
          throw new Error('Failed to load items sheet')
        }
        return sheet
      }
    })

    try {
      // Load the sheet and cache its URL
      const itemsSheet = await sheetsApi.loadItemsSheet(settings as any, (stage: number) => {
        currentStage = stage
      })
      if (itemsSheet) {
        const url = itemsSheet.getUrl()
        console.log('Items sheet loaded, URL:', url)
        set(itemsSheetUrlAtom, url)
      } else {
        console.warn('Failed to load items sheet - returned undefined')
      }

      const sheetItems = await reloadItemsFromSheet(settings as any, getCallbacks())

      // Merge sheet data with local data to preserve non-synced fields (web, user, refined)
      const mergedItems = { ...currentItems }
      for (const itemName in sheetItems) {
        const sheetItem = sheetItems[itemName]
        const localItem = currentItems[itemName]

        // Merge: keep synced fields from sheet, preserve local-only fields
        mergedItems[itemName] = {
          ...localItem,
          ...sheetItem,
          // Ensure local-only fields are preserved
          web: localItem?.web,
          user: localItem?.user,
          refined: localItem?.refined
        }
      }

      // Update the atom with merged items (atomWithStorage will persist automatically)
      set(itemsMapAtom, mergedItems)

      console.log('Items reloaded from sheet:', Object.keys(sheetItems).length, 'items (merged with local data)')
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
 * Persisted to localStorage so it's available after page reload
 */
export const itemsSheetUrlAtom = atomWithStorage<string | undefined>('itemsSheetUrl', undefined)

/**
 * Track sync error message for display in UI
 */
export const itemsSyncErrorAtom = atomWithStorage<string | undefined>('itemsSyncError', undefined)
