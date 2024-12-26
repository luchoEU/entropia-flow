import { Inventory, ItemData } from "../../../common/state";
import { multiIncludes } from "../../../common/string";
import { BlueprintData, CraftState } from "../state/craft";
import {
  InventoryState,
  InventoryList,
  HideCriteria,
  ItemHidden,
  AvailableCriteria,
  InventoryListWithFilter,
  ItemVisible,
  TradeBlueprintLineData
} from "../state/inventory";
import { initialListByStore, loadInventoryByStore } from "./inventory.byStore";
import {
  cloneSortListSelect,
  sortListSelect,
  SORT_NAME_ASCENDING,
  SORT_VALUE_DESCENDING,
  nextSortType,
} from "./inventory.sort";
import { cloneAndSort, defaultSortSecuence, nextSortSecuence, numberComparer, stringComparer } from "./sort";

const emptyCriteria: HideCriteria = {
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

const initialListWithFilter = <D>(expanded: boolean, sortType: number): InventoryListWithFilter<D> => ({
  filter: undefined,
  showList: initialList(true, sortType),
  originalList: initialList(expanded, sortType),
});

const initialState: InventoryState = {
  blueprints: initialListWithFilter(true, SORT_NAME_ASCENDING),
  auction: initialList(true, SORT_NAME_ASCENDING),
  visible: initialListWithFilter(true, SORT_VALUE_DESCENDING),
  hidden: initialListWithFilter(false, SORT_NAME_ASCENDING),
  hiddenCriteria: emptyCriteria,
  byStore: initialListByStore(true, SORT_NAME_ASCENDING),
  available: initialList(true, SORT_NAME_ASCENDING),
  availableCriteria: { name: [] },
  tradeItemData: undefined
};

const _visibleSelect = (x: ItemVisible): ItemData => x.data;
const _hiddenSelect = (x: ItemHidden): ItemData => x.data;
const _blueprintSelect = (x: ItemData): ItemData => x;

const _isHiddenByName = (c: HideCriteria, d: ItemData): boolean =>
  c.name.includes(d.n);
const _isHiddenByContainer = (c: HideCriteria, d: ItemData): boolean =>
  c.container.includes(d.c);
const _isHiddenByValue = (c: HideCriteria, d: ItemData): boolean =>
  Number(d.v) <= c.value;
const _isHidden =
  (c: HideCriteria) =>
  (d: ItemData): boolean =>
    _isHiddenByName(c, d) || _isHiddenByContainer(c, d) || _isHiddenByValue(c, d);

const _addCriteria =
  (c: HideCriteria) =>
  (d: ItemData): ItemHidden => ({
    data: d,
    criteria: {
      name: _isHiddenByName(c, d),
      container: _isHiddenByContainer(c, d),
      value: _isHiddenByValue(c, d),
    },
  });

const _getBlueprints = (list: Array<ItemData>): Array<ItemData> =>
  list.filter((d) => d.n.includes("Blueprint"));

const _getAuction = (list: Array<ItemData>): Array<ItemData> =>
  list.filter((d) => d.c === "AUCTION");

const _getVisible = (list: Array<ItemData>, c: HideCriteria): Array<ItemVisible> =>
  list.filter((d) => !_isHidden(c)(d)).map(data => ({ data }));

const _getHidden = (list: Array<ItemData>, c: HideCriteria): Array<ItemHidden> =>
  list.filter(_isHidden(c)).map(_addCriteria(c));

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
): InventoryState => _propagateTradeItemName({
  ...state,
  blueprints: _sortAndStatsWithFilter(state.blueprints, _getBlueprints(list), _blueprintSelect),
  auction: _sortAndStats({
    ...state.auction,
    items: _getAuction(list),
  }, (x) => x),
  visible: _sortAndStatsWithFilter(state.visible, _getVisible(list, state.hiddenCriteria), _visibleSelect),
  hidden: _sortAndStatsWithFilter(state.hidden, _getHidden(list, state.hiddenCriteria), _hiddenSelect),
  available: _sortAndStats({
    ...state.available,
    items: _getAvailable(list, state.availableCriteria),
  }, (x) => x),
  byStore: loadInventoryByStore(state.byStore, list)
});

const joinList = (state: InventoryState): Array<ItemData> => [
  ...state.visible.originalList.items.map(_visibleSelect),
  ...state.hidden.originalList.items.map(_hiddenSelect),
];

const reduceLoadInventoryState = (
  oldState: InventoryState,
  state: InventoryState,
): InventoryState => loadInventory(state, joinList(oldState));

const reduceSetCurrentInventory = (
  state: InventoryState,
  inventory: Inventory,
): InventoryState => loadInventory(state, inventory.itemlist);

const reduceSetAuctionExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  auction: {
    ...state.auction,
    expanded,
  },
});

const reduceSetAvailableExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  available: {
    ...state.available,
    expanded,
  }
});

const reduceSetVisibleExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  visible: {
    ...state.visible,
    originalList: {
      ...state.visible.originalList,
      expanded
    }
  }
});

const reduceSetHiddenExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  hidden: {
    ...state.hidden,
    originalList: {
      ...state.hidden.originalList,
      expanded
    }
  }
});

const reduceSetBlueprintsExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  blueprints: {
    ...state.blueprints,
    originalList : {
      ...state.blueprints.originalList,
      expanded,
    }
  },
})

const reduceSetBlueprintsFilter = (
  state: InventoryState,
  filter: string,
): InventoryState => ({
  ...state,
  blueprints: {
    ...state.blueprints,
    filter,
    showList: applyListFilter(state.blueprints.originalList, filter, _blueprintSelect),
  },
})

const reduceSortOwnedBlueprintsBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  blueprints: _nextSortByPartWithFilter(state.blueprints, part, _blueprintSelect),
});

const reduceSetVisibleFilter = (
  state: InventoryState,
  filter: string
): InventoryState => ({
  ...state,
  visible: {
    ...state.visible,
    filter,
    showList: applyListFilter(state.visible.originalList, filter, _visibleSelect)
  }
})

const reduceSetHiddenFilter = (
  state: InventoryState,
  filter: string
): InventoryState => ({
  ...state,
  hidden: {
    ...state.hidden,
    filter,
    showList: applyListFilter(state.hidden.originalList, filter, _hiddenSelect)
  }
})

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

function _sortAndStatsWithFilter<D>(
  inv: InventoryListWithFilter<D>,
  items: Array<D>,
  select: (d: D) => ItemData,
): InventoryListWithFilter<D> {
  sortListSelect(items, inv.originalList.sortType, select);
  inv.originalList.items = items;
  inv.showList = applyListFilter(inv.originalList, inv.filter, select);
  return inv;
}

const reduceSortAuctionBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  auction: _nextSortByPart(state.auction, part, (x) => x),
});

const reduceSortVisibleBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  visible: _nextSortByPartWithFilter(state.visible, part, _visibleSelect),
});

const reduceSortHiddenBy = (state: InventoryState, part: number): InventoryState => ({
  ...state,
  hidden: _nextSortByPartWithFilter(state.hidden, part, _hiddenSelect),
});

const reduceSortAvailableBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  available: _nextSortByPart(state.available, part, (x) => x),
});

const changeHiddenCriteria = (state: InventoryState, newCriteria: any) =>
  loadInventory(
    { ...state, hiddenCriteria: { ...state.hiddenCriteria, ...newCriteria } },
    joinList(state),
  );

const reduceHideByName = (state: InventoryState, name: string): InventoryState =>
  changeHiddenCriteria(state, { name: [...state.hiddenCriteria.name, name] });

const reduceShowByName = (state: InventoryState, name: string): InventoryState =>
  changeHiddenCriteria(state, {
    name: state.hiddenCriteria.name.filter((x) => x !== name),
  });

const reduceHideByContainer = (
  state: InventoryState,
  container: string,
): InventoryState =>
  changeHiddenCriteria(state, {
    container: [...state.hiddenCriteria.container, container],
  });

const reduceShowByContainer = (
  state: InventoryState,
  container: string,
): InventoryState =>
  changeHiddenCriteria(state, {
    container: state.hiddenCriteria.container.filter((x) => x !== container),
  });

const reduceHideByValue = (state: InventoryState, value: string): InventoryState =>
  changeHiddenCriteria(state, { value: Number(value) });

const reduceShowByValue = (state: InventoryState, value: string): InventoryState =>
  changeHiddenCriteria(state, { value: Number(value) - 0.01 });

const reduceShowAll = (state: InventoryState): InventoryState =>
  changeHiddenCriteria(state, emptyCriteria);

const _propagateTradeItemName = (state: InventoryState): InventoryState => ({
  ...state,
  visible: {
    ...state.visible,
    showList: {
      ...state.visible.showList,
      items: state.visible.showList.items.map(d => ({ ...d, c: { ...d.c, showingTradeItem: d.data.n === state.tradeItemData?.name } }))
    }
  }
})

const reduceShowTradingItemData = (state: InventoryState, name: string): InventoryState =>
  _propagateTradeItemName({
    ...state,
    tradeItemData: name === undefined ? undefined : {
      name,
      sortSecuence: {
        favoriteBlueprints: defaultSortSecuence,
        ownedBlueprints: defaultSortSecuence,
      }
    }
  });

