import { CLASS_LAST, CLASS_NEW_DATE, CLASS_REQUESTED } from "../../../common/const";
import { Inventory } from "../../../common/state";
import { getDifference } from "./diff";
import { inferActions } from "./actionInference";
import * as Sort from "./inventory.sort"
import { ViewInventory } from "../state/history";

interface HistoryComputedState {
    list: ViewInventory[]
    hiddenError?: string
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
    }

    if (inventory.meta.byDays) {
        d = `${date.toDateString()} ${d}`
    } else if (inventory.meta.lastDate) {
        let lastDate = new Date();
        lastDate.setTime(inventory.meta.lastDate);
        let s = lastDate.toTimeString().slice(0, 8)
        if (onlyLastDate)
            d = s
        else
            d = `${d} ... ${s}`
    }

    return `${d} - ${inventory.meta.total} PED (${inventory.itemlist?.length} items)`;
}

function getInfo(inventory: Inventory): string | null {
    if (inventory.log === undefined && inventory.tag !== undefined) {
        if (inventory.tag.requested)
            return "this was a manual refresh (italic)" + (inventory.tag.last ? ' and a reset as last (bold)' : '')
        if (inventory.tag.last)
            return "this was a reset as last (bold)"
    }
    return null
}

function getClass(inventory: Inventory): string | null {
    if (inventory.log !== undefined) {
        return inventory.log.class
    } else if (inventory.tag !== undefined) {
        const list: string[] = []
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

function getLatestFromInventoryList(list: Array<Inventory>): Inventory {
    for (let n = 0; n < list.length; n++) {
        if (getCanBeLast(list[n]))
            return list[n]
    }
    return list[0] // should never happend
}

function getViewInventory(inventory: Inventory, previous: Inventory, expanded: boolean, sortType: number, isLast: boolean, showActions: boolean, index: number): ViewInventory {
    const diff = getDifference(inventory, previous)
    if (diff)
        Sort.sortList(diff, sortType)
    const actions = diff ? inferActions(diff) : undefined
    return {
        key: inventory.meta.date * 1000000 + index,
        text: getText(inventory),
        info: getInfo(inventory)!,
        class: getClass(inventory)!,
        expanded,
        diff,
        sortType,
        isLast,
        canBeLast: getCanBeLast(inventory),
        rawInventory: inventory,
        actions,
        showActions
    }
}

function reduceSetHistoryList(state: HistoryComputedState, list: Array<Inventory>, last: number): HistoryComputedState {
    const viewList: Array<ViewInventory> = []
    for (let n = 0; n < list.length; n++) {
        const inv = list[n]
        let prev: Inventory | undefined = undefined
        let m = n + 1
        while (prev === undefined && m < list.length) {
            if (list[m].itemlist !== undefined)
                prev = list[m]
            else
                m++
        }

        let expanded = false
        let sortType = Sort.SORT_NAME_ASCENDING
        let showActions = true
        const oldItem = state.list.find(i => i.key === inv.meta.date)
        if (oldItem !== undefined) {
            expanded = oldItem.expanded
            sortType = oldItem.sortType
            showActions = oldItem.showActions
        }

        viewList.push(getViewInventory(inv, prev!, expanded, sortType, last === inv.meta.date, showActions, n))
    }
    return {
        ...state,
        hiddenError: getHiddenError(viewList),
        list: viewList
    }
}

function getHiddenError(list: Array<ViewInventory>): string | undefined {
    if (list.length > 0 && !list[0].canBeLast)
        return list[0].text
    else
        return undefined
}

function sortByPart(state: ViewInventory, part: number) {
    const sortType = Sort.nextSortType(part, state.sortType)
    return {
        ...state,
        sortType,
        diff: Sort.cloneSortList(state.diff, sortType)
    }
}

function reduceHistorySortBy(state: HistoryComputedState, key: number, part: number): HistoryComputedState {
    return {
        ...state,
        list: state.list.map(inv => inv.key === key ? sortByPart(inv, part) : inv)
    }
}

function reduceToggleActionsView(state: HistoryComputedState, key: number): HistoryComputedState {
    return {
        ...state,
        list: state.list.map(inv =>
            inv.key === key ? { ...inv, showActions: !inv.showActions } : inv
        )
    }
}

export {
    getText,
    getLatestFromInventoryList,
    reduceSetHistoryList,
    reduceHistorySortBy,
    reduceToggleActionsView
}