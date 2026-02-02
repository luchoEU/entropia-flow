import { Atom, atom, getDefaultStore } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { ItemOwned, TradeItemData, OwnedHideCriteria, OwnedOptions, TradeBlueprintLineData } from '../state/inventory'
import { ItemsMap, ItemState, ItemsState } from '../state/items'
import { TTServiceInventoryWebData, TTServiceState } from '../state/ttService'
import { CraftState } from '../state/craft'
import { joinDuplicates } from '../helpers/inventory'
import { ItemData } from '../../../common/state'
import { BlueprintWebData, ItemWebData } from '../../../web/state'
import { blueprintsAtom, staredAtom, craftOptionsAtom, activeSessionAtom, activePlanetAtom, editModeBlueprintNameAtom, craftWebDataAtom, craftComputedAtom } from './craft'
import { settingsAtom } from './settings'

/**
 * Base atom for raw inventory items
 * This can be populated by Redux middleware or other data sources
 */
export const rawInventoryItemsAtom = atom<ItemOwned[]>([])

/**
 * Items map atom for looking up reserve amounts and item states
 */
export const itemsMapAtom = atomWithStorage<ItemsMap>('inventory-itemsMap', {})

/**
 * TTService state atom for loading status and values
 */
export const ttServiceAtom = atomWithStorage<TTServiceState | null>('inventory-ttService', null)

/**
 * Trade item data chain atom for showing which item is being traded
 */
export const tradeItemChainAtom = atomWithStorage<TradeItemData[] | undefined>('inventory-tradeItemChain', undefined)

/**
 * Hide criteria atom - local state for filtering hidden items
 */
export const hideCriteriaAtom = atomWithStorage<OwnedHideCriteria>('inventory-hideCriteria', {
  show: false,
  name: [],
  container: [],
  value: -1
})

/**
 * Owned options atom - local state for reserve and auction options
 */
export const ownedOptionsAtom = atomWithStorage<OwnedOptions>('inventory-ownedOptions', {
  reserve: undefined,
  auction: undefined
})

/**
 * Filter options for inventory display
 */
export interface InventoryFilterOptions {
  reserve: boolean
  auction: boolean
}

/**
 * Inventory filter options atom
 */
export const filterOptionsAtom = atomWithStorage<InventoryFilterOptions>('inventory-filterOptions', {
  reserve: false,
  auction: false
})

/**
 * Edit mode material name atom - tracks which item is being edited
 */
export const editModeMaterialNameAtom = atomWithStorage<string | undefined>('inventory-editModeMaterialName', undefined)

/**
 * Atom factory to get a single item by name
 */
export const getItemAtom = (itemName: string) => atom((get) => {
  const itemsMap = get(itemsMapAtom)
  return itemsMap[itemName]
})

/**
 * Atom factory to get the web item data for a specific item
 */
export const getItemWebAtom = (itemName: string) => atom((get) => {
  const item = get(getItemAtom(itemName))
  return item?.web?.item
})

/**
 * Atom factory to get the usage data for a specific item
 */
export const getItemUsageWebAtom = (itemName: string) => atom((get) => {
  const item = get(getItemAtom(itemName))
  return item?.web?.usage
})

/**
 * Atom factory to get the TTService web inventory data
 */
export const getTTServiceWebAtom = () => atom((get) => {
  const ttService = get(ttServiceAtom)
  return ttService?.web?.inventory
})

/**
 * Async atom factory to load item data from web
 * Returns ItemWebData directly (not wrapped in WebLoadResponse)
 * Also persists the full WebLoadResponse to itemsMapAtom for availability in enrichedItemsAtom
 */
