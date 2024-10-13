import { Inventory, ItemData } from "../../../common/state";
import {
  InventoryState,
  InventoryList,
  HideCriteria,
  ItemHidden,
  AvailableCriteria,
  InventoryTree,
  InventoryListWithFilter,
  InventoryByStore,
  ContainerMapData,
  ContainerMapDataItem,
  BasicItemData,
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

const initialListByStore = (expanded: boolean, sortType: number): InventoryByStore => ({
  ...initialListWithFilter(expanded, sortType),
  containers: { }
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

const visibleSelect = (x: ItemData): ItemData => x;
const hiddenSelect = (x: ItemHidden): ItemData => x.data;

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

function sortAndStatsWithFilter<D>(
  select: (d: D) => ItemData,
  inv: InventoryListWithFilter<D>,
  items: Array<D>
): InventoryListWithFilter<D> {
  const originalList = sortAndStats(select, { ...inv.originalList, items });
  return {
    ...inv,
    originalList,
    showList: applyListFilter(originalList, inv.filter, select),
  }
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

const getByStore = (list: Array<ItemData>, oldContainers: ContainerMapData): { items: Array<InventoryTree<ItemData>>, containers: ContainerMapData } => {
  // get root and children of the tree
  let nextRootContainerId = -1
  const listContainers = list.reduce((st, d) => {
    let containerId = d.r;
    if (!containerId ||containerId === '0') {
      if (!st.root[d.c]) {
        st.root[d.c] = (nextRootContainerId--).toString();
      }
      containerId = st.root[d.c];
    }

    if (!st.children[containerId]) {
      st.children[containerId] = [];
    }
    st.children[containerId].push(d);
    return st;
  }, { root: {}, children: {} } as { root: { [name: string]: string }, children: { [id: string]: Array<ItemData> } })

  // update the id in containers based on data and items
  const oldContainersByName = Object.values(oldContainers).reduce((st, c) => {
    const name = c.data ? c.data.n : c.name; // root containers don't have data
    if (!st[name]) {
      st[name] = [];
    }
    st[name].push(c);
    return st;
  }, {} as { [name: string]: Array<ContainerMapDataItem> });

  const listByName = list.reduce((st, d) => {
    if (!st[d.n]) {
      st[d.n] = [];
    }
    st[d.n].push(d);
    return st;
  }, {} as { [name: string]: Array<ItemData> });

  const containers = { }
  for (const [name, oldList] of Object.entries(oldContainersByName)) {
    const rootContainerId = listContainers.root[name]
    if (rootContainerId) {
      containers[rootContainerId] = oldList[0];
      continue;
    }

    const toMatch = listByName[name]?.filter((d) => listContainers.children[d.id]).map((d) => ({
      id: d.id,
      data: d,
      items: listContainers.children[d.id]
    }));
    if (toMatch && toMatch.length > 0) {
      // calculate hamming distance from each element in oldList to each element in toMatch
      // add 1 for different data.v, in items ignore order matching by n
      const hammingDistance = (a: ContainerMapDataItem, b: { id: string, data: ItemData, items: Array<ItemData> }) => {
        let distance = 0;
        if (a.data.v !== b.data.v) {
          distance += 1;
        }
        const itemsA = a.items.sort((a, b) => a.n.localeCompare(b.n));
        const itemsB = b.items.sort((a, b) => a.n.localeCompare(b.n));
        const lenA = itemsA.length;
        const lenB = itemsB.length;
        let j = 0;
        let k = 0;
        while (j < lenA && k < lenB) {
          if (itemsA[j].n < itemsB[k].n) {
            j++;
            distance++;
          } else if (itemsA[j].n > itemsB[k].n) {
            k++;
            distance++;
          } else {
            j++;
            k++;
          }
        }
        distance += lenA - j + lenB - k;
        return distance;
      }

      // get the ones with less distance, add it to containers remove them from the lists and repeat
      while (oldList.length > 0) {
        let bestMatch: {a: ContainerMapDataItem, b: { id: string, data: ItemData, items: Array<ItemData> }, distance: number} | undefined;
        for (const a of oldList) {
          for (const b of toMatch) {
            const distance = hammingDistance(a, b);
            if (!bestMatch || distance < bestMatch.distance) {
              bestMatch = { a, b, distance };
            }
          }
        }

        if (!bestMatch) break;
        
        containers[bestMatch.b.id] = bestMatch.a;
        oldList.splice(oldList.indexOf(bestMatch.a), 1);
        toMatch.splice(toMatch.indexOf(bestMatch.b), 1);
      }
    }

    for (const c of oldList) {
      containers[nextRootContainerId--] = c; // save them just in case the container is found in the future
    }
  }

  // add missing containers and update container data and items\
  for (const [n, id] of Object.entries(listContainers.root)) {
    if (!containers[id]) {
      containers[id] = {
        expanded: true,
        name: n
      }
    }
  }
  for (const d of list) {
    const ch = listContainers.children[d.id]
    if (!ch) continue // not a container
    if (!containers[d.id]) {
      containers[d.id] = {
        expanded: true,
        name: d.n
      }
    }
    const toBasic = (d: ItemData): BasicItemData => ({ n: d.n, q: d.q, v: d.v })
    containers[d.id].data = toBasic(d)
    containers[d.id].items = ch.map(toBasic)
  }

  // create tree
  function getList(id: string): InventoryList<InventoryTree<ItemData>> {
    const items = listContainers.children[id]
    if (!items) return undefined

    return {
      expanded: containers[id].expanded,
      sortType: SORT_NAME_ASCENDING,
      items: items.map((d) => ({
        data: d,
        name: containers[d.id]?.name ?? d.n,
        list: getList(d.id)
      })),
      stats: undefined
    }
  }

  const resultItems = Object.entries(listContainers.root).map(([name, id]) => ({
    data: {
      id,
      q: '',
      v: '',
      n: '',
      c: ''
    },
    name,
    list: getList(id)
  }))

  return { items: resultItems, containers }
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
  visible: sortAndStatsWithFilter(visibleSelect, state.visible, getVisible(list, state.hiddenCriteria)),
  hidden: sortAndStatsWithFilter(hiddenSelect, state.hidden, getHidden(list, state.hiddenCriteria)),
  available: sortAndStats((x) => x, {
    ...state.available,
    items: getAvailable(list, state.availableCriteria),
  }),
  byStore: (() => {
    const { items, containers } = getByStore(list, state.byStore.containers);
    const originalList = {
      ...state.byStore.originalList,
      items
    }
    return {
      ...state.byStore,
      containers,
      originalList,
      showList: applyByStoreFilter('', originalList, state.byStore.containers, state.byStore.filter),
    }
  })()
});

const joinList = (state: InventoryState): Array<ItemData> => [
  ...state.visible.originalList.items,
  ...state.hidden.originalList.items.map(hiddenSelect),
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
    originalList: {
      ...state.visible.originalList,
      expanded
    }
  }
});

const setHiddenExpanded = (
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

const reduceSetByStoreInventoryExpanded = (
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

const _applyByStoreItemsChange = (
  items: Array<InventoryTree<ItemData>>,
  id: string,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>
): { items: Array<InventoryTree<ItemData>>, tree: InventoryTree<ItemData> } => {
  let resultTree = undefined
  const resultItems = []
  for (const tree of items) {
    if (tree.data.id === id) {
      resultTree = f(tree)
      resultItems.push(resultTree)
    } else if (tree.list) {
      const { items: newItems, tree: newTree } = _applyByStoreItemsChange(tree.list.items, id, f)
      if (!resultTree) {
        resultTree = newTree
      }
      resultItems.push({
        ...tree,
        list: {
          ...tree.list,
          items: newItems
        }
      })
    } else {
      resultItems.push(tree)
    }
  }
  return {
    items: resultItems,
    tree: resultTree
  }
}

const _applyByStoreStateChange = (
  state: InventoryState,
  id: string,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>,
  g?: ((i: InventoryTree<ItemData>, j: ContainerMapDataItem) => ContainerMapDataItem)
): InventoryState => {
  const { items, tree } = _applyByStoreItemsChange(state.byStore.showList.items, id, f)
  return {
    ...state,
    byStore: {
      ...state.byStore,
      showList: {
        ...state.byStore.showList,
        items
      },
      containers: g && state.byStore.containers[id] ? { ...state.byStore.containers, [id]: g(tree, state.byStore.containers[id]) } : state.byStore.containers
    }
  }
}

const reduceSetByStoreItemExpanded = (
  state: InventoryState,
  id: string,
  expanded: boolean
): InventoryState => _applyByStoreStateChange(state, id, t => ({ ...t, list: t.list ? { ...t.list, expanded } : undefined }), (_, s) => state.byStore.filter ? { ...s, expandedOnFilter: expanded } : { ...s, expanded })

const reduceStartByStoreItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _applyByStoreStateChange(state, id, t => ({ ...t, editing: { originalName: t.name} }))

const reduceConfirmByStoreItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _applyByStoreStateChange(state, id, t => ({ ...t, editing: undefined, name: t.name.length > 0 ? t.name : t.data.n }), (t,s) => ({ ...s, name: t.name }))

const reduceCancelByStoreItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _applyByStoreStateChange(state, id, t => ({ ...t, editing: undefined, name: t.editing.originalName }))

const reduceSetByStoreItemName = (
  state: InventoryState,
  id: string,
  name: string
): InventoryState => _applyByStoreStateChange(state, id, t => ({ ...t, name }))

const setVisibleFilter = (
  state: InventoryState,
  filter: string
): InventoryState => ({
  ...state,
  visible: {
    ...state.visible,
    filter,
    showList: applyListFilter(state.visible.originalList, filter, visibleSelect)
  }
})

const setHiddenFilter = (
  state: InventoryState,
  filter: string
): InventoryState => ({
  ...state,
  hidden: {
    ...state.hidden,
    filter,
    showList: applyListFilter(state.hidden.originalList, filter, hiddenSelect)
  }
})

const reduceSetByStoreInventoryFilter = (
  state: InventoryState,
  filter: string
): InventoryState => filter === undefined || filter.length === 0 ? {
  ...state,
  byStore: {
    ...state.byStore,
    filter: undefined,
    showList: applyByStoreFilter('', state.byStore.originalList, state.byStore.containers, undefined),
    containers: Object.fromEntries(
      Object.entries(state.byStore.containers).map(([k, v]) => [k, { ...v, expandedOnFilter: undefined }]))
  },
} : {
  ...state,
  byStore: {
    ...state.byStore,
    filter,
    showList: applyByStoreFilter('', state.byStore.originalList, state.byStore.containers, filter, true)
  }
}

const applyByStoreFilter = (
  id: string,
  list: InventoryList<InventoryTree<ItemData>>,
  containers: ContainerMapData,
  filter: string,
  expandedOnFilter?: boolean
): InventoryList<InventoryTree<ItemData>> => {
  const items = list.items
    .map((tree) => ({
      ...tree,
      list: tree.list ? applyByStoreFilter(tree.data.id, tree.list, containers, filter, expandedOnFilter) : undefined
    }))
    .filter((tree) => multiIncludes(filter, tree.name) || tree.list && tree.list.items.length > 0);

  const sum = items.reduce(
    (partialSum, tree) => partialSum + Number(tree.data.v) + Number(tree.list?.stats.ped || 0),
    0,
  );

  const expanded = filter ?
    expandedOnFilter ?? containers[id]?.expandedOnFilter ?? true :
    list.expanded;

  return {
    ...list,
    expanded,
    items,
    stats: {
      count: items.length,
      ped: sum.toFixed(2)
    }
  }
}

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

function sortByPartWithFilter<D>(
  inv: InventoryListWithFilter<D>,
  part: number,
  select: (d: D) => ItemData,
): InventoryListWithFilter<D> {
  const originalList = sortByPart(inv.originalList, part, select)
  return {
    ...inv,
    originalList,
    showList: applyListFilter(originalList, inv.filter, select)
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
  visible: sortByPartWithFilter(state.visible, part, visibleSelect),
});

const sortHiddenBy = (state: InventoryState, part: number): InventoryState => ({
  ...state,
  hidden: sortByPartWithFilter(state.hidden, part, hiddenSelect),
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

const cleanForSaveContainers = (containers: ContainerMapData): ContainerMapData => {
  const map = { }
  for (const [id, c] of Object.entries(containers)) {
    if (c.expanded && c.expandedOnFilter !== false && (!c.data || c.name === c.data.n)) continue // default data
    map[id] = c
  }
  return map;
}

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

const cleanForSaveByStore = (state: InventoryByStore): InventoryByStore => ({
  ...cleanForSaveInventoryListWithFilter(state),
  containers: cleanForSaveContainers(state.containers)
})

export {
  initialState,
  initialList,
  loadInventoryState,
  setCurrentInventory,
  setAuctionExpanded,
  setAvailableExpanded,
  setTTServiceExpanded,
  setVisibleExpanded,
  setVisibleFilter,
  setHiddenExpanded,
  setHiddenFilter,
  setBlueprintsExpanded,
  reduceSetByStoreInventoryExpanded,
  reduceSetByStoreItemExpanded,
  reduceSetByStoreInventoryFilter,
  reduceStartByStoreItemNameEditing,
  reduceConfirmByStoreItemNameEditing,
  reduceCancelByStoreItemNameEditing,
  reduceSetByStoreItemName,
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
  cleanForSaveByStore,
};
