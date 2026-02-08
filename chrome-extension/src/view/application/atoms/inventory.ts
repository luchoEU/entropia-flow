import { Atom, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ItemOwned, TradeItemData, OwnedHideCriteria, OwnedOptions, TradeBlueprintLineData, InventoryByStore, ContainerMapData } from '../state/inventory'
import { ItemsMap, ItemState, ItemsState } from '../state/items'
import { TTServiceInventoryWebData, TTServiceState } from '../state/ttService'
import { BlueprintData, CraftState } from '../state/craft'
import { joinDuplicates } from '../helpers/inventory'
import { loadInventoryByStore, initialListByStore } from '../helpers/inventory.byStore'
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
 * Auction items atom - items currently on auction
 * Derived atom that automatically filters rawInventoryItemsAtom for items in AUCTION container
 * Recomputes whenever rawInventoryItemsAtom changes
 */
export const auctionItemsAtom = atom<ItemData[]>((get) => {
  const rawItems = get(rawInventoryItemsAtom)
  return rawItems
    .filter(item => item.data.c === 'AUCTION')
    .map(item => item.data)
})

/**
 * Available items atom - items available for trading
 * Derived atom that automatically filters rawInventoryItemsAtom for favorite items
 * Filters based on availableCriteriaAtom (list of favorite item names)
 * Aggregates items with the same name into a single row with combined quantity and value
 * Recomputes whenever rawInventoryItemsAtom or availableCriteriaAtom changes
 */
export const availableItemsAtom = atom<ItemData[]>((get) => {
  const rawItems = get(rawInventoryItemsAtom)
  const criteria = get(availableCriteriaAtom)

  const filtered = rawItems
    .filter(item => criteria.name.includes(item.data.n))
    .map(item => item.data)

  // Aggregate items with the same name (e.g., Light Mind Essence in CARRIED + AUCTION becomes one row)
  return joinDuplicates(filtered)
})

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
 * Available criteria atom - tracks favorite items in trading view
 */
