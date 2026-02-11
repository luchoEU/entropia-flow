import { ItemData } from "../../../common/state";
import {
  InventoryList,
  OwnedHideCriteria,
  ItemOwned} from "../state/inventory";
import { ItemState } from "../state/items";
import { initialListByStore } from "./inventory.byStore";
import { SORT_NAME_ASCENDING } from "./inventory.sort";

const emptyCriteria: OwnedHideCriteria = {
  show: false,
  name: [],
  container: [],
  value: -0.01,
};

const initialList = <D>(expanded: boolean, sortType: number): InventoryList<D> => ({
  expanded,
  sortType,
  items: [],
  stats: {
    count: 0,
    ped: "0.00",
  },
});

const initialState = {
  auction: initialList(true, SORT_NAME_ASCENDING),
  owned: {
    items: [],
    options: {},
    hideCriteria: emptyCriteria,
  },
  byStore: initialListByStore(true, SORT_NAME_ASCENDING),
  available: initialList(true, SORT_NAME_ASCENDING),
  availableCriteria: { name: [] },
  tradeItemDataChain: undefined
};

const _ownedSelect = (x: ItemOwned): ItemData => x.data;

const _isHiddenByName = (c: OwnedHideCriteria, d: ItemData): boolean =>
  c.name.includes(d.n);
const _isHiddenByContainer = (c: OwnedHideCriteria, d: ItemData): boolean =>
  c.container.includes(d.c);
const _isHiddenByValue = (c: OwnedHideCriteria, d: ItemData): boolean =>
  Number(d.v) <= c.value;

const _getAuction = (list: Array<ItemData>): Array<ItemData> =>
  list.filter((d) => d.c === "AUCTION");

export const getOwned = (list: Array<ItemData>, c: OwnedHideCriteria): Array<ItemOwned> =>
  list.map(d => {
    const hidden = {
      name: _isHiddenByName(c, d),
      container: _isHiddenByContainer(c, d),
      value: _isHiddenByValue(c, d),
    };
    return {
      data: d,
      c: { hidden: { ...hidden, any: hidden.name || hidden.container || hidden.value } }
    }
  });

const joinDuplicates = (
  list: Array<ItemData>,
  excludeContainers: string[] = [],
): Array<ItemData> => {
  var result = {};
  list.forEach((d) => {
    if (!excludeContainers.includes(d.c)) {
      if (!result[d.n]) {
        result[d.n] = {
          id: d.id,
          n: d.n,
          q: "0",
          v: "0.00",
        };
      }
      let x: ItemData = result[d.n];
      x.q = (Number(x.q) + Number(d.q)).toString();
      x.v = (Number(x.v) + Number(d.v)).toFixed(2).toString();
    }
  });
  return Object.values(result);
};

