import { Inventory, ItemData } from "../../../common/state";
import { multiIncludes } from "../../../common/string";
import {
  InventoryState,
  InventoryList,
  HideCriteria,
  ItemHidden,
  AvailableCriteria,
  InventoryTree,
  InventoryListWithFilter
} from "../state/inventory";
import { initialListByStore, loadInventoryByStore } from "./inventory.byStore";
import {
  cloneSortListSelect,
  nextSortType,
  sortListSelect,
  SORT_NAME_ASCENDING,
  SORT_VALUE_DESCENDING,
} from "./inventory.sort";

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
  blueprints: initialList(true, SORT_NAME_ASCENDING),
  auction: initialList(true, SORT_NAME_ASCENDING),
  visible: initialListWithFilter(true, SORT_VALUE_DESCENDING),
  hidden: initialListWithFilter(false, SORT_NAME_ASCENDING),
  hiddenCriteria: emptyCriteria,
  byStore: initialListByStore(true, SORT_NAME_ASCENDING),
  available: initialList(true, SORT_NAME_ASCENDING),
  availableCriteria: { name: [] },
  ttService: initialList(true, SORT_NAME_ASCENDING),
};

const _visibleSelect = (x: ItemData): ItemData => x;
const _hiddenSelect = (x: ItemHidden): ItemData => x.data;

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

const _getVisible = (list: Array<ItemData>, c: HideCriteria): Array<ItemData> =>
  list.filter((d) => !_isHidden(c)(d));

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
): InventoryState => ({
  ...state,
  blueprints: _sortAndStats({
    ...state.blueprints,
    items: _getBlueprints(list),
  }, (x) => x),
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
  ...state.visible.originalList.items,
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
  },
});

const reduceSetTTServiceExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  ttService: {
    ...state.ttService,
    expanded,
  },
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
    expanded,
  },
})

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
  return {
    ...inv,
    originalList: {
      ...inv.originalList,
      sortType
    },
    showList: {
      ...inv.showList,
      sortType,
      items: cloneSortListSelect(inv.showList.items, sortType, select)
    }
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

const hideByName = (state: InventoryState, name: string): InventoryState =>
  changeHiddenCriteria(state, { name: [...state.hiddenCriteria.name, name] });

const showByName = (state: InventoryState, name: string): InventoryState =>
  changeHiddenCriteria(state, {
    name: state.hiddenCriteria.name.filter((x) => x !== name),
  });

const hideByContainer = (
  state: InventoryState,
  container: string,
): InventoryState =>
  changeHiddenCriteria(state, {
    container: [...state.hiddenCriteria.container, container],
  });

const showByContainer = (
  state: InventoryState,
  container: string,
): InventoryState =>
  changeHiddenCriteria(state, {
    container: state.hiddenCriteria.container.filter((x) => x !== container),
  });

const hideByValue = (state: InventoryState, value: string): InventoryState =>
  changeHiddenCriteria(state, { value: Number(value) });

const showByValue = (state: InventoryState, value: string): InventoryState =>
  changeHiddenCriteria(state, { value: Number(value) - 0.01 });

const showAll = (state: InventoryState): InventoryState =>
  changeHiddenCriteria(state, emptyCriteria);

const addAvailable = (state: InventoryState, name: string): InventoryState =>
  loadInventory(
    {
      ...state,
      availableCriteria: { name: [...state.availableCriteria.name, name] },
    },
    joinList(state),
  );

const removeAvailable = (state: InventoryState, name: string): InventoryState =>
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
  blueprints: cleanForSaveInventoryList(state.blueprints),
  auction: cleanForSaveInventoryList(state.auction),
  visible: cleanForSaveInventoryListWithFilter(state.visible),
  hidden: cleanForSaveInventoryListWithFilter(state.hidden),
  hiddenCriteria: state.hiddenCriteria,
  byStore: undefined, // saved independently because it is too big
  available: cleanForSaveInventoryList(state.available),
  availableCriteria: state.availableCriteria,
  ttService: cleanForSaveInventoryList(state.ttService)
});

export {
  initialState,
  initialList,
  initialListWithFilter,
  reduceLoadInventoryState,
  reduceSetCurrentInventory,
  reduceSetAuctionExpanded,
  reduceSetAvailableExpanded,
  reduceSetTTServiceExpanded,
  reduceSetVisibleExpanded,
  reduceSetVisibleFilter,
  reduceSetHiddenExpanded,
  reduceSetHiddenFilter,
  reduceSetBlueprintsExpanded,
  reduceSortAuctionBy,
  reduceSortVisibleBy,
  reduceSortHiddenBy,
  reduceSortAvailableBy,
  hideByName,
  hideByContainer,
  hideByValue,
  showByName,
  showByContainer,
  showByValue,
  showAll,
  addAvailable,
  joinList,
  joinDuplicates,
  removeAvailable,
  cleanForSave,
  cleanForSaveInventoryListWithFilter
};