export const getItemWebAsyncAtom = (itemName: string) => atom<Promise<ItemWebData>>(async (get) => {
  // Check cache first to avoid unnecessary loads
  const itemsMap = get(itemsMapAtom)
  const cached = itemsMap[itemName]?.web?.item?.data?.value
  if (cached) {
    return cached
  }

  const { loadFromWeb } = await import('../../../web/loader')
  const store = getDefaultStore()
  let lastData: ItemWebData | undefined = undefined

  for await (const response of loadFromWeb(s => s.loadItem(itemName, undefined))) {
    if (response.data?.value) {
      lastData = response.data.value
    }

    // Side effect: Update itemsMapAtom via store
    const currentMap = store.get(itemsMapAtom)
    const current = currentMap[itemName]
    const updated = current ? {
      ...current,
      web: {
        ...current.web,
        item: response
      }
    } : { web: { item: response } }

    store.set(itemsMapAtom, {
      ...currentMap,
      [itemName]: updated as any
    })
  }

  if (!lastData) {
    throw new Error(`Failed to load item data for ${itemName}`)
  }

  return lastData
})

export type LoadableState<T> =
  | { state: 'loading' }
  | { state: 'hasError'; error: unknown }
  | { state: 'hasData'; data: T }

/**
 * Loadable atom factory for item web data
 */
export const getItemWebLoadableAtom = (itemName: string): Atom<LoadableState<ItemWebData>> => loadable(getItemWebAsyncAtom(itemName))


/**
 * Wrapper atom to convert TTService WebLoadResponse to loadable-like format
 * TTService uses Redux for loading, so we convert the WebLoadResponse pattern to LoadableState
 */
export const getTTServiceLoadableAtom = () => atom((get) => {
  const w = get(getTTServiceWebAtom())

  if (!w) {
    return { state: 'loading' } as const
  }

  if (w.errors && w.errors.length > 0) {
    return { state: 'hasError', error: new Error(w.errors[0]?.message || 'Unknown error') } as const
  }

  if (w.data?.value) {
    return { state: 'hasData', data: w.data.value } as const
  }

  if (w.loading) {
    return { state: 'loading' } as const
  }

  return { state: 'loading' } as const
})

/**
 * Full ItemsState atom - combines itemsMap and editModeMaterialName
 */
export const itemsStateAtom = atom<ItemsState>((get) => {
  const map = get(itemsMapAtom)
  const editModeMaterialName = get(editModeMaterialNameAtom)
  return {
    map,
    editModeMaterialName
  }
})


/**
 * Write atom to set the trade item chain
 */
export const setTradeItemChainAtom = atom(null, (get, set, itemName: string | undefined, chainIndex: number) => {
  const current = get(tradeItemChainAtom)
  // Logic to update the chain based on itemName and chainIndex
  // For now, just store a simple implementation
  if (!itemName) {
    set(tradeItemChainAtom, undefined)
  } else {
    // Keep existing chain structure or update it
    set(tradeItemChainAtom, current || [])
  }
})

/**
 * Write atom to update a material value in the items map
 */
export const setMaterialValueAtom = atom(null, (get, set, itemName: string, value: string) => {
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]
  if (current) {
    set(itemsMapAtom, {
      ...itemsMap,
      [itemName]: {
        ...current,
        user: {
          ...current.user,
          valueOnEdit: value
        }
      } as any
    })
  }
})

/**
 * Write atom to set the reserve amount for an item
 */
export const setReserveAmountAtom = atom(null, (get, set, itemName: string, reserveAmount: string) => {
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]
  if (current) {
    set(itemsMapAtom, {
      ...itemsMap,
      [itemName]: {
        ...current,
        reserveAmount
      } as any
    })
  }
})

/**
 * Write atom to change material type
 */
export const setMaterialTypeAtom = atom(null, (get, set, itemName: string, type: string) => {
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]
  if (current) {
    set(itemsMapAtom, {
      ...itemsMap,
      [itemName]: {
        ...current,
        user: {
          ...current.user,
          type
        }
      } as any
    })
  }
})

/**
 * Write atom to set the edit mode material name
 */
export const setEditModeMaterialNameAtom = atom(null, (_get, set, itemName: string | undefined) => {
  set(editModeMaterialNameAtom, itemName)
})

/**
 * Write atom to set item calculator quantity
 */
