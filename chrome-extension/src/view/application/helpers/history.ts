import { CLASS_LAST, CLASS_NEW_DATE, CLASS_REQUESTED } from "../../../common/const";
import { Inventory } from "../../../common/state";
import { getDifference } from "./diff";
import * as Sort from "./inventory.sort"
import { HistoryState, ViewInventory } from "../state/history";

const initialState: HistoryState = {
    expanded: false,
    hiddenError: undefined,
    list: [],
    intervalId: undefined
}

function getText(inventory: Inventory, onlyLastDate?: boolean) {
    let date = new Date()
    date.setTime(inventory.meta.date)
    let d = date.toTimeString().slice(0, 8)
    if (inventory.log !== undefined) {
        if (inventory.log.class === CLASS_NEW_DATE)
            return inventory.log.message
        else
            return `${d} - ${inventory.log.message}`
    } else {
        let ld = ''
        if (inventory.meta.lastDate) {
            let lastDate = new Date();
            lastDate.setTime(inventory.meta.lastDate);
            let s = lastDate.toTimeString().slice(0, 8)
            if (onlyLastDate)
                d = s
            else
                ld = ` ... ${s}`
        }

        return `${d}${ld} - ${inventory.meta.total} PED (${inventory.itemlist.length} items)`;
    }
}

function getInfo(inventory: Inventory): string {
    if (inventory.log === undefined && inventory.tag !== undefined) {
        if (inventory.tag.requested)
            return "this was a manual refresh (italic)" + (inventory.tag.last ? ' and a reset as last (bold)' : '')
        if (inventory.tag.last)
            return "this was a reset as last (bold)"
    }
    return null
}

function getClass(inventory: Inventory): string {
    if (inventory.log !== undefined) {
        return inventory.log.class
    } else if (inventory.tag !== undefined) {
        const list = []
        if (inventory.tag.requested)
            list.push(CLASS_REQUESTED)
        if (inventory.tag.last)
            list.push(CLASS_LAST)
        return list.join(' ')
    } else {
        return null
    }
}

function getCanBeLast(inventory: Inventory) {
    return inventory.log === undefined
}

function getLatestFromHistory(state: HistoryState): ViewInventory {
    for (let n = 0; n < state.list.length; n++) {
        if (state.list[n].canBeLast)
            return state.list[n]
    }
    return state.list[0] // should never happend
}

function getLatestFromInventoryList(list: Array<Inventory>): Inventory {
    for (let n = 0; n < list.length; n++) {
        if (getCanBeLast(list[n]))
            return list[n]
    }
    return list[0] // should never happend
}

function getViewInventory(inventory: Inventory, previous: Inventory, expanded: boolean, sortType: number, isLast: boolean): ViewInventory {
    const diff = getDifference(inventory, previous)
    if (diff !== null)
        Sort.sortList(diff, sortType)
    return {
        key: inventory.meta.date,
        text: getText(inventory),
        info: getInfo(inventory),
        class: getClass(inventory),
        expanded,
        diff,
        sortType,
        isLast,
        canBeLast: getCanBeLast(inventory)
    }
}

function setHistoryList(state: HistoryState, list: Array<Inventory>, last: number): HistoryState {
    const viewList: Array<ViewInventory> = []
    for (let n = 0; n < list.length; n++) {
        const inv = list[n]
        let prev = undefined
        let m = n + 1
        while (prev === undefined && m < list.length) {
            if (list[m].itemlist !== undefined)
                prev = list[m]
            else
                m++
        }

        let expanded = false
        let sortType = Sort.SORT_NAME_ASCENDING
        const oldItem = state.list.find(i => i.key === inv.meta.date)
        if (oldItem !== undefined) {
            expanded = oldItem.expanded
            sortType = oldItem.sortType
        }

        viewList.push(getViewInventory(inv, prev, expanded, sortType, last === inv.meta.date))
    }
    return {
        ...state,
        expanded: state.expanded,
        hiddenError: getHiddenError(state.expanded, viewList),
        list: viewList
    }
}

function getHiddenError(expanded: boolean, list: Array<ViewInventory>): string {
    if (!expanded && list.length > 0 && !list[0].canBeLast)
        return list[0].text
    else
        return undefined
}

function setHistoryExpanded(state: HistoryState, expanded: boolean): HistoryState {
    return {
        ...state,
        expanded,
        hiddenError: getHiddenError(expanded, state.list)
    }
}

function setItemExpanded(state: HistoryState, key: number, expanded: boolean): HistoryState {
    return {
        ...state,
        list: state.list.map(
            inv => inv.key === key ?
                { ...inv, expanded } :
                inv)
    }
}

function setHistoryIntervalId(state: HistoryState, intervalId: NodeJS.Timeout): HistoryState {
    return {
        ...state,
        intervalId
    }
}

function sortByPart(state: ViewInventory, part: number) {
    const sortType = Sort.nextSortType(part, state.sortType)
    return {
        ...state,
        sortType,
        diff: Sort.cloneSortList(state.diff, sortType)
    }
}

function sortBy(state: HistoryState, key: number, part: number): HistoryState {
    return {
        ...state,
        list: state.list.map(inv => inv.key === key ? sortByPart(inv, part) : inv)
    }
}

export {
    initialState,
    getText,
    getLatestFromInventoryList,
    getLatestFromHistory,
    setHistoryList,
    setHistoryExpanded,
    setItemExpanded,
    setHistoryIntervalId,
    sortBy
}