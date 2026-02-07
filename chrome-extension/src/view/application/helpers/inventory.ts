import { Inventory, ItemData } from "../../../common/state";
import { multiIncludes } from "../../../common/filter";
import { BlueprintData, CraftState } from "../state/craft";
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

const _getOwned = getOwned;

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

function applyListFilter<D>(list: InventoryList<D>, filter: string | undefined, select: (d: D) => ItemData): InventoryList<D> {
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
  getItemList,
  getBlueprintList,
  joinDuplicates,
  cleanForSave,
  cleanForSaveInventoryList
};
