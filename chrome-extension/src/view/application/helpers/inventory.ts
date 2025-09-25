import { Inventory, ItemData } from "../../../common/state";
import { multiIncludes } from "../../../common/filter";
import { BlueprintData, CraftingUserData, CraftState } from "../state/craft";
import {
  InventoryState,
  InventoryList,
  OwnedHideCriteria,
  AvailableCriteria,
  InventoryListWithFilter,
  TradeBlueprintLineData,
  TradeItemData,
  ItemOwned,
  OwnedOptions
} from "../state/inventory";
import { initialListByStore, loadInventoryByStore } from "./inventory.byStore";
import {
  cloneSortListSelect,
  sortListSelect,
  SORT_NAME_ASCENDING,
  nextSortType,
} from "./inventory.sort";
import { cloneAndSort, defaultSortSecuence, nextSortSecuence, numberComparer, stringComparer } from "./sort";
import { WebLoadResponse } from "../../../web/loader";
import { BlueprintWebData, ItemUsageWebData } from "../../../web/state";

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

const initialState: InventoryState = {
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

const _getOwned = (list: Array<ItemData>, c: OwnedHideCriteria): Array<ItemOwned> =>
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

const _getAvailable = (
  list: Array<ItemData>,
  c: AvailableCriteria,
): Array<ItemData> =>
  joinDuplicates(
    list
      .filter((d) => c.name.includes(d.n))
      .concat(
        c.name.map((n) => ({
          id: n,
          n,
          q: "0",
          v: "0.00",
          c: undefined,
        })),
      ),
  );

const loadInventory = (
  state: InventoryState,
  list: Array<ItemData>,
): InventoryState => ({
  ...state,
  auction: _sortAndStats({
    ...state.auction,
    items: _getAuction(list),
  }, (x) => x),
  owned: {
    ...state.owned,
    items: _getOwned(list, state.owned.hideCriteria),
  },
  available: _sortAndStats({
    ...state.available,
    items: _getAvailable(list, state.availableCriteria),
  }, (x) => x),
  byStore: loadInventoryByStore(state.byStore, list)
});

const getItemList = (state: InventoryState): Array<ItemData> => state.owned.items.map(_ownedSelect);
const getBlueprintList = (state: InventoryState): Array<ItemData> => getItemList(state).filter(item => item.n.includes("Blueprint"));

const reduceLoadInventoryState = (
  oldState: InventoryState, // where to get the items
  state: InventoryState, // where to get the rest
): InventoryState => loadInventory(state, getItemList(oldState)); // use oldState in case reduceSetCurrentInventory was called first

const reduceSetCurrentInventory = (
  state: InventoryState,
  inventory: Inventory,
): InventoryState => loadInventory(state, inventory.itemlist);

function applyListFilter<D>(list: InventoryList<D>, filter: string, select: (d: D) => ItemData): InventoryList<D> {
  const items = list.items
    .filter((d) => multiIncludes(filter, select(d).n));
  const sum = items.reduce(
    (partialSum, d) => partialSum + Number(select(d).v),
    0,
  );
  return {
    ...list,
    expanded: true,
    items,
    stats: {
      count: items.length,
      ped: sum.toFixed(2),
    },
  };
}

function _nextSortByPart<D>(
  list: InventoryList<D>,
  part: number,
  select: (d: D) => ItemData,
) {
  const sortType = nextSortType(part, list.sortType);
  return {
    ...list,
    sortType,
    items: cloneSortListSelect(list.items, sortType, select),
  };
}

const _nextSortByPartWithFilter = <D>(
  inv: InventoryListWithFilter<D>,
  part: number,
  select: (d: D) => ItemData,
): InventoryListWithFilter<D> => {
  const sortType = nextSortType(part, inv.originalList.sortType);
  const originalList = {
    ...inv.originalList,
    sortType,
    items: cloneSortListSelect(inv.originalList.items, sortType, select)
  }
  return {
    ...inv,
    originalList,
    showList: applyListFilter(originalList, inv.filter, select)
  }
}

function _sortAndStats<D>(
  list: InventoryList<D>,
  select: (d: D) => ItemData,
): InventoryList<D> {
  sortListSelect(list.items, list.sortType, select);
  const sum = list.items.reduce(
    (partialSum, d) => partialSum + Number(select(d).v),
    0,
  );
  list.stats = {
    count: list.items.length,
    ped: sum.toFixed(2),
  };
  return list;
}

const _sortAndStatsWithFilter = <D extends any>(
  inv: InventoryListWithFilter<D>,
  items: Array<D>,
  select: (d: D) => ItemData,
): InventoryListWithFilter<D> => {
  const originalList = {
    ...inv.originalList,
    items: cloneSortListSelect(items, inv.originalList.sortType, select)
  }
  return {
    ...inv,
    originalList,
    showList: applyListFilter(originalList, inv.filter, select)
  }
}

const reduceSortAuctionBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  auction: _nextSortByPart(state.auction, part, (x) => x),
});

const reduceSortAvailableBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  available: _nextSortByPart(state.available, part, (x) => x),
});

const _changeHiddenCriteria = (state: InventoryState, newCriteria: any) =>
  loadInventory(
    { ...state, owned: { ...state.owned, hideCriteria: { ...state.owned.hideCriteria, ...newCriteria } } },
    getItemList(state),
  );

const reduceHideByName = (state: InventoryState, name: string): InventoryState =>
  _changeHiddenCriteria(state, { name: [...state.owned.hideCriteria.name, name] });

const reduceShowByName = (state: InventoryState, name: string): InventoryState =>
  _changeHiddenCriteria(state, {
    name: state.owned.hideCriteria.name.filter((x) => x !== name),
  });

const reduceHideByContainer = (
  state: InventoryState,
  container: string,
): InventoryState =>
  _changeHiddenCriteria(state, {
    container: [...state.owned.hideCriteria.container, container],
  });

const reduceShowByContainer = (
  state: InventoryState,
  container: string,
): InventoryState =>
  _changeHiddenCriteria(state, {
    container: state.owned.hideCriteria.container.filter((x) => x !== container),
  });

const reduceHideByValue = (state: InventoryState, value: string): InventoryState =>
  _changeHiddenCriteria(state, { value: Number(value) });

const reduceShowByValue = (state: InventoryState, value: string): InventoryState =>
  _changeHiddenCriteria(state, { value: Number(value) - 0.01 });

const reduceShowHiddenItems = (state: InventoryState, show: boolean): InventoryState =>
  _changeHiddenCriteria(state, { show });

const reduceShowAll = (state: InventoryState): InventoryState =>
  _changeHiddenCriteria(state, emptyCriteria);

const reduceShowTradingItemData = (state: InventoryState, name: string, chainIndex: number): InventoryState => {
  let tradeItemDataChain: TradeItemData[]
  if (!name && chainIndex === 0) {
    tradeItemDataChain = undefined
  } else {
    if (chainIndex === 0) {
      tradeItemDataChain = []
    } else {
      tradeItemDataChain = state.tradeItemDataChain || [];
      if (tradeItemDataChain.length > chainIndex) {
        tradeItemDataChain = tradeItemDataChain.slice(0, chainIndex)
      }
    }
    if (name) {
      tradeItemDataChain.push({
        name,
        sortSecuence: {
          favoriteBlueprints: defaultSortSecuence,
          ownedBlueprints: defaultSortSecuence,
          otherBlueprints: defaultSortSecuence,
        }
      })
    }
  }
  return { ...state, tradeItemDataChain };
}

const reduceLoadTradingItemData = (state: InventoryState, craftState: CraftState, usage: WebLoadResponse<ItemUsageWebData>[]): InventoryState => {
  if (!state.tradeItemDataChain) {
    return state
  }
  return {
    ...state,
    tradeItemDataChain: state.tradeItemDataChain.map((itemData, index) => {
      const usageBPs = usage[index]?.data?.value.blueprints
      const userToWebBp = (bp: BlueprintData): BlueprintWebData | undefined => {
        if (!bp.user) return undefined
        return {
          name: bp.name,
          type: undefined,
          level: undefined,
          profession: undefined,
          item: undefined,
          materials: bp.user.materials.map(m => ({ name: m.name, quantity: Number(m.quantity), type: undefined, value: undefined })),
        }
      }
      const getWebBp = (list: BlueprintData[]): BlueprintWebData[] => list
        .map(bp => userToWebBp(bp) ?? bp.web?.blueprint.data?.value ?? usageBPs?.find(b => b.name === bp.name))
        .filter(bp => bp)
      const fav: BlueprintWebData[] = getWebBp(craftState.stared.list.map(name => craftState.blueprints[name]).filter(bp => bp))
      const own: BlueprintWebData[] = getWebBp(Object.values(craftState.blueprints).filter(bp => !craftState.stared.list.includes(bp.name)))
      if (usageBPs) // add owned blueprints that were never opened in crafting tab
        own.push(...usageBPs.filter(bp => getBlueprintList(state).find(b => b.n === bp.name) && !fav.find(b => b.name === bp.name) && !own.find(b => b.name === bp.name)))
      const oth: BlueprintWebData[] = usageBPs?.filter(bp => !fav.find(b => b.name === bp.name) && !own.find(b => b.name === bp.name)) ?? []
      const m = (list: BlueprintWebData[]): TradeBlueprintLineData[] => list
        .map(bp => ({
          bpName: bp.name,
          quantity: bp.materials == undefined ? -1 : // if no materials it is from usage, temporary show -1 (loading) so it appears on the list
            (bp.materials.find(m => m.name === itemData.name)?.quantity ?? 0)
        }))
        .filter(bp => bp.quantity != 0);

      return {
        ...itemData,
        c: {
          favoriteBlueprints: cloneAndSort(m(fav), itemData.sortSecuence?.favoriteBlueprints, _tradeSortColumnDefinition),
          ownedBlueprints: cloneAndSort(m(own), itemData.sortSecuence?.ownedBlueprints, _tradeSortColumnDefinition),
          otherBlueprints: cloneAndSort(m(oth), itemData.sortSecuence?.otherBlueprints, _tradeSortColumnDefinition),
        }
      }
    })
  }
}

