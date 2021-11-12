import { ViewItemData } from "../state/history"

const NAME = 0
const QUANTITY = 1
const VALUE = 2
const CONTAINER = 3

const SORT_NAME_ASCENDING = 0
const SORT_NAME_DESCENDING = 1
const SORT_QUANTITY_ASCENDING = 2
const SORT_QUANTITY_DESCENDING = 3
const SORT_VALUE_ASCENDING = 4
const SORT_VALUE_DESCENDING = 5
const SORT_CONTAINER_ASCENDING = 6
const SORT_CONTAINER_DESCENDING = 7

const defaultSort = [
    SORT_NAME_ASCENDING,
    SORT_QUANTITY_DESCENDING,
    SORT_VALUE_DESCENDING,
    SORT_CONTAINER_ASCENDING
]

const contrarySort = [
    SORT_NAME_DESCENDING,
    SORT_QUANTITY_ASCENDING,
    SORT_VALUE_ASCENDING,
    SORT_CONTAINER_DESCENDING
]

const comparer = [
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_NAME_ASCENDING
        return a.n.localeCompare(b.n)
    },
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_NAME_DESCENDING
        return -a.n.localeCompare(b.n)
    },
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_QUANTITY_ASCENDING
        const c = Math.abs(Number(a.q)) - Math.abs(Number(b.q))
        if (c != 0)
            return c
        return a.n.localeCompare(b.n)
    },
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_QUANTITY_DESCENDING
        const c = - Math.abs(Number(a.q)) + Math.abs(Number(b.q))
        if (c != 0)
            return c
        return -a.n.localeCompare(b.n)
    },
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_VALUE_ASCENDING
        if (a.v.startsWith('(')) {
            if (!b.v.startsWith('('))
                return 1
            else {
            }
        } else {
            if (b.v.startsWith('('))
                return -1
        }
        const aV = a.v.replace('(', '').replace(')', '')
        const bV = b.v.replace('(', '').replace(')', '')
        const c = Math.abs(Number(aV)) - Math.abs(Number(bV))
        if (c != 0)
            return c
        return a.n.localeCompare(b.n)
    },
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_VALUE_DESCENDING
        if (a.v.startsWith('(')) {
            if (!b.v.startsWith('('))
                return 1
        } else {
            if (b.v.startsWith('('))
                return -1
        }
        const aV = a.v.replace('(', '').replace(')', '')
        const bV = b.v.replace('(', '').replace(')', '')
        const c = - Math.abs(Number(aV)) + Math.abs(Number(bV))
        if (c != 0)
            return c
        return -a.n.localeCompare(b.n)
    },
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_CONTAINER_ASCENDING
        const c = a.c.localeCompare(b.c)
        if (c != 0)
            return c
        return a.n.localeCompare(b.n)
    },
    (a: ViewItemData, b: ViewItemData) => {
        // SORT_CONTAINER_DESCENDING
        const c = -a.c.localeCompare(b.c)
        if (c != 0)
            return c
        return -a.n.localeCompare(b.n)
    }
]

interface SortData {
    diff: Array<ViewItemData>,
    sortType: number
}

function sortBy<T extends SortData>(s: T, part: number): T {
    let sortType: number
    if (s.sortType === defaultSort[part])
        sortType = contrarySort[part]
    else
        sortType = defaultSort[part]
    const diff = [...s.diff]
    diff.sort(comparer[sortType])
    return {
        ...s,
        diff,
        sortType
    }
}

function sort(diff: Array<ViewItemData>, sortType: number) {
    diff.sort(comparer[sortType])
}

export {
    NAME,
    QUANTITY,
    VALUE,
    CONTAINER,
    SORT_NAME_ASCENDING,
    SORT_VALUE_DESCENDING,
    sortBy,
    sort
}