import { Inventory, ItemData } from "../../../common/state";
import { InventoryState, InventoryList, HideCriteria, ItemHidden } from "../state/inventory";
import { cloneSortListSelect, nextSortType, sortList, sortListSelect, SORT_NAME_ASCENDING, SORT_VALUE_DESCENDING } from "./sort";

const emptyCriteria: HideCriteria = {
    name: [],
    container: [],
    value: -0.01
}

const initialState: InventoryState = {
    auction: {
        expanded: true,
        sortType: SORT_NAME_ASCENDING,
        items: [],
        stats: {
            count: 0,
            ped: "0.00"
        }
    },
    visible: {
        expanded: true,
        sortType: SORT_VALUE_DESCENDING,
        items: [],
        stats: {
            count: 0,
            ped: "0.00"
        }
    },
    hidden: {
        expanded: false,
        sortType: SORT_NAME_ASCENDING,
        items: [],
        stats: {
            count: 0,
            ped: "0.00"
        }
    },
    criteria: emptyCriteria
}

function sortAndStats<D>(select: (d: D) => ItemData, list: InventoryList<D>): InventoryList<D> {
    sortListSelect(list.items, list.sortType, select)
    const sum = list.items.reduce((partialSum, d) => partialSum + Number(select(d).v), 0);
    list.stats = {
        count: list.items.length,
        ped: sum.toFixed(2)
    }
    return list
}

const isHiddenByName = (c: HideCriteria, d: ItemData): boolean => c.name.includes(d.n)
const isHiddenByContainer = (c: HideCriteria, d: ItemData): boolean => c.container.includes(d.c)
const isHiddenByValue = (c: HideCriteria, d: ItemData): boolean => Number(d.v) <= c.value
const isHidden = (c: HideCriteria) => (d: ItemData): boolean =>
    isHiddenByName(c, d) || isHiddenByContainer(c, d) || isHiddenByValue(c, d)

const addCriteria = (c: HideCriteria) => (d: ItemData): ItemHidden => ({
    data: d,
    criteria: {
        name: isHiddenByName(c, d),
        container: isHiddenByContainer(c, d),
        value: isHiddenByValue(c, d),
    }
})

const getAuction = (list: Array<ItemData>): Array<ItemData> => list.filter(d => d.c === 'AUCTION')

const getVisible = (list: Array<ItemData>, c: HideCriteria): Array<ItemData> => list.filter(d => !isHidden(c)(d))

const getHidden = (list: Array<ItemData>, c: HideCriteria): Array<ItemHidden> =>
    list.filter(isHidden(c)).map(addCriteria(c))

const loadInventory = (state: InventoryState, list: Array<ItemData>): InventoryState => ({
    ...state,
    auction: sortAndStats(x => x, {
        ...state.auction,
        items: getAuction(list)
    }),
    visible: sortAndStats(x => x, {
        ...state.visible,
        items: getVisible(list, state.criteria)
    }),
    hidden: sortAndStats(x => x.data, {
        ...state.hidden,
        items: getHidden(list, state.criteria)
    })
})

const joinList = (state: InventoryState): Array<ItemData> =>
    [...state.visible.items, ...state.hidden.items.map(x => x.data)]

const loadInventoryState = (oldState: InventoryState, state: InventoryState): InventoryState =>
    loadInventory(state, joinList(oldState))

const setCurrentInventory = (state: InventoryState, inventory: Inventory): InventoryState =>
    loadInventory(state, inventory.itemlist)

const setAuctionExpanded = (state: InventoryState, expanded: boolean): InventoryState => ({
    ...state,
    auction: {
        ...state.visible,
        expanded
    }
})
    
const setVisibleExpanded = (state: InventoryState, expanded: boolean): InventoryState => ({
    ...state,
    visible: {
        ...state.visible,
        expanded
    }
})

const setHiddenExpanded = (state: InventoryState, expanded: boolean): InventoryState => ({
    ...state,
    hidden: {
        ...state.hidden,
        expanded
    }
})

function sortByPart<D>(list: InventoryList<D>, part: number, select: (d: D) => ItemData) {
    const sortType = nextSortType(part, list.sortType)
    return {
        ...list,
        sortType,
        items: cloneSortListSelect(list.items, sortType, select)
    }
}

const sortAuctionBy = (state: InventoryState, part: number): InventoryState => ({
    ...state,
    auction: sortByPart(state.auction, part, x => x)
})

const sortVisibleBy = (state: InventoryState, part: number): InventoryState => ({
    ...state,
    visible: sortByPart(state.visible, part, x => x)
})

const sortHiddenBy = (state: InventoryState, part: number): InventoryState => ({
    ...state,
    hidden: sortByPart(state.hidden, part, x => x.data)
})

const changeCriteria = (state: InventoryState, newCriteria: any) =>
    loadInventory({ ...state, criteria: { ...state.criteria, ...newCriteria } }, joinList(state))

const hideByName = (state: InventoryState, name: string): InventoryState =>
    changeCriteria(state, { name: [...state.criteria.name, name] })

const showByName = (state: InventoryState, name: string): InventoryState =>
    changeCriteria(state, { name: state.criteria.name.filter(x => x !== name) })

const hideByContainer = (state: InventoryState, container: string): InventoryState =>
    changeCriteria(state, { container: [...state.criteria.container, container] })

const showByContainer = (state: InventoryState, container: string): InventoryState =>
    changeCriteria(state, { container: state.criteria.container.filter(x => x !== container) })

const hideByValue = (state: InventoryState, value: string): InventoryState =>
    changeCriteria(state, { value: Number(value) })

const showByValue = (state: InventoryState, value: string): InventoryState =>
    changeCriteria(state, { value: Number(value) - 0.01 })

const showAll = (state: InventoryState): InventoryState =>
    changeCriteria(state, emptyCriteria)

// items and stats can be reconstructed
const cleanForSave = (state: InventoryState): InventoryState => ({
    ...state,
    visible: {
        ...state.visible,
        items: undefined, 
        stats: undefined
    },
    hidden: {
        ...state.hidden,
        items: undefined,
        stats: undefined        
    }
})

export {
    initialState,
    loadInventoryState,
    setCurrentInventory,
    setAuctionExpanded,
    setVisibleExpanded,
    setHiddenExpanded,
    sortAuctionBy,
    sortVisibleBy,
    sortHiddenBy,
    hideByName,
    hideByContainer,
    hideByValue,
    showByName,
    showByContainer,
    showByValue,
    showAll,
    cleanForSave,
}
