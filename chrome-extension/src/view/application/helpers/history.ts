import { Inventory } from "../../../common/state";
import * as Sort from "./inventory.sort"
import { ViewInventory, ViewItemData } from "../state/history";

interface HistoryComputedState {
    list: ViewInventory[]
    hiddenError?: string
}


function getText(inventory: Inventory, onlyLastDate?: boolean) {
    let date = new Date()
    date.setTime(inventory.meta.date)
    let d = date.toTimeString().slice(0, 8)
    if (inventory.log !== undefined) {
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

function copyDiffToClipboard(diff: ViewItemData[] | undefined, useComma: boolean = false): void {
    if (!diff) return

    const text = diff.map((d: ViewItemData) =>
        `${d.n}\t${d.q}\t${useComma ? d.v.replace('.', ',') : d.v}`
    ).join('\n')
    navigator.clipboard.writeText(text).catch(err =>
        console.error('Failed to copy text: ', err)
    )
}

export {
    getText,
    getLatestFromInventoryList,
    reduceHistorySortBy,
    reduceToggleActionsView,
    copyDiffToClipboard
}