export const setItemCalculatorQuantityAtom = atom(null, (get, set, itemName: string, quantity: string) => {
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]
  if (current) {
    set(itemsMapAtom, {
      ...itemsMap,
      [itemName]: {
        ...current,
        calc: {
          ...(current.calc || { quantity: '', total: '', totalMU: '' }),
          quantity
        }
      } as any
    })
  }
})

/**
 * Write atom to set item calculator total
 */
export const setItemCalculatorTotalAtom = atom(null, (get, set, itemName: string, total: string) => {
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]
  if (current) {
    set(itemsMapAtom, {
      ...itemsMap,
      [itemName]: {
        ...current,
        calc: {
          ...(current.calc || { quantity: '', total: '', totalMU: '' }),
          total
        }
      } as any
    })
  }
})

/**
 * Write atom to set item calculator total + MU
 */
export const setItemCalculatorTotalMUAtom = atom(null, (get, set, itemName: string, totalMU: string) => {
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]
  if (current) {
    set(itemsMapAtom, {
      ...itemsMap,
      [itemName]: {
        ...current,
        calc: {
          ...(current.calc || { quantity: '', total: '', totalMU: '' }),
          totalMU
        }
      } as any
    })
  }
})

/**
 * Write atom to load item data from web
 * Replaces Redux loadItemData action
 */
export const loadItemDataAtom = atom(null, async (get, set, itemName: string) => {
  const { loadFromWeb } = await import('../../../web/loader')
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]

  try {
    for await (const r of loadFromWeb(s => s.loadItem(itemName, undefined))) {
      const updated = current ? {
        ...current,
        web: {
          ...current.web,
          item: r
        }
      } : { web: { item: r } }

      set(itemsMapAtom, {
        ...itemsMap,
        [itemName]: updated as any
      })
    }
  } catch (error) {
    console.error(`Failed to load item data for ${itemName}:`, error)
  }
})

/**
 * Write atom to load item usage data from web
 * Replaces Redux loadItemUsageData action
 */
export const loadItemUsageDataAtom = atom(null, async (get, set, itemName: string) => {
  const { loadFromWeb } = await import('../../../web/loader')
  const itemsMap = get(itemsMapAtom)
  const current = itemsMap[itemName]

  try {
    // Collect all results before updating to batch the update and prevent cascading re-renders
    let finalUpdate: any = current ? { ...current } : {}
    let updateCount = 0

    try {
      for await (const r of loadFromWeb(s => s.loadUsage(itemName))) {
        updateCount++
        if (r.data) {
          finalUpdate = current ? {
            ...current,
            web: {
              ...current?.web,
              usage: r.data.value
            }
          } : { web: { usage: r.data.value } }
        }
      }
    } catch (loopError) {
    }

    // Only update once after all results are collected
    set(itemsMapAtom, {
      ...itemsMap,
      [itemName]: finalUpdate as any
    })
  } catch (error) {
    console.error(`Failed to load item usage data for ${itemName}:`, error)
  }
})

/**
 * Computed: Add reserve and ttService values to items
 */