const _tradeSortColumnDefinition = [
    { // BP_NAME
        selector: (d: TradeBlueprintLineData) => d.bpName,
        comparer: stringComparer
    },
    { // QUANTITY
        selector: (d: TradeBlueprintLineData) => d.quantity,
        comparer: numberComparer
    },
]

const _reduceSortTradeBlueprintsBy = (
  fieldName: string,
  state: InventoryState,
  chainIndex: number,
  column: number,
): InventoryState => {
  const sortSecuence = nextSortSecuence(state.tradeItemDataChain[chainIndex].sortSecuence[fieldName], column);
  return {
    ...state,
    tradeItemDataChain: state.tradeItemDataChain.map((d, i) => i !== chainIndex ? d : {
      ...d,
      sortSecuence: {
        ...d.sortSecuence,
        [fieldName]: sortSecuence
      },
      c: {
        ...d.c,
        [fieldName]: cloneAndSort(d.c[fieldName], sortSecuence, _tradeSortColumnDefinition),
      }
    })
  }
};

const reduceSortTradeFavoriteBlueprintsBy = (state: InventoryState, chainIndex: number, column: number): InventoryState =>
  _reduceSortTradeBlueprintsBy('favoriteBlueprints', state, chainIndex, column);

const reduceSortTradeOwnedBlueprintsBy = (state: InventoryState, chainIndex: number, column: number): InventoryState =>
  _reduceSortTradeBlueprintsBy('ownedBlueprints', state, chainIndex, column);

const reduceSortTradeOtherBlueprintsBy = (state: InventoryState, chainIndex: number, column: number): InventoryState =>
  _reduceSortTradeBlueprintsBy('otherBlueprints', state, chainIndex, column);

const reduceAddAvailable = (state: InventoryState, name: string): InventoryState =>
  loadInventory(
    {
      ...state,
      availableCriteria: { name: [...state.availableCriteria.name, name] },
    },
    getItemList(state),
  );

const reduceRemoveAvailable = (state: InventoryState, name: string): InventoryState =>
  loadInventory(
    {
      ...state,
      availableCriteria: {
        name: state.availableCriteria.name.filter((n) => n !== name),
      },
    },
    getItemList(state),
  );

const reduceSetOwnedOptions = (state: InventoryState, change: Partial<OwnedOptions>): InventoryState => ({
  ...state,
  owned: {
    ...state.owned,
    options: {
      ...state.owned.options,
      ...change
    }
  }
})

const cleanForSaveInventoryList = <D>(list: InventoryList<D>): InventoryList<D> => ({
  ...list,
  items: undefined,
  stats: undefined
});

const cleanForSave = (state: InventoryState): InventoryState => ({
  // remove what will be reconstructed in loadInventory
  auction: cleanForSaveInventoryList(state.auction),
  owned: {
    ...state.owned,
    items: undefined, // calculated value
  },
  byStore: undefined, // saved independently because it is too big
  available: cleanForSaveInventoryList(state.available),
  availableCriteria: state.availableCriteria,
  tradeItemDataChain: state.tradeItemDataChain?.map(t => ({ ...t, c: undefined})),
});

export {
  initialState,
  initialList,
  reduceLoadInventoryState,
  reduceSetCurrentInventory,
  reduceSortAuctionBy,
  reduceSortAvailableBy,
  reduceHideByName,
  reduceHideByContainer,
  reduceHideByValue,
  reduceShowByName,
  reduceShowByContainer,
  reduceShowByValue,
  reduceShowHiddenItems,
  reduceShowAll,
  reduceShowTradingItemData,
  reduceLoadTradingItemData,
  reduceSortTradeFavoriteBlueprintsBy,
  reduceSortTradeOwnedBlueprintsBy,
  reduceSortTradeOtherBlueprintsBy,
  reduceAddAvailable,
  reduceRemoveAvailable,
  reduceSetOwnedOptions,
  getItemList,
  getBlueprintList,
  joinDuplicates,
  cleanForSave,
  cleanForSaveInventoryList
};