export const availableCriteriaAtom = atomWithStorage('jotai-v1-inventory-availableCriteria', {
  name: [] as string[]
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
 * Write atom to hide items by name
 * Replaces Redux HIDE_BY_NAME action
 */
export const hideByNameAtom = atom(null, (get, set, itemName: string) => {
  const criteria = get(hideCriteriaAtom)
  if (!criteria.name.includes(itemName)) {
    set(hideCriteriaAtom, {
      ...criteria,
      name: [...criteria.name, itemName]
    })
  }
})

/**
 * Write atom to show items by name
 * Replaces Redux SHOW_BY_NAME action
 */
export const showByNameAtom = atom(null, (get, set, itemName: string) => {
  const criteria = get(hideCriteriaAtom)
  set(hideCriteriaAtom, {
    ...criteria,
    name: criteria.name.filter(n => n !== itemName)
  })
})

/**
 * Write atom to hide items by container
 * Replaces Redux HIDE_BY_CONTAINER action
 */
export const hideByContainerAtom = atom(null, (get, set, container: string) => {
  const criteria = get(hideCriteriaAtom)
  if (!criteria.container.includes(container)) {
    set(hideCriteriaAtom, {
      ...criteria,
      container: [...criteria.container, container]
    })
  }
})

/**
 * Write atom to show items by container
 * Replaces Redux SHOW_BY_CONTAINER action
 */
export const showByContainerAtom = atom(null, (get, set, container: string) => {
  const criteria = get(hideCriteriaAtom)
  set(hideCriteriaAtom, {
    ...criteria,
    container: criteria.container.filter(c => c !== container)
  })
})

/**
 * Write atom to hide items by value threshold
 * Replaces Redux HIDE_BY_VALUE action
 */
export const hideByValueAtom = atom(null, (get, set, value: number) => {
  const criteria = get(hideCriteriaAtom)
  set(hideCriteriaAtom, {
    ...criteria,
    value
  })
})

/**
 * Write atom to show items by removing value threshold
 * Replaces Redux SHOW_BY_VALUE action
 */
export const showByValueAtom = atom(null, (get, set) => {
  const criteria = get(hideCriteriaAtom)
  set(hideCriteriaAtom, {
    ...criteria,
    value: -1
  })
})

/**
 * Write atom to show all hidden items
 * Replaces Redux SHOW_ALL action
 */
export const showAllAtom = atom(null, (get, set) => {
  const criteria = get(hideCriteriaAtom)
  set(hideCriteriaAtom, {
    ...criteria,
    show: true
  })
})

/**
 * Write atom to hide previously shown items
 * Replaces Redux SHOW_HIDDEN_ITEMS action
 */
export const showHiddenItemsAtom = atom(null, (get, set) => {
  const criteria = get(hideCriteriaAtom)
  set(hideCriteriaAtom, {
    ...criteria,
    show: !criteria.show
  })
})

/**
 * Write atom to set owned options (reserve and auction filters)
 * Replaces Redux SET_OWNED_OPTIONS action
 */
export const setOwnedOptionsAtom = atom(null, (get, set, options: Partial<OwnedOptions>) => {
  const current = get(ownedOptionsAtom)
  set(ownedOptionsAtom, {
    ...current,
    ...options
  })
})

/**
 * Write atom to add an item to favorites (available criteria)
 * Replaces Redux ADD_AVAILABLE action
 */
export const addAvailableAtom = atom(null, (get, set, itemName: string) => {
  const criteria = get(availableCriteriaAtom)
  if (!criteria.name.includes(itemName)) {
    set(availableCriteriaAtom, {
      name: [...criteria.name, itemName]
    })
  }
})

/**
 * Write atom to remove an item from favorites (available criteria)
 * Replaces Redux REMOVE_AVAILABLE action
 */
export const removeAvailableAtom = atom(null, (get, set, itemName: string) => {
  const criteria = get(availableCriteriaAtom)
  set(availableCriteriaAtom, {
    name: criteria.name.filter(n => n !== itemName)
  })
})

/**
 * Computed atom: Check if an item is marked as available (favorite)
 * Used in trading view to show favorite status
 */
export const isItemAvailableAtom = (itemName: string) => atom<boolean>((get) => {
  const criteria = get(availableCriteriaAtom)
  return criteria.name.includes(itemName)
})

/**
 * Computed atom: All available items sorted by name
 * Used in trading view
 */
export const sortedAvailableItemsAtom = atom<string[]>((get) => {
  const criteria = get(availableCriteriaAtom)
  return criteria.name.sort()
})

/**
 * Inventory sort state atom
 * Tracks current sort configuration for different lists
 */
export const inventorySortStateAtom = atomWithStorage('jotai-v1-inventory-sortState', {
  auctionSortType: 0,
  availableSortType: 0,
  ownedSortType: 0
})

/**
 * Write atom to sort auction items
 * Replaces Redux SORT_AUCTION_BY action
 */
export const sortAuctionByAtom = atom(null, (get, set, part: number) => {
  const state = get(inventorySortStateAtom)
  set(inventorySortStateAtom, {
    ...state,
    auctionSortType: part
  })
})

/**
 * Write atom to sort available items
 * Replaces Redux SORT_AVAILABLE_BY action
 */
export const sortAvailableByAtom = atom(null, (get, set, part: number) => {
  const state = get(inventorySortStateAtom)
  set(inventorySortStateAtom, {
    ...state,
    availableSortType: part
  })
})

/**
 * Blueprint sort state atom
 * Tracks sort configuration for different blueprint lists in trading view
 */
export const blueprintSortStateAtom = atomWithStorage('jotai-v1-inventory-blueprintSortState', {
  favoriteSortType: 0,
  ownedSortType: 0,
  otherSortType: 0
})

/**
 * Write atom to sort favorite blueprints
 * Replaces Redux SORT_TRADE_FAVORITE_BLUEPRINTS_BY action
 */
export const sortTradeFavoriteBlueprintsByAtom = atom(null, (get, set, part: number) => {
  const state = get(blueprintSortStateAtom)
  set(blueprintSortStateAtom, {
    ...state,
    favoriteSortType: part
  })
})

/**
 * Write atom to sort owned blueprints
 * Replaces Redux SORT_TRADE_OWNED_BLUEPRINTS_BY action
 */
export const sortTradeOwnedBlueprintsByAtom = atom(null, (get, set, part: number) => {
  const state = get(blueprintSortStateAtom)
  set(blueprintSortStateAtom, {
    ...state,
    ownedSortType: part
  })
})

/**
 * Write atom to sort other blueprints
 * Replaces Redux SORT_TRADE_OTHER_BLUEPRINTS_BY action
 */
export const sortTradeOtherBlueprintsByAtom = atom(null, (get, set, part: number) => {
  const state = get(blueprintSortStateAtom)
  set(blueprintSortStateAtom, {
    ...state,
    otherSortType: part
  })
})

/**
 * Write atom to show trading item data chain
 * Replaces Redux SHOW_TRADING_ITEM_DATA action
 */
export const showTradingItemDataAtom = atom(null, (_get, set, chain: TradeItemData[] | undefined) => {
  set(tradeItemChainAtom, chain)
})

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

/**
 * Computed atom: Full InventoryState combining all sub-states
 * Provides a complete view of inventory state for backward compatibility
 */
export const fullInventoryStateAtom = atom((get) => {
  const ownedItems = get(enrichedItemsAtom)
  const ownedOptions = get(ownedOptionsAtom)
  const hideCriteria = get(hideCriteriaAtom)
  const tradeChain = get(tradeItemChainAtom)

  return {
    auction: {
      expanded: false,
      sortType: 0,
      items: [],
      stats: { count: 0, ped: '0.00' }
    },
    owned: {
      items: ownedItems,
      options: ownedOptions,
      hideCriteria
    },
    byStore: {
      filter: undefined,
      showList: { expanded: false, sortType: 0, items: [], stats: { count: 0, ped: '0.00' } },
      originalList: { expanded: false, sortType: 0, items: [], stats: { count: 0, ped: '0.00' } },
      containers: {},
      stared: { expanded: [], list: { expanded: false, sortType: 0, items: [], stats: { count: 0, ped: '0.00' } } },
      material: { expanded: [], list: { expanded: false, sortType: 0, items: [], stats: { count: 0, ped: '0.00' } } },
      flat: { original: [], show: [], stared: [], material: [] },
      c: { validPlanets: [] }
    },
    available: {
      expanded: false,
      sortType: 0,
      items: [],
      stats: { count: 0, ped: '0.00' }
    },
    availableCriteria: { name: [] },
    tradeItemDataChain: tradeChain
  }
})

/**
 * Current inventory name atom - tracks which inventory is currently selected
 */
export const currentInventoryNameAtom = atomWithStorage<string | undefined>('jotai-v1-inventory-currentName', undefined)

/**
 * Inventory loading state atom
 */
export const inventoryLoadingAtom = atom<boolean>(false)

/**
 * Write atom to set the current inventory
 * Replaces Redux SET_CURRENT_INVENTORY action
 */
export const setCurrentInventoryAtom = atom(null, (_get, set, inventoryName: string) => {
  set(currentInventoryNameAtom, inventoryName)
})

/**
 * ByStore containers atom - stores user preferences (expanded, stared, custom names)
 * Derived from rawInventoryItemsAtom to build tree structure
 */
export const byStoreContainersAtom = atomWithStorage<ContainerMapData>('jotai-v1-inventory-byStoreContainers', {})

/**
 * ByStore stared expanded items atom - tracks which stared items are expanded
 */
export const byStoreStaredExpandedAtom = atomWithStorage<string[]>('jotai-v1-inventory-byStoreStaredExpanded', [])

/**
 * ByStore material expanded items atom - tracks which material items are expanded
 */
export const byStoreMaterialExpandedAtom = atomWithStorage<string[]>('jotai-v1-inventory-byStoreMaterialExpanded', [])

/**
 * ByStore inventory state atom - DERIVED from rawInventoryItemsAtom and user preferences
 * Automatically recomputes when raw items or preferences change
 * No longer a stored atom - computed on demand from source of truth (rawInventoryItemsAtom)
 */
export const byStoreStateAtom = atom<InventoryByStore | null>((get) => {
  const rawItems = get(rawInventoryItemsAtom)
  if (!rawItems || rawItems.length === 0) return null

  const containers = get(byStoreContainersAtom)
  const staredExpanded = get(byStoreStaredExpandedAtom)
  const materialExpanded = get(byStoreMaterialExpandedAtom)

  // Read sort state from atoms
  const containersSortType = get(byStoreSortStateAtom).containersSortType
  const staredSortType = get(staredSortStateAtom).staredSortType

  // Convert ItemOwned[] to ItemData[]
  const itemDataList = rawItems.map(item => item.data)

  // Build initial byStore structure with user preferences
  const initialByStore: InventoryByStore = {
    containers,
    staredExpanded,
    materialExpanded,
    items: [],
    staredItems: [],
    materialItems: []
  }

  // Use existing helper to build and flatten the tree structure
  // Pass sort types to apply tree-aware sorting before flattening
  return loadInventoryByStore(initialByStore, itemDataList, containersSortType, staredSortType)
})

/**
 * ByStore editing state atom - tracks which item is currently being edited
 */
export const byStoreEditingAtom = atomWithStorage<string | undefined>('jotai-v1-inventory-byStoreEditing', undefined)

/**
 * Write atom to set all byStore stared items expanded state
 * Replaces Redux SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED action
 */
export const setByStoreStaredAllItemsExpandedAtom = atom(null, (get, set, expanded: boolean) => {
  const current = get(byStoreStateAtom)
  if (!current) return

  // Get all stared item IDs from the flattened stared items
  const allStaredIds = current.staredItems
    .filter(item => item.isContainer)
    .map(item => item.id)

  // Update the stared expanded atom with all IDs if expanding, or clear if collapsing
  if (expanded) {
    set(byStoreStaredExpandedAtom, allStaredIds)
  } else {
    set(byStoreStaredExpandedAtom, [])
  }
})

/**
 * Write atom to toggle byStore item expansion
 * Replaces Redux SET_BY_STORE_ITEM_EXPANDED action
 */
export const setByStoreItemExpandedAtom = atom(null, (get, set, itemId: string, expanded: boolean) => {
  const current = get(byStoreContainersAtom)
  const updated = { ...current }
  if (updated[itemId]) {
    updated[itemId] = { ...updated[itemId], expanded }
  } else {
    updated[itemId] = { displayName: '', expanded, stared: false }
  }
  set(byStoreContainersAtom, updated)
})

/**
 * Write atom to set all byStore items expanded state
 * Replaces Redux SET_BY_STORE_ALL_ITEMS_EXPANDED action
 */
export const setByStoreAllItemsExpandedAtom = atom(null, (get, set, expanded: boolean) => {
  const current = get(byStoreContainersAtom)
  const updated: ContainerMapData = {}
  for (const [id, container] of Object.entries(current)) {
    updated[id] = { ...container, expanded }
  }
  set(byStoreContainersAtom, updated)
})

/**
 * Write atom to start editing an item name in byStore
 * Replaces Redux START_BY_STORE_ITEM_NAME_EDITING action
 */
export const startByStoreItemNameEditingAtom = atom(null, (_get, set, itemId: string) => {
  set(byStoreEditingAtom, itemId)
})

/**
 * Write atom to cancel editing an item name in byStore
 * Replaces Redux CANCEL_BY_STORE_ITEM_NAME_EDITING action
 */
export const cancelByStoreItemNameEditingAtom = atom(null, (_get, set) => {
  set(byStoreEditingAtom, undefined)
})

/**
 * Write atom to set material filter
 * Replaces Redux SET_BY_STORE_MATERIAL_FILTER action
 * Note: Filtering is now handled internally by JotaiSortableTable
 */
export const setByStoreMaterialFilterAtom = atom(null, (_get, _set, _filter: string | undefined) => {
  // Filtering is handled by JotaiSortableTable component internally
})

/**
 * Write atom to toggle material item expansion
 * Replaces Redux SET_BY_STORE_MATERIAL_ITEM_EXPANDED action
 */
export const setByStoreMaterialItemExpandedAtom = atom(null, (get, set, itemId: string, expanded: boolean) => {
  const current = get(byStoreMaterialExpandedAtom)
  if (expanded) {
    if (!current.includes(itemId)) {
      set(byStoreMaterialExpandedAtom, [...current, itemId])
    }
  } else {
    set(byStoreMaterialExpandedAtom, current.filter(id => id !== itemId))
  }
})

/**
 * Material sort state atom
 * Tracks sort configuration for material list
 */
export const materialSortStateAtom = atomWithStorage('jotai-v1-inventory-materialSortState', {
  materialSortType: 0
})

/**
 * Write atom to sort material items
 * Replaces Redux SORT_BY_STORE_MATERIAL_BY action
 */
export const sortByStoreMaterialByAtom = atom(null, (get, set, part: number) => {
  const state = get(materialSortStateAtom)
  set(materialSortStateAtom, {
    ...state,
    materialSortType: part
  })
})

/**
 * ByStore stared sort state atom
 */
export const staredSortStateAtom = atomWithStorage('jotai-v1-inventory-staredSortState', {
  staredSortType: 0
})

/**
 * ByStore sort state atom (main containers section)
 */
export const byStoreSortStateAtom = atomWithStorage('jotai-v1-inventory-byStoreSortState', {
  containersSortType: 0
})

/**
 * Write atom to set byStore (containers) filter
 * Replaces Redux SET_BY_STORE_FILTER action
 * Note: Filtering is now handled internally by JotaiSortableTable
 */
export const setByStoreInventoryFilterAtom = atom(null, (_get, _set, _filter: string | undefined) => {
  // Filtering is handled by JotaiSortableTable component internally
})

/**
 * Write atom to set byStore stared filter
 * Replaces Redux SET_BY_STORE_STARED_FILTER action
 * Note: Filtering is now handled internally by JotaiSortableTable
 */
export const setByStoreStaredInventoryFilterAtom = atom(null, (_get, _set, _filter: string | undefined) => {
  // Filtering is handled by JotaiSortableTable component internally
})

/**
 * Write atom to toggle stared item expansion
 * Replaces Redux SET_BY_STORE_STARED_ITEM_EXPANDED action
 */
export const setByStoreStaredItemExpandedAtom = atom(null, (get, set, itemId: string, expanded: boolean) => {
  const current = get(byStoreStaredExpandedAtom)
  if (expanded) {
    if (!current.includes(itemId)) {
      set(byStoreStaredExpandedAtom, [...current, itemId])
    }
  } else {
    set(byStoreStaredExpandedAtom, current.filter(id => id !== itemId))
  }
})

/**
 * Write atom to sort stared items
 * Replaces Redux SORT_BY_STORE_STARED_BY action
 */
export const sortByStoreStaredByAtom = atom(null, (get, set, part: number) => {
  const state = get(staredSortStateAtom)
  set(staredSortStateAtom, {
    ...state,
    staredSortType: part
  })
})

/**
 * Write atom to sort containers
 * Replaces Redux SORT_BY_STORE_BY action
 */
export const sortByStoreByAtom = atom(null, (get, set, part: number) => {
  const state = get(byStoreSortStateAtom)
  set(byStoreSortStateAtom, {
    ...state,
    containersSortType: part
  })
})

/**
 * Write atom to set all items expanded state
 * Replaces Redux SET_BY_STORE_ALL_ITEMS_EXPANDED action
 */
export const setByStoreAllItemsExpandedSimpleAtom = atom(null, (get, set, expanded: boolean) => {
  // Set all containers in byStoreContainersAtom to the expanded state
  const containers = get(byStoreContainersAtom)
  const updatedContainers = Object.entries(containers).reduce((acc, [id, container]) => {
    acc[id] = { ...container, expanded }
    return acc
  }, {} as ContainerMapData)
  set(byStoreContainersAtom, updatedContainers)

  // Also expand/collapse all material items
  if (expanded) {
    const inventory = get(byStoreStateAtom)
    if (inventory?.materialItems) {
      const allMaterialIds = inventory.materialItems.map(item => item.id)
      set(byStoreMaterialExpandedAtom, allMaterialIds)
    }
  } else {
    set(byStoreMaterialExpandedAtom, [])
  }
})

/**
 * ByStore item editing state (which item is being edited, original name)
 */
export const byStoreItemEditingStateAtom = atomWithStorage<{itemId: string, originalName: string} | undefined>('jotai-v1-inventory-byStoreItemEditing', undefined)

/**
 * ByStore stared item editing state
 */
export const byStoreStaredItemEditingStateAtom = atomWithStorage<{itemId: string, originalName: string} | undefined>('jotai-v1-inventory-byStoreStaredItemEditing', undefined)

/**
 * Write atom to confirm item name edit
 * Replaces Redux CONFIRM_BY_STORE_ITEM_NAME_EDITING action
 */
export const confirmByStoreItemNameEditingAtom = atom(null, (_get, set, _itemId: string) => {
  set(byStoreItemEditingStateAtom, undefined)
})

/**
 * Write atom to set item name during editing
 * Replaces Redux SET_BY_STORE_ITEM_NAME action
 */
export const setByStoreItemNameAtom = atom(null, (get, set, itemId: string, newName: string) => {
  const current = get(byStoreItemEditingStateAtom)
  if (current && current.itemId === itemId) {
    set(byStoreItemEditingStateAtom, { ...current, originalName: newName })
  }
})

/**
 * Write atom to mark/unmark item as stared (favorite)
 * Replaces Redux SET_BY_STORE_ITEM_STARED action
 */
export const setByStoreItemStaredAtom = atom(null, (_get, _set, _itemId: string, _stared: boolean) => {
  // Placeholder - actual implementation would update byStoreStateAtom
})

/**
 * Write atom to start editing stared item name
 * Replaces Redux START_BY_STORE_STARED_ITEM_NAME_EDITING action
 */
export const startByStoreStaredItemNameEditingAtom = atom(null, (_get, set, itemId: string) => {
  set(byStoreStaredItemEditingStateAtom, { itemId, originalName: '' })
})

/**
 * Write atom to confirm stared item name edit
 * Replaces Redux CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING action
 */
export const confirmByStoreStaredItemNameEditingAtom = atom(null, (_get, set) => {
  set(byStoreStaredItemEditingStateAtom, undefined)
})

/**
 * Write atom to cancel stared item name edit
 * Replaces Redux CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING action
 */
export const cancelByStoreStaredItemNameEditingAtom = atom(null, (_get, set) => {
  set(byStoreStaredItemEditingStateAtom, undefined)
})

/**
 * Write atom to set stared item name during editing
 * Replaces Redux SET_BY_STORE_STARED_ITEM_NAME action
 */
export const setByStoreStaredItemNameAtom = atom(null, (get, set, itemId: string, newName: string) => {
  const current = get(byStoreStaredItemEditingStateAtom)
  if (current && current.itemId === itemId) {
    set(byStoreStaredItemEditingStateAtom, { ...current, originalName: newName })
  }
})

/**
 * Write atom to mark/unmark stared item as stared
 * Replaces Redux SET_BY_STORE_STARED_ITEM_STARED action
 */
export const setByStoreStaredItemStaredAtom = atom(null, (_get, _set, _itemId: string, _stared: boolean) => {
  // Placeholder - actual implementation would update byStoreStateAtom
})

/**
 * These atoms are used to:
 * 1. Compute derived data from other atoms
 * 2. Trigger side effects when state changes
 * 3. Bridge between Jotai and Redux during migration
 */

/**
 * Computed atom: Inventory state built from Jotai atoms
 *
 * This creates a virtual inventory state object combining all Jotai atoms.
 * Used by tabular data generation to compute display data.
 *
 * Note: This is a computed atom that reconstructs state from atoms.
 * This is the primary source of truth replacing Redux.
 */
export const inventoryStateAtom = atom((get) => {
  const auctionItems = get(auctionItemsAtom)
  const availableItems = get(availableItemsAtom)

  // Calculate stats from items
  const calcStats = (items: ItemData[]) => ({
    count: items.length,
    ped: items.reduce((sum, item) => sum + Number(item.v), 0).toFixed(2)
  })

  return {
    owned: {
      items: get(rawInventoryItemsAtom),
      options: get(ownedOptionsAtom),
      hideCriteria: get(hideCriteriaAtom)
    },
    // Auction and available items now properly stored in Jotai atoms
    auction: {
      expanded: true,
      sortType: get(inventorySortStateAtom)?.auctionSortType ?? 0,
      items: auctionItems,
      stats: calcStats(auctionItems)
    },
    available: {
      expanded: true,
      sortType: get(inventorySortStateAtom)?.availableSortType ?? 0,
      items: availableItems,
      stats: calcStats(availableItems)
    },
    availableCriteria: get(availableCriteriaAtom),
    tradeItemDataChain: get(tradeItemChainAtom),
    byStore: get(byStoreStateAtom)
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
