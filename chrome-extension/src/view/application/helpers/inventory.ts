import { Inventory, ItemData } from "../../../common/state";
import {
  InventoryState,
  InventoryList,
  HideCriteria,
  ItemHidden,
  AvailableCriteria,
  InventoryTree,
} from "../state/inventory";
import {
  cloneSortListSelect,
  nextSortType,
  sortListSelect,
  SORT_NAME_ASCENDING,
  SORT_VALUE_DESCENDING,
} from "./inventorySort";

const emptyCriteria: HideCriteria = {
  name: [],
  container: [],
  value: -0.01,
};

const initialList = (expanded: boolean, sortType: number) => ({
  expanded,
  sortType,
  items: [],
  stats: {
    count: 0,
    ped: "0.00",
  },
});

const initialByStore = (expanded: boolean, sortType: number) => ({
  filter: undefined,
  showList: initialList(true, sortType),
  originalList: initialList(expanded, sortType),
});

const initialState: InventoryState = {
  blueprints: initialList(true, SORT_NAME_ASCENDING),
  auction: initialList(true, SORT_NAME_ASCENDING),
  visible: initialList(true, SORT_VALUE_DESCENDING),
  hidden: initialList(false, SORT_NAME_ASCENDING),
  hiddenCriteria: emptyCriteria,
  byStore: initialByStore(true, SORT_NAME_ASCENDING),
  available: initialList(true, SORT_NAME_ASCENDING),
  availableCriteria: { name: [] },
  ttService: initialList(true, SORT_NAME_ASCENDING),
};

function sortAndStats<D>(
  select: (d: D) => ItemData,
  list: InventoryList<D>,
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


function multiIncludes(multiSearch: string, mainStr: string): boolean {
  if (!multiSearch || multiSearch.length == 0)
    return true;

  function check(multi: string[], main: string[]): boolean {
    if (multi.length == 0)
      return true;

    for (let n = 0; n < main.length; n++) {
      if (main[n].includes(multi[0])) {
        const newMain = main.slice(0, n).concat(main.slice(n + 1));
        if (check(multi.slice(1), newMain))
          return true;
      }  
    }

    return false;
  }

  const multi = multiSearch.toLowerCase().split(' ').filter(x => x.length > 0);
  const main = mainStr.toLowerCase().split(' ').filter(x => x.length > 0);
  return check(multi, main);
}

const isHiddenByName = (c: HideCriteria, d: ItemData): boolean =>
  c.name.includes(d.n);
const isHiddenByContainer = (c: HideCriteria, d: ItemData): boolean =>
  c.container.includes(d.c);
const isHiddenByValue = (c: HideCriteria, d: ItemData): boolean =>
  Number(d.v) <= c.value;
const isHidden =
  (c: HideCriteria) =>
  (d: ItemData): boolean =>
    isHiddenByName(c, d) || isHiddenByContainer(c, d) || isHiddenByValue(c, d);

const addCriteria =
  (c: HideCriteria) =>
  (d: ItemData): ItemHidden => ({
    data: d,
    criteria: {
      name: isHiddenByName(c, d),
      container: isHiddenByContainer(c, d),
      value: isHiddenByValue(c, d),
    },
  });

const getBlueprints = (list: Array<ItemData>): Array<ItemData> =>
  list.filter((d) => d.n.includes("Blueprint"));

const getAuction = (list: Array<ItemData>): Array<ItemData> =>
  list.filter((d) => d.c === "AUCTION");

const getVisible = (list: Array<ItemData>, c: HideCriteria): Array<ItemData> =>
  list.filter((d) => !isHidden(c)(d));

const getHidden = (list: Array<ItemData>, c: HideCriteria): Array<ItemHidden> =>
  list.filter(isHidden(c)).map(addCriteria(c));

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

const getAvailable = (
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

const getByStore = (list: Array<ItemData>): Array<InventoryTree<ItemData>> => {
  const r = list.reduce((r, d) => {
    const c = `${d.c};${d.r}`;
    if (!r[c]) {
      r[c] = [];
    }
    r[c].push(d);
    return r;
  }, {} as { [c: string]: Array<ItemData> })
 
  function getList(items: Array<ItemData>): InventoryList<InventoryTree<ItemData>> {
    if (!items) return undefined

    return {
      expanded: true,
      sortType: SORT_NAME_ASCENDING,
      items: items.map((d) => ({
        data: d,
        list: getList(r[`${d.n};${d.id}`])
      })),
      stats: undefined
    }
  }

  let id = -1
  return Object.entries(r).filter(([c, _]) => c.endsWith(';0')).map(([c, items]) => ({
    data: {
      id: (id--).toString(),
      q: '',
      v: '',
      n: c.split(';')[0],
      c: ''
    },
    list: getList(items)
  }))
}

const loadInventory = (
  state: InventoryState,
  list: Array<ItemData>,
): InventoryState => ({
  ...state,
  blueprints: sortAndStats((x) => x, {
    ...state.blueprints,
    items: getBlueprints(list),
  }),
  auction: sortAndStats((x) => x, {
    ...state.auction,
    items: getAuction(list),
  }),
  visible: sortAndStats((x) => x, {
    ...state.visible,
    items: getVisible(list, state.hiddenCriteria),
  }),
  hidden: sortAndStats((x) => x.data, {
    ...state.hidden,
    items: getHidden(list, state.hiddenCriteria),
  }),
  available: sortAndStats((x) => x, {
    ...state.available,
    items: getAvailable(list, state.availableCriteria),
  }),
  byStore: (() => {
    const items = getByStore(list);
    const originalList = {
      ...state.byStore.originalList,
      items
    }
    return {
      ...state.byStore,
      showList: applyByStoreFilter(originalList, state.byStore.filter),
      originalList
    }
  })()
});

const joinList = (state: InventoryState): Array<ItemData> => [
  ...state.visible.items,
  ...state.hidden.items.map((x) => x.data),
];

const loadInventoryState = (
  oldState: InventoryState,
  state: InventoryState,
): InventoryState => loadInventory(state, joinList(oldState));

const setCurrentInventory = (
  state: InventoryState,
  inventory: Inventory,
): InventoryState => loadInventory(state, inventory.itemlist);

const setAuctionExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  auction: {
    ...state.auction,
    expanded,
  },
});

const setAvailableExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  available: {
    ...state.available,
    expanded,
  },
});

const setTTServiceExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  ttService: {
    ...state.ttService,
    expanded,
  },
});

const setVisibleExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  visible: {
    ...state.visible,
    expanded,
  },
});

const setHiddenExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  hidden: {
    ...state.hidden,
    expanded,
  },
});

const setBlueprintsExpanded = (
  state: InventoryState,
  expanded: boolean,
): InventoryState => ({
  ...state,
  blueprints: {
    ...state.blueprints,
    expanded,
  },
})

const setByStoreExpanded = (
  state: InventoryState,
  expanded: boolean
): InventoryState => ({
  ...state,
  byStore: {
    ...state.byStore,
    originalList: {
      ...state.byStore.originalList,
      expanded
    }
  }
})

const setByStoreExpandedItems = (
  items: Array<InventoryTree<ItemData>>,
  id: string,
  expanded: boolean
): Array<InventoryTree<ItemData>> => items.map((tree) => ({
  ...tree,
  list: tree.list ? {
    ...tree.list,
    expanded: tree.data.id === id ? expanded : tree.list.expanded,
    items: setByStoreExpandedItems(tree.list.items, id, expanded)
  } : undefined,
}))

const setByStoreItemExpanded = (
  state: InventoryState,
  id: string,
  expanded: boolean
): InventoryState => ({
  ...state,
  byStore: {
    ...state.byStore,
    showList: {
      ...state.byStore.showList,
      items: setByStoreExpandedItems(state.byStore.showList.items, id, expanded)
    }
  }
})

const setByStoreInventoryFilter = (
  state: InventoryState,
  filter: string
): InventoryState => ({
  ...state,
  byStore: {
    ...state.byStore,
    filter,
    showList: applyByStoreFilter(state.byStore.originalList, filter)
  }
})

const applyByStoreFilter = (
  list: InventoryList<InventoryTree<ItemData>>,
  filter: string
): InventoryList<InventoryTree<ItemData>> => {
  const items = list.items
    .map((tree) => ({
      ...tree,
      list: tree.list ? applyByStoreFilter(tree.list, filter) : undefined
    }))
    .filter((tree) => multiIncludes(filter, tree.data.n) || tree.list && tree.list.items.length > 0);

  const sum = items.reduce(
    (partialSum, tree) => partialSum + Number(tree.data.v) + Number(tree.list?.stats.ped || 0),
    0,
  );

  return {
    ...list,
    expanded: true,
    items,
    stats: {
      count: items.length,
      ped: sum.toFixed(2)
    }
  }
}

function sortByPart<D>(
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

const sortAuctionBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  auction: sortByPart(state.auction, part, (x) => x),
});

const sortVisibleBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  visible: sortByPart(state.visible, part, (x) => x),
});

const sortHiddenBy = (state: InventoryState, part: number): InventoryState => ({
  ...state,
  hidden: sortByPart(state.hidden, part, (x) => x.data),
});

const sortAvailableBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  available: sortByPart(state.available, part, (x) => x),
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

const cleanForSave = (state: InventoryState): InventoryState => {
  const cState = JSON.parse(JSON.stringify(state));
  // items and stats can be reconstructed
  Object.keys(cState).forEach((k) => {
    delete cState[k].items;
    delete cState[k].stats;
  });
  delete cState.byStore.showList; // calculation will be reconstructed
  delete cState.byStore.originalList; // TODO: fix to save expanded state
  return cState;
};

export {
  initialState,
  initialList,
  loadInventoryState,
  setCurrentInventory,
  setAuctionExpanded,
  setAvailableExpanded,
  setTTServiceExpanded,
  setVisibleExpanded,
  setHiddenExpanded,
  setBlueprintsExpanded,
  setByStoreExpanded,
  setByStoreItemExpanded,
  setByStoreInventoryFilter,
  sortAuctionBy,
  sortVisibleBy,
  sortHiddenBy,
  sortAvailableBy,
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
};