export const enrichedItemsAtom = atom<ItemOwned[]>((get) => {
  const items = get(rawInventoryItemsAtom)
  const options = get(filterOptionsAtom)
  const itemsMap = get(itemsMapAtom)
  const ttService = get(ttServiceAtom)
  const chain = get(tradeItemChainAtom)
  const hideCriteria = get(hideCriteriaAtom)

  // Helper functions to calculate hidden status based on current criteria
  const isHiddenByName = (itemName: string): boolean => hideCriteria.name.includes(itemName)
  const isHiddenByContainer = (container: string): boolean => hideCriteria.container.includes(container)
  const isHiddenByValue = (value: string): boolean => Number(value) <= hideCriteria.value

  // Filter hidden items unless explicitly showing them
  let list = items.filter(d => {
    const hidden = {
      name: isHiddenByName(d.data.n),
      container: isHiddenByContainer(d.data.c),
      value: isHiddenByValue(d.data.v),
    }
    const isHidden = hidden.name || hidden.container || hidden.value
    return hideCriteria.show || !isHidden
  })

  let finalItems: ItemData[]
  const auctionItems = list.filter(d => d.data.c === 'AUCTION')
  if (options.auction && auctionItems.length > 0) {
    const ownedItems = list.filter(d => d.data.c !== 'AUCTION')
    finalItems = joinDuplicates(ownedItems.map(d => d.data))
  } else {
    finalItems = joinDuplicates(list.map(d => d.data))
  }

  const chainRootName = chain?.[0]?.name
  const ttServiceWebData: TTServiceInventoryWebData | undefined = ttService?.web?.inventory?.data?.value
  const ttServiceValueMap: Record<string, number> = ttServiceWebData?.reduce(
    (p, c) => ({ ...p, [c.name]: c.value + (p[c.name] ?? 0) }),
    {} as Record<string, number>
  ) ?? {}

  return finalItems.map(d => {
    const m: ItemState = itemsMap[d.n]
    let enrichedItem: ItemOwned = {
      data: d,
      c: {
        hidden: {
          name: isHiddenByName(d.n),
          container: isHiddenByContainer(d.c),
          value: isHiddenByValue(d.v),
          any: false
        }
      }
    }
    enrichedItem.c.hidden.any = enrichedItem.c.hidden.name || enrichedItem.c.hidden.container || enrichedItem.c.hidden.value

    // Add reserve amount
    if (options.reserve && m?.reserveAmount) {
      const reserve: number = parseFloat(m.reserveAmount)
      if (!isNaN(reserve)) {
        const nv = Math.max(0, Number(d.v) - reserve)
        const v = nv.toFixed(2)
        const unitValue = m.web?.item?.data?.value?.value
        const q = unitValue ? (nv / unitValue).toFixed(0) : ''
        enrichedItem.data = { ...d, v, q }
      }
    }

    // Add tabular state
    enrichedItem.t = {
      showingTradeItem: d.n === chainRootName,
      reserveAmount: m?.reserveAmount ? parseFloat(m.reserveAmount) : undefined,
      ttServiceValue: ttServiceValueMap[d.n]
    }

    return enrichedItem
  })
})

/**
 * Craft state atom - kept for backward compatibility
 * Now sourced directly from craft atoms instead of Redux sync
 */
export const craftStateAtom = atom((get) => {
  const blueprints = get(blueprintsAtom)
  const stared = get(staredAtom)
  const options = get(craftOptionsAtom)
  const activeSession = get(activeSessionAtom)
  const activePlanet = get(activePlanetAtom)
  const editModeBlueprintName = get(editModeBlueprintNameAtom)
  const web = get(craftWebDataAtom)
  const computed = get(craftComputedAtom)

  return {
    blueprints,
    stared,
    options,
    activeSession,
    activePlanet,
    editModeBlueprintName,
    web,
    c: computed
  } as CraftState
})

/**
 * Helper: Convert BlueprintWebData to TradeBlueprintLineData for a specific item
 */
const bpToLineData = (bp: BlueprintWebData, itemName: string): TradeBlueprintLineData => ({
  bpName: bp.name,
  quantity: bp.materials
    ? (bp.materials.find(m => m.name === itemName)?.quantity ?? 0)
    : -1
})

/**
 * Compute all blueprint categories for a given item name in one pass
 */
