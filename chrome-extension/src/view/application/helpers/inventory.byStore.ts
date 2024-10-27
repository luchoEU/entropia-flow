import { ItemData } from "../../../common/state";
import { multiIncludes } from "../../../common/string";
import {
  InventoryState,
  InventoryList,
  InventoryTree,
  InventoryByStore,
  ContainerMapData,
  ContainerMapDataItem,
  BasicItemData,
  TreeLineData,
} from "../state/inventory";
import { cleanForSaveInventoryListWithFilter, initialList, initialListWithFilter } from "./inventory";
import {
  cloneSortListSelect,
  nextSortType,
  sortListSelect,
  SORT_NAME_ASCENDING,
} from "./inventory.sort";

const initialListByStore = (expanded: boolean, sortType: number): InventoryByStore => ({
  ...initialListWithFilter(expanded, sortType),
  containers: { },
  stared: { filter: undefined, expanded: [], list: initialList(expanded, sortType) },
  flat: { original: [], show: [], stared: [] },
});

const _getByStore = (list: Array<ItemData>, oldContainers: ContainerMapData): { items: Array<InventoryTree<ItemData>>, containers: ContainerMapData } => {
  // get root and children of the tree
  let nextRootContainerId = -1
  const listContainers = list.reduce((st, d) => {
    let containerId = d.r;
    if (!containerId || containerId === '0') {
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
    const name = c.data ? c.data.n : c.displayName; // root containers don't have data
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

  const containers: ContainerMapData = { }
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
  for (const [n, id] of Object.entries(listContainers.root)) { // Root containers
    if (!containers[id]) {
      containers[id] = {
        expanded: false,
        stared: false,
        displayName: n
      }
    }
  }
  for (const d of list) { // Non-root containers
    const ch = listContainers.children[d.id]
    if (!ch) continue // skip, not a container
    if (!containers[d.id]) {
      containers[d.id] = {
        expanded: false,
        stared: false,
        displayName: d.n
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
      items: items.map((d) => {
        const list = getList(d.id)
        return {
          data: d,
          canEditName: !!list,
          displayName: containers[d.id]?.displayName ?? d.n,
          stared: containers[d.id]?.stared ?? false,
          list,
          showItemValueRow: true
        }
      }),
      stats: undefined
    }
  }

  const resultItems: Array<InventoryTree<ItemData>> = Object.entries(listContainers.root).map(([name, id]) => ({
    data: {
      id,
      q: '',
      v: '',
      n: '',
      c: ''
    },
    canEditName: false,
    displayName: name,
    stared: containers[id]?.stared ?? false,
    list: getList(id)
  }))

  return { items: resultItems, containers }
}

const _flatTree = (list: InventoryList<InventoryTree<ItemData>>, indent: number, expanded?: boolean): Array<TreeLineData> => list.items.flatMap(i => [
  {
    ...i.data,
    indent,
    expanded: i.list && (expanded || i.list.expanded),
    hasChildren: i.list !== undefined,
    n: i.displayName
  },
  ...i.list && (expanded || i.list.expanded) ? _flatTree(i.list, indent + 1, expanded) : []
])

const _loadByStoreStaredList = (
  byStore: InventoryByStore
): InventoryByStore => {
  const staredItems: Array<InventoryTree<ItemData>> = []

  const process = (path: Array<string>) => (i: InventoryTree<ItemData>): InventoryTree<ItemData> => {
    // Fix id to be unique on all tree, load expanded, and set container with the root
    const newPath = [ ...path, i.data.id ]
    return {
      ...i,
      data: {
        ...i.data,
        id: newPath.join('.')
      },
      list: i.list ? {
        ...i.list,
        expanded: byStore.stared.expanded.includes(i.data.id),
        items: i.list.items.map(process(newPath)),
      }: undefined
    }
  }
  function add(list: InventoryList<InventoryTree<ItemData>>, planet?: string) {
    for (const i of list.items) {
      if (i.stared) staredItems.push(process([])(i))
      if (i.list) add(i.list)
    }
  }
  add(byStore.originalList)

  byStore.stared.list = _applyByStoreFilter4('', {
    ...byStore.stared.list,
    items: staredItems
  }, byStore.stared.filter, () => true)
  byStore = _sortByStore(_staredListSelector, byStore)
  byStore.flat.stared = _flatTree(byStore.stared.list, 0)
  return byStore
}

const _loadByStoreShowList = (
  byStore: InventoryByStore
): InventoryByStore => {
  byStore = _sortByStore(_showListSelector, {
    ...byStore,
    showList: _applyByStoreFilter(byStore.originalList, byStore.containers, byStore.filter),
  })
  byStore.flat.show = _flatTree(byStore.showList, 0)
  return byStore
}

const _loadByStoreOriginalList = (
  byStore: InventoryByStore
): InventoryByStore => {
  const loadExpanded = (id: string, list: InventoryList<InventoryTree<ItemData>>): InventoryList<InventoryTree<ItemData>> => ({
    ...list,
    expanded: byStore.containers[id]?.expanded ?? list.expanded,
    items: list.items.map((i) => ({
      ...i,
      list: i.list ? loadExpanded(i.data.id, i.list) : undefined
    }))
  })
  const originalList = loadExpanded('', byStore.originalList)
  return {
    ...byStore,
    originalList,
    flat: {
      ...byStore.flat,
      original: _flatTree(originalList, 0, true)
    }
  }
}

const _loadByStoreShowAndStaredList = (
  byStore: InventoryByStore
): InventoryByStore => _loadByStoreStaredList(_loadByStoreShowList(_loadByStoreOriginalList(byStore)))

const loadInventoryByStore = (
  byStore: InventoryByStore,
  list: Array<ItemData>,
): InventoryByStore => {
  const { items, containers } = _getByStore(list, byStore.containers);
  const originalList = {
    ...byStore.originalList,
    items
  }

  function getPlanetName(name: string): string {
    if (name.startsWith('STORAGE (')) {
      return name.replace('STORAGE (', '').replace(')', '').replace('Planet', '').trim()
    } else {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    }
  }
  function setPlanet(list: InventoryList<InventoryTree<ItemData>>, planet?: string) {
    for (const i of list.items) {
      const iPlanet = planet ?? getPlanetName(i.displayName)
      i.data = { ...i.data, c: iPlanet }
      if (i.list) setPlanet(i.list, iPlanet)
    }
  }
  setPlanet(originalList)

  return _loadByStoreShowAndStaredList({
    ...byStore,
    containers,
    originalList,
  })
};

const reduceSetByStoreInventoryExpanded = (
  state: InventoryState,
  expanded: boolean
): InventoryState => _partialSetState(_originalListSelector, state, { expanded })

const reduceSetByStoreStaredInventoryExpanded = (
  state: InventoryState,
  expanded: boolean
): InventoryState => _partialSetState(_staredListSelector, state, { expanded })

const _applyByStoreItemsChange = (
  items: Array<InventoryTree<ItemData>>,
  id: string,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>
): { items: Array<InventoryTree<ItemData>>, tree: InventoryTree<ItemData> } => {
  let resultTree = undefined
  const resultItems = []
  for (const tree of items) {
    if (resultTree) {
      resultItems.push(tree)
    } else if (tree.data.id === id) {
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

const _applyByStoreAllItemsChange = (
  list: InventoryList<InventoryTree<ItemData>>,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>
): InventoryList<InventoryTree<ItemData>> => ({
  ...list,
  items: list.items.map(t => {
    const t1 = f(t)
    if (t1.list)
      t1.list = _applyByStoreAllItemsChange(t1.list, f)
    return t1
  })
})

const _toContainerId = (id: string) => id.split('.').slice(-1)[0]

const _findTreeById = (id: string, list: InventoryList<InventoryTree<ItemData>>): InventoryTree<ItemData> => {
  for (const tree of list.items) {
    if (tree.data.id === id) {
      return tree
    } else if (tree.list) {
      const foundTree = _findTreeById(id, tree.list)
      if (foundTree) {
        return foundTree
      }
    }
  }
  return undefined
}

const _applyToAllByStoreList = (
  list: InventoryList<InventoryTree<ItemData>>,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>
): InventoryList<InventoryTree<ItemData>> => ({
  ...list,
  items: list.items.map(t => t.list ? { ...f(t), list: _applyToAllByStoreList(t.list, f) } : f(t))
})

const _partialSet = (sl: ListSelector, s: InventoryByStore, p: Partial<InventoryList<InventoryTree<ItemData>>>): InventoryByStore => sl.set(s, { ...sl.get(s), ...p })
const _partialSetState = (sl: ListSelector, s: InventoryState, p: Partial<InventoryList<InventoryTree<ItemData>>>): InventoryState => ({ ...s, byStore: _partialSet(sl, s.byStore, p) })

const _applyByStoreChange = (
  byStore: InventoryByStore,
  id: string,
  sl: ListSelector,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>,
  g?: ((i: InventoryTree<ItemData>, j: ContainerMapDataItem) => ContainerMapDataItem)
): InventoryByStore => {
  const { items, tree } = _applyByStoreItemsChange(sl.get(byStore).items, id, f)
  const cid = _toContainerId(id)
  return {
    ..._partialSet(sl, byStore, { items }),
    containers: g && byStore.containers[cid] ? { ...byStore.containers, [cid]: g(tree, byStore.containers[cid]) } : byStore.containers
  }
}

const _applyByStoreAllChange = (
  byStore: InventoryByStore,
  sl: ListSelector,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>,
  g?: (c: ContainerMapDataItem) => ContainerMapDataItem
): InventoryByStore => ({
  ...sl.set(byStore, _applyByStoreAllItemsChange(sl.get(byStore), f)),
  containers: g ? Object.fromEntries(
    Object.entries(byStore.containers).map(([k, v]) => [k, g(v)])
  ) : byStore.containers
})

const _applyByStoreStateChange = (
  state: InventoryState,
  id: string,
  sl: ListSelector,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>,
  g?: ((i: InventoryTree<ItemData>, j: ContainerMapDataItem) => ContainerMapDataItem)
): InventoryState => ({
  ...state,
  byStore: _applyByStoreChange(state.byStore, id, sl, f, g)
})

const _applyByStoreStateAllChange = (
  state: InventoryState,
  sl: ListSelector,
  f: (i: InventoryTree<ItemData>) => InventoryTree<ItemData>,
  g?: (c: ContainerMapDataItem) => ContainerMapDataItem
): InventoryState => ({
  ...state,
  byStore: _applyByStoreAllChange(state.byStore, sl, f, g)
})

interface ListSelector {
  get: (byStore: InventoryByStore) => InventoryList<InventoryTree<ItemData>>
  set: (byStore: InventoryByStore, list: InventoryList<InventoryTree<ItemData>>) => InventoryByStore
}

const _originalListSelector: ListSelector = {
  get: (byStore) => byStore.originalList,
  set: (byStore, list) => ({...byStore, originalList: list, flat: { ...byStore.flat, original: _flatTree(list, 0, true) } }),
}

const _showListSelector: ListSelector = {
  get: (byStore) => byStore.showList,
  set: (byStore, list) => ({...byStore, showList: list, flat: { ...byStore.flat, show: _flatTree(list, 0) } }),
}

const _staredListSelector: ListSelector = {
  get: (byStore) => byStore.stared.list,
  set: (byStore, list) => ({...byStore, stared: { ...byStore.stared, list }, flat: { ...byStore.flat, stared: _flatTree(list, 0) } }),
}

const reduceSetByStoreItemExpanded = (
  state: InventoryState,
  id: string,
  expanded: boolean
): InventoryState => _applyByStoreStateChange(state, id, _showListSelector, t => ({ ...t, list: t.list ? { ...t.list, expanded } : undefined }), (_, s) => state.byStore.filter ? { ...s, expandedOnFilter: expanded } : { ...s, expanded })

const reduceSetByStoreAllItemsExpanded = (
  state: InventoryState,
  expanded: boolean
): InventoryState => _applyByStoreStateAllChange(state, _showListSelector, t => ({ ...t, list: t.list ? { ...t.list, expanded } : undefined }), (s) => state.byStore.filter ? { ...s, expandedOnFilter: expanded } : { ...s, expanded })

const reduceStartByStoreItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _applyByStoreStateChange(state, id, _showListSelector, t => ({ ...t, editing: { originalName: t.displayName} }))

const reduceConfirmByStoreItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _setContainerNameFrom(state, id, _showListSelector)

const reduceCancelByStoreItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _applyByStoreStateChange(state, id, _showListSelector, t => ({ ...t, editing: undefined, displayName: t.editing.originalName }))

const reduceSetByStoreItemName = (
  state: InventoryState,
  id: string,
  name: string
): InventoryState => _applyByStoreStateChange(state, id, _showListSelector, t => ({ ...t, displayName: name }))

const reduceSetByStoreItemStared = (
  state: InventoryState,
  id: string,
  stared: boolean
): InventoryState => {
  const newState = _applyByStoreStateChange(state, id, _originalListSelector, t => ({ ...t, stared }), (_, s) => ({ ...s, stared }))
  return {
    ...newState,
    byStore: _loadByStoreShowAndStaredList(newState.byStore)
  }
}

const reduceSetByStoreStaredItemExpanded = (
  state: InventoryState,
  id: string,
  expanded: boolean
): InventoryState => {
  const newState = _applyByStoreStateChange(state, id, _staredListSelector, t => ({ ...t, list: t.list ? { ...t.list, expanded } : undefined }))
  newState.byStore.stared.expanded = expanded ? [ ...newState.byStore.stared.expanded, id ] : newState.byStore.stared.expanded.filter(i => i !== id)
  return newState
}

const reduceSetByStoreStaredAllItemsExpanded = (
  state: InventoryState,
  expanded: boolean
): InventoryState => {
  const allId = (list: InventoryList<InventoryTree<ItemData>>): Array<string> =>
    list.items.map(i => i.data.id).concat(list.items.flatMap(i => i.list ? allId(i.list) : []))
  const byStore = _applyByStoreAllChange(state.byStore, _staredListSelector, t => ({ ...t, list: t.list ? { ...t.list, expanded } : undefined }))
  byStore.stared.expanded = expanded ? allId(byStore.stared.list) : []
  return { ...state, byStore }
}

const reduceStartByStoreStaredItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _applyByStoreStateChange(state, id, _staredListSelector, t => ({ ...t, editing: { originalName: t.displayName} }))

const _setContainerNameFrom = (
  state: InventoryState,
  id: string,
  sl: ListSelector
): InventoryState => {
  const tree = _findTreeById(id, sl.get(state.byStore))
  const displayName = tree.displayName.length > 0 ? tree.displayName : tree.data.n
  const stableName = tree.stableName ?? tree.editing.originalName
  const cid = _toContainerId(id)
  const newByStore: InventoryByStore = {
    ..._applyByStoreChange(state.byStore, cid, _originalListSelector, t => ({ ...t, displayName, stableName })),
    containers: {
      ...state.byStore.containers,
      [cid]: { ...state.byStore.containers[cid], displayName, stableName }
    }
  }
  return {
    ...state,
    byStore: _loadByStoreShowAndStaredList(newByStore)
  }
}

const reduceConfirmByStoreStaredItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _setContainerNameFrom(state, id, _staredListSelector)

const reduceCancelByStoreStaredItemNameEditing = (
  state: InventoryState,
  id: string
): InventoryState => _applyByStoreStateChange(state, id, _staredListSelector, t => ({ ...t, editing: undefined, displayName: t.editing.originalName }))

const reduceSetByStoreStaredItemName = (
  state: InventoryState,
  id: string,
  name: string
): InventoryState => _applyByStoreStateChange(state, id, _staredListSelector, t => ({ ...t, displayName: name }))

const reduceSetByStoreStaredItemStared = (
  state: InventoryState,
  id: string,
  stared: boolean
): InventoryState => reduceSetByStoreItemStared(state, _toContainerId(id), stared)

const reduceSetByStoreInventoryFilter = (
  state: InventoryState,
  filter: string
): InventoryState => filter === undefined || filter.length === 0 ? {
  ...state,
  byStore: _sortByStore(_showListSelector, {
    ...state.byStore,
    filter: undefined,
    showList: _applyByStoreFilter(state.byStore.originalList, state.byStore.containers),
    containers: Object.fromEntries(
      Object.entries(state.byStore.containers).map(([k, v]) => [k, { ...v, expandedOnFilter: undefined }]))
  }),
} : {
  ...state,
  byStore: _sortByStore(_showListSelector, {
    ...state.byStore,
    filter,
    showList: _applyByStoreFilter4('', state.byStore.originalList, filter, () => true)
  })
}

const reduceSetByStoreStaredInventoryFilter = (
  state: InventoryState,
  filter: string
): InventoryState => filter === undefined || filter.length === 0 ? {
  ...state,
  byStore: _loadByStoreStaredList({
    ...state.byStore,
    stared: {
      ...state.byStore.stared,
      filter: undefined
    }
  })
} : {
  ...state,
  byStore: _loadByStoreStaredList({
    ...state.byStore,
    stared: {
      ...state.byStore.stared,
      filter
    }
  })
}

const _applyByStoreFilter = (
  list: InventoryList<InventoryTree<ItemData>>,
  containers: ContainerMapData,
  filter?: string,
): InventoryList<InventoryTree<ItemData>> =>
  _applyByStoreFilter4('', list, filter, (id) => containers[id]?.expandedOnFilter ?? true);

const _applyByStoreFilter4 = (
  id: string,
  list: InventoryList<InventoryTree<ItemData>>,
  filter: string,
  expandedOnFilter: (id: string) => boolean
): InventoryList<InventoryTree<ItemData>> => {
  let items = list.items
    .map((tree) => ({
      ...tree,
      list: tree.list ? _applyByStoreFilter4(tree.data.id, tree.list, filter, expandedOnFilter) : undefined,
      showItemValueRow: !filter ? tree.showItemValueRow : tree.list && multiIncludes(filter, tree.data.n) && !multiIncludes(filter, tree.displayName)
    }))
    .filter((tree) => multiIncludes(filter, tree.displayName) || multiIncludes(filter, tree.data.n) || tree.list && tree.list.items.length > 0);

  const sum = items.reduce(
    (partialSum, tree) => partialSum + Number(tree.data.v) + Number(tree.list?.stats.ped || 0),
    0,
  );

  // add list own item value to its contained ped total
  items = items.map((tree) => tree.list && tree.showItemValueRow ? {
    ...tree,
    list: {
      ...tree.list,
      stats: {
        ...tree.list.stats,
        ped: (Number(tree.list.stats.ped) + Number(tree.data.v)).toFixed(2)
      }
    }
  } : tree);

  const expanded = filter ? expandedOnFilter(id) : list.expanded;

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

const _byStoreSelectToSort = (x: InventoryTree<ItemData>): ItemData => x.list ? {
  ...x.data,
  n: x.stableName ?? x.displayName,
  q: x.list.stats.count.toString(),
  v: x.list.stats.ped
} : x.data;

const _cloneSortByStoreTreeList = (list: InventoryList<InventoryTree<ItemData>>, sortType: number): InventoryList<InventoryTree<ItemData>> => ({
  ...list,
  sortType,
  items: cloneSortListSelect(list.items, sortType, _byStoreSelectToSort).map(t => t.list ? {
    ...t,
    list: _cloneSortByStoreTreeList(t.list, sortType)
  } : t)
})

const _sortByStoreTreeList = (list: InventoryList<InventoryTree<ItemData>>, sortType: number) => {
  list.sortType = sortType;
  sortListSelect(list.items, sortType, _byStoreSelectToSort);
  list.items.forEach(t => t.list && _sortByStoreTreeList(t.list, sortType));
}

const _nextSortByStore = (
  sl: ListSelector,
  byStore: InventoryByStore,
  part: number,
): InventoryByStore => {
  const sortType = nextSortType(part, sl.get(byStore).sortType);
  const cleanStable = (i: InventoryTree<ItemData>) => ({ ...i, stableName: undefined })
  return sl.set({
    ...byStore,
    containers: Object.fromEntries(
      Object.entries(byStore.containers).map(([key, value]) => [key, { ...value, stableName: undefined }])
    ),
    originalList: {
      ..._applyToAllByStoreList(byStore.originalList, cleanStable),
      sortType: sl === _showListSelector ? sortType : byStore.originalList.sortType
    }
  }, _cloneSortByStoreTreeList(_applyToAllByStoreList(sl.get(byStore), cleanStable), sortType))
}

const _sortByStore = (
  sl: ListSelector,
  byStore: InventoryByStore,
): InventoryByStore => {
  _sortByStoreTreeList(sl.get(byStore), sl.get(byStore).sortType);
  return byStore;
};

const reduceSortByStoreBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  byStore: _nextSortByStore(_showListSelector, state.byStore, part)
});

const reduceSortByStoreStaredBy = (
  state: InventoryState,
  part: number,
): InventoryState => ({
  ...state,
  byStore: _nextSortByStore(_staredListSelector, state.byStore, part)
});

const _cleanForSaveContainers = (containers: ContainerMapData): ContainerMapData => {
  const map = { }
  for (const [id, c] of Object.entries(containers)) {
    if (c.expanded &&
      c.expandedOnFilter !== false &&
      (!c.data || c.displayName === c.data.n) &&
      !c.stared
    ) {
      continue // default data
    }
    map[id] = { ...c, stableName: undefined }
  }
  return map;
}

const cleanForSaveByStore = (state: InventoryByStore): InventoryByStore => ({
  ...cleanForSaveInventoryListWithFilter(state),
  containers: _cleanForSaveContainers(state.containers),
  stared: {
    ...state.stared,
    list: {
      ...state.stared.list,
      items: undefined
    }
  },
  flat: undefined
})

export {
  initialListByStore,
  loadInventoryByStore,
  reduceSetByStoreInventoryExpanded,
  reduceSetByStoreItemExpanded,
  reduceSetByStoreAllItemsExpanded,
  reduceSetByStoreInventoryFilter,
  reduceStartByStoreItemNameEditing,
  reduceConfirmByStoreItemNameEditing,
  reduceCancelByStoreItemNameEditing,
  reduceSetByStoreItemName,
  reduceSetByStoreItemStared,
  reduceSetByStoreStaredInventoryExpanded,
  reduceSetByStoreStaredItemExpanded,
  reduceSetByStoreStaredAllItemsExpanded,
  reduceSetByStoreStaredInventoryFilter,
  reduceStartByStoreStaredItemNameEditing,
  reduceConfirmByStoreStaredItemNameEditing,
  reduceCancelByStoreStaredItemNameEditing,
  reduceSetByStoreStaredItemName,
  reduceSetByStoreStaredItemStared,
  reduceSortByStoreBy,
  reduceSortByStoreStaredBy,
  cleanForSaveByStore,
};
