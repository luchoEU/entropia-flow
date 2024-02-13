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

interface SortItemData {
    n: string // name, string
    q: string // quantity, number
    v: string // value, number (2 decimals)
    c: string // container, string
}

const comparer = [
    (a: SortItemData, b: SortItemData) => {
        // SORT_NAME_ASCENDING
        return a.n.localeCompare(b.n)
    },
    (a: SortItemData, b: SortItemData) => {
        // SORT_NAME_DESCENDING
        return -a.n.localeCompare(b.n)
    },
    (a: SortItemData, b: SortItemData) => {
        // SORT_QUANTITY_ASCENDING
        const c = Math.abs(Number(a.q)) - Math.abs(Number(b.q))
        if (c != 0)
            return c
        return a.n.localeCompare(b.n)
    },
    (a: SortItemData, b: SortItemData) => {
        // SORT_QUANTITY_DESCENDING
        const c = - Math.abs(Number(a.q)) + Math.abs(Number(b.q))
        if (c != 0)
            return c
        return -a.n.localeCompare(b.n)
    },
    (a: SortItemData, b: SortItemData) => {
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
    (a: SortItemData, b: SortItemData) => {
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
    (a: SortItemData, b: SortItemData) => {
        // SORT_CONTAINER_ASCENDING
        const c = a.c.localeCompare(b.c)
        if (c != 0)
            return c
        return a.n.localeCompare(b.n)
    },
    (a: SortItemData, b: SortItemData) => {
        // SORT_CONTAINER_DESCENDING
        const c = -a.c.localeCompare(b.c)
        if (c != 0)
            return c
        return -a.n.localeCompare(b.n)
    }
]

const nextSortType = (part: number, currentSortType: number): number =>
    (currentSortType === defaultSort[part]) ? contrarySort[part] : defaultSort[part]

// warning: it mutates the list
function sortList<I extends SortItemData>(list: Array<I>, sortType: number) {
    list.sort(comparer[sortType])
}

// warning: it mutates the list
function sortListSelect<I extends SortItemData, D>(list: Array<D>, sortType: number, select: (d: D) => I) {
    if (sortType !== undefined)
        list.sort((a: D, b: D) => comparer[sortType](select(a), select(b)))
}

function cloneSortList<I extends SortItemData>(list: Array<I>, sortType: number): Array<I> {
    const newList = [...list]
    sortList(newList, sortType)
    return newList
}

function cloneSortListSelect<I extends SortItemData, D>(list: Array<D>, sortType: number, select: (d: D) => I): Array<D> {
    const newList = [...list]
    sortListSelect(newList, sortType, select)
    return newList
}

export {
    NAME,
    QUANTITY,
    VALUE,
    CONTAINER,
    SORT_NAME_ASCENDING,
    SORT_VALUE_DESCENDING,
    SortItemData,
    nextSortType,
    sortList,
    sortListSelect,
    cloneSortList,
    cloneSortListSelect,
}
