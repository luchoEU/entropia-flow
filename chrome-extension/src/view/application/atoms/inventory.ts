import { Atom, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ItemOwned, TradeItemData, OwnedHideCriteria, OwnedOptions, TradeBlueprintLineData } from '../state/inventory'
import { ItemsMap, ItemState, ItemsState } from '../state/items'
import { TTServiceInventoryWebData, TTServiceState } from '../state/ttService'
import { BlueprintData, CraftState } from '../state/craft'
import { joinDuplicates } from '../helpers/inventory'
import { ItemData } from '../../../common/state'
import { BlueprintWebData, ItemUsageWebData, ItemWebData } from '../../../web/state'
import { blueprintsAtom, staredAtom, craftOptionsAtom, activeSessionAtom, activePlanetAtom, editModeBlueprintNameAtom, craftWebDataAtom, craftComputedAtom } from './craft'
import { settingsAtom } from './settings'
import { WebLoadResponse } from '../../../web/loader'
import { IWebSource, SourceLoadResponse } from '../../../web/sources'

/**
 * Base atom for raw inventory items
 * This can be populated by Redux middleware or other data sources
 */
export const rawInventoryItemsAtom = atom<ItemOwned[]>([])

/**
 * Items map atom for looking up reserve amounts and item states
 */
export const itemsMapAtom = atomWithStorage<ItemsMap>('jotai-v1-inventory-itemsMap', {})

/**
 * TTService state atom for loading status and values
 */
export const ttServiceAtom = atomWithStorage<TTServiceState | null>('jotai-v1-inventory-ttService', null)

/**
 * Trade item data chain atom for showing which item is being traded
 */
export const tradeItemChainAtom = atomWithStorage<TradeItemData[] | undefined>('jotai-v1-inventory-tradeItemChain', undefined)

/**
 * Hide criteria atom - local state for filtering hidden items
 */
export const hideCriteriaAtom = atomWithStorage<OwnedHideCriteria>('jotai-v1-inventory-hideCriteria', {
  show: false,
  name: [],
  container: [],
  value: -1
})

/**
 * Owned options atom - local state for reserve and auction options
 */
export const ownedOptionsAtom = atomWithStorage<OwnedOptions>('jotai-v1-inventory-ownedOptions', {
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
export const filterOptionsAtom = atomWithStorage<InventoryFilterOptions>('jotai-v1-inventory-filterOptions', {
  reserve: false,
  auction: false
})

/**
 * Edit mode material name atom - tracks which item is being edited
 */
export const editModeMaterialNameAtom = atomWithStorage<string | undefined>('jotai-v1-inventory-editModeMaterialName', undefined)

/**
 * Atom factory to get a single item by name
 */
export const getItemAtom = (itemName: string) => atom<ItemState | undefined>((get) => {
  const itemsMap = get(itemsMapAtom)
  return itemsMap[itemName]
})

/**
 * Atom factory to get the web item data for a specific item
 */
export const getItemWebAtom = (itemName: string): Atom<WebLoadResponse<ItemWebData> | undefined> => atom<WebLoadResponse<ItemWebData> | undefined>((get) => {
  const item = get(getItemAtom(itemName))
  return item?.web?.item
})

/**
 * Atom factory to get the usage data for a specific item
 */
export const getItemUsageWebAtom = (itemName: string) => atom<WebLoadResponse<ItemUsageWebData> | undefined>((get) => {
  const item = get(getItemAtom(itemName))
  return item?.web?.usage
})

/**
 * Atom factory to get the TTService web inventory data
 */
export const getTTServiceWebAtom = () => atom<WebLoadResponse<TTServiceInventoryWebData> | undefined>((get) => {
  const ttService = get(ttServiceAtom)
  return ttService?.web?.inventory
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

export const loadItemWebAtom = (itemName: string) => loadItemDataAtom('item', s => s.loadItem(itemName), itemName)
export const loadItemUsageWebAtom = (itemName: string) => loadItemDataAtom('usage', s => s.loadUsage(itemName), itemName)

/**
 * Write atom to load item data from web
 * Replaces Redux loadItemUsageData action
 */
export const loadItemDataAtom = <T>(field: string, _loadFrom: (source: IWebSource) => Promise<SourceLoadResponse<T>>, itemName: string) =>
  atom(null, async (get, set) => {
  const { loadFromWeb } = await import('../../../web/loader')
  try {
    for await (const r of loadFromWeb(_loadFrom)) {
      const itemsMap = get(itemsMapAtom)
      const current = itemsMap[itemName]
      const update = {
        ...current,
        web: {
          ...current?.web,
          [field]: r
        }
      }
      set(itemsMapAtom, {
        ...itemsMap,
        [itemName]: update
      })
    }
  } catch (error) {
    console.error(`Failed to load item ${field} data for ${itemName}:`, error)
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

  const blueprints = itemUsage?.data?.value?.blueprints ?? []
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
          ? (webBp.materials.find(m => m.name === itemName)?.quantity ?? 0)
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
        ? (bp.materials.find(m => m.name === itemName)?.quantity ?? 0)
        : -1
      if (quantity !== 0) {
        owned.push(bp.name)
        usedBpNames.add(bp.name)
      }
    }
  })

  // Process usage blueprints (other)
  const other = blueprints
    .filter((bp: any) => {
      const quantity = bp.materials
        ? (bp.materials.find(m => m.name === itemName)?.quantity ?? 0)
        : -1
      return quantity !== 0 && !usedBpNames.has(bp.name)
    })
    .map((bp: any) => bp.name)

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
