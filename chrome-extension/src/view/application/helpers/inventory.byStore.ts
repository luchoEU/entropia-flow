import { ItemData } from "../../../common/state";
import { multiIncludes } from "../../../common/filter";
import {
    InventoryState,
    InventoryList,
    InventoryTree,
    InventoryByStore,
    ContainerMapData,
    ContainerMapDataItem,
    BasicItemData,
    TreeLineData,
    InventoryListWithFilter,
} from "../state/inventory";
import { cleanForSaveInventoryList, initialList } from "./inventory";
import {
    cloneSortListSelect,
    nextSortType,
    sortListSelect,
    SORT_NAME_ASCENDING,
} from "./inventory.sort";

const initialListWithFilter = <D>(expanded: boolean, sortType: number): InventoryListWithFilter<D> => ({
    filter: undefined,
    showList: initialList(true, sortType),
    originalList: initialList(expanded, sortType),
});

const initialListByStore = (expanded: boolean, sortType: number): InventoryByStore => ({
    containers: {},
    staredExpanded: [],
    materialExpanded: [],
    items: [],
    staredItems: [],
    materialItems: [],
});

const _getByStore = (list: Array<ItemData>, oldContainers: ContainerMapData): { items: Array<InventoryTree<ItemData>>, containers: ContainerMapData } => {
    // get root and children of the tree
    const mapByName = { }
    for (const d of list) {
        mapByName[d.n] = d.id;
    }
    
    let nextRootContainerId = -1
    const listContainers = list.reduce((st, d) => {
        let containerId = d.r;
        if (!containerId || containerId === '0') {
            containerId = mapByName[d.c];
        }
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
                    if (!a.data) continue;
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
        containers[d.id] = {
            ...containers[d.id],
            data: toBasic(d),
            items: ch.map(toBasic)
        }
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

const _flatTree = (list: InventoryList<InventoryTree<ItemData>>, indent: number, expanded?: boolean): Array<TreeLineData> => list.items.flatMap(tree =>
    !tree.list ? [
        {
            ...tree.data,
            indent,
        }
    ] : (tree.list.items.length === 0 && !tree.showItemValueRow ? [
        {
            ...tree.data,
            indent,
            stared: tree.stared,
            canEditName: tree.canEditName,
            isEditing: tree.editing !== undefined,
            n: tree.displayName,
        }
    ] : [
        {
            ...tree.data,
            indent,
            isContainer: true,
            expanded: expanded || tree.list.expanded,
            stared: tree.stared,
            canEditName: tree.canEditName,
            isEditing: tree.editing !== undefined,
            n: tree.displayName,
            q: `[${tree.list.stats?.count ?? '0'}]`,
            v: tree.list.stats?.ped ?? '0',
        },
        ...expanded || tree.list.expanded ? [
            ...tree.showItemValueRow ? [{
                indent: indent + 1,
                hasChildren: false,
                expanded: undefined,
                id: `(${tree.data.id})`,
                n: `(${tree.data.n === tree.displayName ? 'item': tree.data.n} value)`,
                q: '1',
                v: tree.data.v,
                c: tree.data.c
            }] : [],
            ..._flatTree(tree.list, indent + 1, expanded)
        ] : []
    ])
);

const loadInventoryByStore = (
    byStore: InventoryByStore,
    list: Array<ItemData>,
): InventoryByStore => {
    const { items, containers } = _getByStore(list, byStore.containers);
    const originalList = {
        expanded: false,
        sortType: SORT_NAME_ASCENDING,
        items,
        stats: { count: items.length, ped: '0' }
    }

    function getPlanetName(name: string): string {
        if (name.startsWith('STORAGE (')) {
            return name.replace('STORAGE (', '').replace(')', '').replace('Planet', '').trim()
        } else {
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        }
    }
    function setPlanet(listToUpdate: InventoryList<InventoryTree<ItemData>>, planet?: string) {
        for (const i of listToUpdate.items) {
            const iPlanet = planet ?? getPlanetName(i.displayName)
            i.data = { ...i.data, c: iPlanet }
            if (i.list) setPlanet(i.list, iPlanet)
        }
    }
    setPlanet(originalList)

    // Build flattened tree for main view
    const flatItems = _flatTree(originalList, 0, true)

    // Extract stared items (those with stared property in containers)
    const staredTreeItems: Array<InventoryTree<ItemData>> = []
    const gatherStared = (treeList: InventoryList<InventoryTree<ItemData>>) => {
        for (const tree of treeList.items) {
            if (tree.stared) staredTreeItems.push(tree)
            if (tree.list) gatherStared(tree.list)
        }
    }
    gatherStared(originalList)

    const staredList: InventoryList<InventoryTree<ItemData>> = {
        expanded: false,
        sortType: SORT_NAME_ASCENDING,
        items: staredTreeItems,
        stats: { count: staredTreeItems.length, ped: '0' }
    }
    const flatStaredItems = _flatTree(staredList, 0)

    return {
        containers,
        staredExpanded: byStore.staredExpanded,
        materialExpanded: byStore.materialExpanded,
        items: flatItems,
        staredItems: flatStaredItems,
        materialItems: []
    }
};


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
        list : tree.list ? _applyByStoreFilter4(tree.data.id, tree.list, filter, expandedOnFilter) : undefined,
        showItemValueRow: !filter ? tree.showItemValueRow : tree.list && multiIncludes(filter, tree.data.n) && !multiIncludes(filter, tree.displayName)
    }))
    .filter((tree) => multiIncludes(filter, tree.displayName) || multiIncludes(filter, tree.data.n) || tree.list && tree.list.items.length > 0);
    
    const expanded = filter ? expandedOnFilter(id) : list.expanded;
    
    return {
        ...list,
        expanded,
        items
    }
}

const _addStats = (
    allList: InventoryList<InventoryTree<ItemData>>,
): InventoryList<InventoryTree<ItemData>> => {
    function innerAddStats(dataV: number, list: InventoryList<InventoryTree<ItemData>>): InventoryList<InventoryTree<ItemData>> {
        const items = list.items.map((tree) => {
            const v = tree.showItemValueRow ? Number(tree.data.v) : 0
            let list = tree.list ? innerAddStats(v, tree.list) : undefined
            return {
                ...tree,
                list
            }
        })
        
        const sumCount = items.reduce(
            (partialSum, tree) => partialSum +
            (tree.list ? tree.list.stats.count +
                (tree.list.items.length === 0 || tree.showItemValueRow ? 1 : 0) :
                1), 0);

        const sumPed = dataV + items.reduce(
            (partialSum, tree) => partialSum + (tree.list ? Number(tree.list.stats.ped) : Number(tree.data.v)), 0);
            
        return {
            ...list,
            items,
            stats: {
                count: sumCount,
                ped: sumPed.toFixed(2)
            }
        }
    }
    return innerAddStats(0, allList)
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
    containers: _cleanForSaveContainers(state.containers),
    staredExpanded: state.staredExpanded,
    materialExpanded: state.materialExpanded,
    items: [],
    staredItems: [],
    materialItems: []
})

const fillFromLoadByStore = (state: InventoryByStore): InventoryByStore => state

export {
    initialListByStore,
    loadInventoryByStore,
    cleanForSaveByStore,
    fillFromLoadByStore,
};