const aggregateRefinedChains = (
  items: Array<ItemData>,
  itemsMap: { [name: string]: ItemState }
): Array<ItemData> => {
  // Define chain candidate structure
  interface ChainCandidate {
    product: string
    sources: string[]
    materialCount: number
    recipeIndex: number
  }

  // Create lookup map
  const itemsByName = new Map<string, ItemData>()
  items.forEach(item => itemsByName.set(item.n, item))

  // Build all recipe candidates from usage.refinings data
  const chainCandidates: ChainCandidate[] = []

  // Iterate through items to find refined materials (items with refinings)
  for (const itemName in itemsMap) {
    const itemState = itemsMap[itemName]
    const usageData = itemState?.web?.usage?.data?.value
    const refinings = usageData?.refinings

    if (refinings && refinings.length > 0) {
      // This item has refinings, meaning it can be a refined product
      // For each refining recipe that produces this item
      for (const refining of refinings) {
        // This refining produces this item, so collect the source materials
        const product = refining.product.name
        const sourceNames = refining.ingredients.map(ing => ing.name)
        chainCandidates.push({
          product,
          sources: sourceNames,
          materialCount: sourceNames.length,
          recipeIndex: refinings.indexOf(refining)
        })
      }
    }
  }

  // Detect shared ingredients and resolve conflicts
  const ingredientUsageCount: { [name: string]: ChainCandidate[] } = {}
  for (const candidate of chainCandidates) {
    for (const source of candidate.sources) {
      if (!ingredientUsageCount[source]) {
        ingredientUsageCount[source] = []
      }
      ingredientUsageCount[source].push(candidate)
    }
  }

  // Resolve conflicts by selecting chains with minimum material count
  const losingProducts = new Set<string>()
  for (const [ingredient, competingChains] of Object.entries(ingredientUsageCount)) {
    if (competingChains.length <= 1) continue // No conflict

    // Find minimum material count
    const minMaterialCount = Math.min(...competingChains.map(c => c.materialCount))
    const bestCandidates = competingChains.filter(c => c.materialCount === minMaterialCount)

    // Tie-breaking: prefer lower recipeIndex (first in array)
    const winner = bestCandidates.reduce((best, curr) =>
      curr.recipeIndex < best.recipeIndex ? curr : best
    )

    // Mark losers for exclusion
    for (const candidate of competingChains) {
      if (candidate !== winner) {
        losingProducts.add(candidate.product)
      }
    }
  }

  // Filter to winning chains only
  const selectedChains = chainCandidates.filter(
    candidate => !losingProducts.has(candidate.product)
  )

  // Track items to remove and items to add
  const itemsToRemove = new Set<string>()
  const aggregatedItems: Array<ItemData> = []

  for (const candidate of selectedChains) {
    const refined = candidate.product
    const sources = candidate.sources
    const refinedItem = itemsByName.get(refined)
    if (!refinedItem) continue

    // Find available source materials
    const availableSources = sources
      .map(name => itemsByName.get(name))
      .filter(item => item !== undefined) as Array<ItemData>

    // Only aggregate if we have at least one source material
    if (availableSources.length === 0) continue

    // Calculate total value (refined + all sources)
    let totalValue = Number(refinedItem.v)
    availableSources.forEach(source => {
      totalValue += Number(source.v)
    })

    // Calculate quantity: total_value / refined_item_unit_value
    const refinedMeta = itemsMap[refined]
    const refinedWebValue = refinedMeta?.web?.item?.data?.value?.value
    let quantity = '0'
    if (refinedWebValue && refinedWebValue > 0) {
      quantity = (totalValue / refinedWebValue).toFixed(0)
    }

    // Create aggregated item
    const aggregated: ItemData = {
      id: refinedItem.id,
      n: `${refined} ← ${sources.join(', ')}`,
      q: quantity,
      v: totalValue.toFixed(2),
      c: refinedItem.c,
      r: refinedItem.r
    }

    aggregatedItems.push(aggregated)

    // Mark items for removal
    itemsToRemove.add(refined)
    availableSources.forEach(source => {
      itemsToRemove.add(source.n)
    })
  }

  // Build final list
  return items
    .filter(item => !itemsToRemove.has(item.n))
    .concat(aggregatedItems)
};

const getItemList = (ownedItems: ItemOwned[]): Array<ItemData> => ownedItems.map(_ownedSelect);
const getBlueprintList = (ownedItems: ItemOwned[]): Array<ItemData> => getItemList(ownedItems).filter(item => item.n.includes("Blueprint"));

export const getRefinedChainForItem = (
  itemName: string,
  itemsMap: { [name: string]: ItemState }
): { refined: string; sources: string[] } | undefined => {
  const itemState = itemsMap[itemName]
  const usageData = itemState?.web?.usage?.data?.value
  const refinings = usageData?.refinings

  if (!refinings || refinings.length === 0) {
    return undefined
  }

  // Select refining recipe with minimum material count
  const refining = refinings.reduce((best, curr) =>
    curr.ingredients.length < best.ingredients.length ? curr : best
  )
  const sourceNames = refining.ingredients.map(ing => ing.name)

  return {
    refined: itemName,
    sources: sourceNames
  }
}

const cleanForSaveInventoryList = <D>(list: InventoryList<D>): InventoryList<D> => ({
  ...list,
  items: undefined,
  stats: undefined
});

const parseAggregatedName = (name: string): { baseName: string; sources?: string[] } => {
  // Parse aggregated format "ItemName ← source1, source2, ..."
  const match = name.match(/^(.+?)\s*←\s*(.+)$/)
  if (match) {
    const baseName = match[1].trim()
    const sourcesStr = match[2].trim()
    const sources = sourcesStr.split(',').map(s => s.trim())
    return { baseName, sources }
  }
  return { baseName: name }
}

export {
  initialState,
  initialList,
  getItemList,
  getBlueprintList,
  joinDuplicates,
  aggregateRefinedChains,
  cleanForSaveInventoryList,
  parseAggregatedName
};
