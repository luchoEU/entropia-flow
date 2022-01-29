import { STATE_1_MIN } from "../../../background/stateConst";
import { URL_MY_ITEMS } from "../../../common/const";
import { Inventory, ItemData } from "../../../common/state";
import { InventoryState, InventoryList } from "../state/inventory";
import { cloneSortList, nextSortType, sortList, SORT_NAME_ASCENDING, SORT_VALUE_DESCENDING } from "./sort";

const initialState: InventoryState = {
    visible: {
        expanded: true,
        sortType: SORT_VALUE_DESCENDING,
        items: []
    },
    hidden: {
        expanded: false,
        sortType: SORT_NAME_ASCENDING,
        items: []
    },
    hiddenNames: []
}

function sort(list: InventoryList): InventoryList {
    sortList(list.items, list.sortType)
    return list
}

const loadInventory = (state: InventoryState, list: Array<ItemData>): InventoryState => ({
    ...state,
    visible: sort({
        ...state.visible,
        items: list.filter(x => !state.hiddenNames.includes(x.n))
    }),
    hidden: sort({
        ...state.hidden,
        items: list.filter(x => state.hiddenNames.includes(x.n))
    })
})

const loadInventoryState = (oldState: InventoryState, state: InventoryState): InventoryState =>
    loadInventory(state, [...oldState.visible.items, ...oldState.hidden.items])

const setCurrentInventory = (state: InventoryState, inventory: Inventory): InventoryState =>
    loadInventory(state, inventory.itemlist)

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

function sortByPart(list: InventoryList, part: number) {
    const sortType = nextSortType(part, list.sortType)
    return {
        ...list,
        sortType,
        items: cloneSortList(list.items, sortType)
    }
}

const sortVisibleBy = (state: InventoryState, part: number): InventoryState => ({
    ...state,
    visible: sortByPart(state.visible, part)
})

const sortHiddenBy = (state: InventoryState, part: number): InventoryState => ({
    ...state,
    hidden: sortByPart(state.hidden, part)
})

const moveToHidden = (state: InventoryState, name: string): InventoryState => ({
    ...state,
    visible: {
        ...state.visible,
        items: state.visible.items.filter(x => x.n !== name)
    },
    hidden: sort({
        ...state.hidden,
        items: [...state.hidden.items, ...state.visible.items.filter(x => x.n === name)]
    }),
    hiddenNames: [...state.hiddenNames, name]
})

const moveToVisible = (state: InventoryState, name: string): InventoryState => ({
    ...state,
    visible: sort({
        ...state.visible,
        items: [...state.visible.items, ...state.hidden.items.filter(x => x.n === name)]
    }),
    hidden: {
        ...state.hidden,
        items: state.hidden.items.filter(x => x.n !== name)
    },
    hiddenNames: state.hiddenNames.filter(x => x !== name)
})

export {
    initialState,
    loadInventoryState,
    setCurrentInventory,
    setVisibleExpanded,
    setHiddenExpanded,
    sortVisibleBy,
    sortHiddenBy,
    moveToHidden,
    moveToVisible
}