const reduceLoadTradingItemData = (state: InventoryState, craftState: CraftState): InventoryState => {
  if (!state.tradeItemData) {
    return state
  }
  const fav = craftState.stared.list.map(name => craftState.blueprints[name]).filter(bp => bp)
  const own = Object.values(craftState.blueprints).filter(bp => !craftState.stared.list.includes(bp.name))
  const m = (list: BlueprintData[]): TradeBlueprintLineData[] => list
    .map(bp => ({ bpName: bp.name, quantity: bp.web?.blueprint.data?.value.materials.find(m => m.name === state.tradeItemData.name)?.quantity }))
    .filter(bp => bp.quantity);

  return {
    ...state,
    tradeItemData: {
      ...state.tradeItemData,
      c: {
        ...state.tradeItemData.c,
        favoriteBlueprints: cloneAndSort(m(fav), state.tradeItemData.sortSecuence?.favoriteBlueprints, _tradeSortColumnDefinition),
        ownedBlueprints: cloneAndSort(m(own), state.tradeItemData.sortSecuence?.favoriteBlueprints, _tradeSortColumnDefinition),
      }
    }
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
  column: number,
): InventoryState => {
  const sortSecuence = nextSortSecuence(state.tradeItemData.sortSecuence[fieldName], column);
  return {
    ...state,
    tradeItemData: {
      ...state.tradeItemData,
      sortSecuence: {
        ...state.tradeItemData.sortSecuence,
        [fieldName]: sortSecuence
      },
      c: {
        ...state.tradeItemData.c,
        [fieldName]: cloneAndSort(state.tradeItemData.c[fieldName], sortSecuence, _tradeSortColumnDefinition),
      }
    }
  }
};

const reduceSortTradeFavoriteBlueprintsBy = (state: InventoryState, column: number): InventoryState =>
  _reduceSortTradeBlueprintsBy('favoriteBlueprints', state, column);

const reduceSortTradeOwnedBlueprintsBy = (state: InventoryState, column: number): InventoryState =>
  _reduceSortTradeBlueprintsBy('ownedBlueprints', state, column);

const reduceAddAvailable = (state: InventoryState, name: string): InventoryState =>
  loadInventory(
    {
      ...state,
      availableCriteria: { name: [...state.availableCriteria.name, name] },
    },
    joinList(state),
  );

const reduceRemoveAvailable = (state: InventoryState, name: string): InventoryState =>
  loadInventory(
    {
      ...state,
      availableCriteria: {
        name: state.availableCriteria.name.filter((n) => n !== name),
      },
    },
    joinList(state),
  );

const cleanForSaveInventoryList = <D>(list: InventoryList<D>): InventoryList<D> => ({
  ...list,
  items: undefined,
  stats: undefined
});

const cleanForSaveInventoryListWithFilter = <L extends InventoryListWithFilter<any>>(list: L): L=> ({
  ...list,
  showList: undefined,
  originalList: cleanForSaveInventoryList(list.originalList)
})

const cleanForSave = (state: InventoryState): InventoryState => ({
  // remove what will be reconstructed in loadInventory
  blueprints: cleanForSaveInventoryListWithFilter(state.blueprints),
  auction: cleanForSaveInventoryList(state.auction),
  visible: cleanForSaveInventoryListWithFilter(state.visible),
  hidden: cleanForSaveInventoryListWithFilter(state.hidden),
  hiddenCriteria: state.hiddenCriteria,
  byStore: undefined, // saved independently because it is too big
  available: cleanForSaveInventoryList(state.available),
  availableCriteria: state.availableCriteria,
  tradeItemData: state.tradeItemData
});

export {
  initialState,
  initialList,
  initialListWithFilter,
  reduceLoadInventoryState,
  reduceSetCurrentInventory,
  reduceSetAuctionExpanded,
  reduceSetAvailableExpanded,
  reduceSetVisibleExpanded,
  reduceSetVisibleFilter,
  reduceSetHiddenExpanded,
  reduceSetHiddenFilter,
  reduceSetBlueprintsExpanded,
  reduceSetBlueprintsFilter,
  reduceSortOwnedBlueprintsBy,
  reduceSortAuctionBy,
  reduceSortVisibleBy,
  reduceSortHiddenBy,
  reduceSortAvailableBy,
  reduceHideByName,
  reduceHideByContainer,
  reduceHideByValue,
  reduceShowByName,
  reduceShowByContainer,
  reduceShowByValue,
  reduceShowAll,
  reduceShowTradingItemData,
  reduceLoadTradingItemData,
  reduceSortTradeFavoriteBlueprintsBy,
  reduceSortTradeOwnedBlueprintsBy,
  reduceAddAvailable,
  reduceRemoveAvailable,
  joinList,
  joinDuplicates,
  cleanForSave,
  cleanForSaveInventoryList,
  cleanForSaveInventoryListWithFilter
};
