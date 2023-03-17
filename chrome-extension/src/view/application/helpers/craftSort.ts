import { BlueprintData } from "../state/craft"

const NAME = 0
const CLICKS = 1
const BUDGET = 2
const CASH = 3
const ITEMS = 4

const SORT_NAME_ASCENDING = 0
const SORT_NAME_DESCENDING = 1
const SORT_CLICKS_ASCENDING = 2
const SORT_CLICKS_DESCENDING = 3
const SORT_BUDGET_ASCENDING = 4
const SORT_BUDGET_DESCENDING = 5
const SORT_CASH_ASCENDING = 6
const SORT_CASH_DESCENDING = 7
const SORT_ITEMS_ASCENDING = 8
const SORT_ITEMS_DESCENDING = 9

const defaultSort = [
    SORT_NAME_ASCENDING,
    SORT_CLICKS_DESCENDING,
    SORT_BUDGET_DESCENDING,
    SORT_CASH_ASCENDING,
    SORT_ITEMS_ASCENDING,
]

const contrarySort = [
    SORT_NAME_DESCENDING,
    SORT_CLICKS_ASCENDING,
    SORT_BUDGET_ASCENDING,
    SORT_CASH_DESCENDING,
    SORT_ITEMS_DESCENDING,
]

const comparer = [
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_NAME_ASCENDING
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_NAME_DESCENDING
        return -a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CLICKS_ASCENDING
        const c = Math.abs(Number(a.info.bpClicks ?? '0')) - Math.abs(Number(b.info.bpClicks ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CLICKS_DESCENDING
        const c = - Math.abs(Number(a.info.bpClicks ?? '0')) + Math.abs(Number(b.info.bpClicks ?? '0'))
        if (c != 0)
            return c
        return -a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_BUDGET_ASCENDING
        const c = Math.abs(Number(a.budget.total ?? '0')) - Math.abs(Number(b.budget.total ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_BUDGET_DESCENDING
        const c = - Math.abs(Number(a.budget.total ?? '0')) + Math.abs(Number(b.budget.total ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CASH_ASCENDING
        const c = Math.abs(Number(a.budget.peds ?? '0')) - Math.abs(Number(b.budget.peds ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CASH_DESCENDING
        const c = - Math.abs(Number(a.budget.peds ?? '0')) + Math.abs(Number(b.budget.peds ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_ITEMS_ASCENDING
        var aItemAvailable = a.info.materials.find(m => m.name === "Item")?.available ?? 0
        var bItemAvailable = b.info.materials.find(m => m.name === "Item")?.available ?? 0
        const c = aItemAvailable - bItemAvailable
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_ITEM_DESCENDING
        var aItemAvailable = a.info.materials.find(m => m.name === "Item")?.available ?? 0
        var bItemAvailable = b.info.materials.find(m => m.name === "Item")?.available ?? 0
        const c = - aItemAvailable + bItemAvailable
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
]

const nextSortType = (part: number, currentSortType: number): number =>
    (currentSortType === defaultSort[part]) ? contrarySort[part] : defaultSort[part]

// warning: it mutates the list
function sortList(sortType: number, list: Array<BlueprintData>): Array<BlueprintData> {
    list.sort(comparer[sortType])
    return list
}

function cloneSortList(sortType: number, list: Array<BlueprintData>): Array<BlueprintData> {
    return sortList(sortType, [...list])
}

export {
    NAME,
    CLICKS,
    BUDGET,
    CASH,
    ITEMS,
    SORT_NAME_ASCENDING,
    nextSortType,
    cloneSortList,
    sortList,
}