export const getBlueprintCategoriesAtom = (itemName: string) => atom<{
  favorite: TradeBlueprintLineData[]
  owned: TradeBlueprintLineData[]
  other: TradeBlueprintLineData[]
}>((get) => {
  const craftState = get(craftStateAtom)
  const itemUsage = get(getItemUsageWebAtom(itemName))

  if (!craftState || !itemUsage) {
    return { favorite: [], owned: [], other: [] }
  }

  const usageBPs = itemUsage as any  // itemUsage is WebLoadResponse<ItemUsageWebData>, access via .data?.value
  const blueprints = usageBPs?.data?.value?.blueprints ?? []
  const starredNames = new Set(craftState.stared.list)

  // Convert blueprint data
  const getWebBp = (bp: any): BlueprintWebData | undefined =>
    bp.web?.blueprint?.data?.value ?? blueprints.find((b: any) => b.name === bp.name)

  // Categorize blueprints
  const favorite: TradeBlueprintLineData[] = []
  const owned: TradeBlueprintLineData[] = []
  const usedBpNames = new Set<string>()

  // Process starred blueprints (favorites)
  craftState.stared.list.forEach((name: string) => {
    const bp = craftState.blueprints[name]
    if (bp) {
      const webBp = getWebBp(bp)
      if (webBp) {
        const lineData = bpToLineData(webBp, itemName)
        if (lineData.quantity !== 0) {
          favorite.push(lineData)
          usedBpNames.add(webBp.name)
        }
      }
    }
  })

  // Process non-starred blueprints (owned)
  Object.values(craftState.blueprints).forEach((bp: any) => {
    if (!starredNames.has(bp.name)) {
      const webBp = getWebBp(bp)
      if (webBp) {
        const lineData = bpToLineData(webBp, itemName)
        if (lineData.quantity !== 0) {
          owned.push(lineData)
          usedBpNames.add(webBp.name)
        }
      }
    }
  })

  // Process usage blueprints (other)
  const other = blueprints
    .map((bp: any) => bpToLineData(bp, itemName))
    .filter((bp: TradeBlueprintLineData) => bp.quantity !== 0 && !usedBpNames.has(bp.bpName))

  return { favorite, owned, other }
})

/**
 * Compute favorite blueprints for a given item name lazily
 * Favorite = blueprints starred in craft tab that use the item
 */
export const getFavoriteBlueprintsAtom = (itemName: string) => atom<TradeBlueprintLineData[]>((get) => {
  const categories = get(getBlueprintCategoriesAtom(itemName))
  return categories.favorite
})

/**
 * Compute owned blueprints for a given item name lazily
 * Owned = blueprints opened in craft tab (not starred) that use the item
 */
export const getOwnedBlueprintsAtom = (itemName: string) => atom<TradeBlueprintLineData[]>((get) => {
  const categories = get(getBlueprintCategoriesAtom(itemName))
  return categories.owned
})

/**
 * Compute other blueprints for a given item name lazily
 * Other = blueprints from usage API that aren't favorites or owned
 */
export const getOtherBlueprintsAtom = (itemName: string) => atom<TradeBlueprintLineData[]>((get) => {
  const categories = get(getBlueprintCategoriesAtom(itemName))
  return categories.other
})

/**
 * Factory function to create a blueprint items atom from raw blueprint data
 */
export const createBlueprintItemsAtom = (blueprints: TradeBlueprintLineData[]) => {
  return atom<TradeBlueprintLineData[]>(blueprints)
}

/**
 * Write atom to load TTService inventory data from Google Sheets
 * Replaces Redux loadTTService action
 */
export const loadTTServiceAtom = atom(null, async (get, set) => {
  try {
    const settings = get(settingsAtom)
    if (!settings?.sheet) {
      console.warn('TTService: No sheet settings available')
      return
    }

    // Import services at runtime
    const servicesModule = await import('../../services')
    const services = servicesModule.default
    const api = services.api

    try {
      // Load TTService inventory sheet directly
      const sheet = await api.sheets.loadTTServiceInventorySheet(settings.sheet, () => {})
      if (!sheet) {
        console.error('Failed to load TTService sheet')
        return
      }

      const data = await sheet.readTable()
      if (data) {
        const current = get(ttServiceAtom)
        const response = {
          data: {
            value: data,
            link: {
              text: 'Google Sheets',
              href: sheet.url()
            }
          }
        }
        set(ttServiceAtom, {
          ...current,
          web: {
            ...current?.web,
            inventory: response
          }
        })
      }
    } catch (error) {
      console.error('Failed to read TTService sheet:', error)
    }
  } catch (error) {
    console.error('Failed to load TTService inventory:', error)
  }
})

// Re-export components from inventoryComponents.tsx
export {
  getInventoryColumnConfig,
  InventoryOwnedListAfterSearch,
  InventoryOwnedListBeforeTable,
  createBlueprintTableConfig,
  createRefiningTableConfig,
  createTTServiceTableConfig
} from './inventoryComponents'
