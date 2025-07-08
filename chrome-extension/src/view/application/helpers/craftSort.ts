import { BlueprintData } from "../state/craft"

const NAME = 0
const CLICKS = 1
const LIMIT = 2
const BUDGET = 3
const CASH = 4
const ITEMS = 5
const TYPE = 6
const CLICK_TT_COST = 7

const SORT_NAME_ASCENDING = 0
const SORT_NAME_DESCENDING = 1
const SORT_CLICKS_ASCENDING = 2
const SORT_CLICKS_DESCENDING = 3
const SORT_LIMIT_ASCENDING = 4
const SORT_LIMIT_DESCENDING = 5
const SORT_BUDGET_ASCENDING = 6
const SORT_BUDGET_DESCENDING = 7
const SORT_CASH_ASCENDING = 8
const SORT_CASH_DESCENDING = 9
const SORT_ITEMS_ASCENDING = 10
const SORT_ITEMS_DESCENDING = 11
const SORT_TYPE_ASCENDING = 12
const SORT_TYPE_DESCENDING = 13
const SORT_CLICK_TT_COST_ASCENDING = 14
const SORT_CLICK_TT_COST_DESCENDING = 15

const defaultSort = [
    SORT_NAME_ASCENDING,
    SORT_CLICKS_DESCENDING,
    SORT_LIMIT_ASCENDING,
    SORT_BUDGET_DESCENDING,
    SORT_CASH_ASCENDING,
    SORT_ITEMS_ASCENDING,
    SORT_TYPE_ASCENDING,
    SORT_CLICK_TT_COST_ASCENDING,
]

const contrarySort = [
    SORT_NAME_DESCENDING,
    SORT_CLICKS_ASCENDING,
    SORT_LIMIT_DESCENDING,
    SORT_BUDGET_ASCENDING,
    SORT_CASH_DESCENDING,
    SORT_ITEMS_DESCENDING,
    SORT_TYPE_DESCENDING,
    SORT_CLICK_TT_COST_DESCENDING,
]

const sortColumnDefinition = {
    [NAME]: {
        text: 'Name',
        up: SORT_NAME_ASCENDING,
        down: SORT_NAME_DESCENDING
    },
    [CLICKS]: {
        text: 'Clicks',
        up: SORT_CLICKS_ASCENDING,
        down: SORT_CLICKS_DESCENDING
    },
    [LIMIT]: {
        text: 'Limits clicks',
        up: SORT_LIMIT_ASCENDING,
        down: SORT_LIMIT_DESCENDING
    },
    [ITEMS]: {
        text: 'Items',
        up: SORT_ITEMS_ASCENDING,
        down: SORT_ITEMS_DESCENDING
    },
    [BUDGET]: {
        text: 'Budget',
        up: SORT_BUDGET_ASCENDING,
        down: SORT_BUDGET_DESCENDING
    },
    [CASH]: {
        text: 'Cash',
        up: SORT_CASH_ASCENDING,
        down: SORT_CASH_DESCENDING
    },
    [TYPE]: {
        text: 'Type',
        up: SORT_TYPE_ASCENDING,
        down: SORT_TYPE_DESCENDING
    },
    [CLICK_TT_COST]: {
        text: 'Click TT Cost',
        up: SORT_CLICK_TT_COST_ASCENDING,
        down: SORT_CLICK_TT_COST_DESCENDING
    },
}

const getLimitText = (d: BlueprintData): string =>
    d.c?.clicks?.limitingItems.length > 2 ? 
        `${d.c.clicks?.limitingItems.slice(0, 2).join(', ')}, ${d.c.clicks?.limitingItems.length - 2} more` : 
        d.c?.clicks?.limitingItems.join(', ') ?? '';

const getItemAvailable = (d: BlueprintData): number =>
    d.c?.materials?.find(m => m.name === d.c.itemName)?.available ?? 0;

const getItemType = (d: BlueprintData): string =>
    d.web?.blueprint.data?.value.type ?? '';

const getItemClickTTCost = (d: BlueprintData): number =>
    d.c?.clicks?.ttCost ?? 0;

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
        const c = Math.abs(Number(a.c.clicks?.available ?? '0')) - Math.abs(Number(b.c.clicks?.available ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CLICKS_DESCENDING
        const c = - Math.abs(Number(a.c.clicks?.available ?? '0')) + Math.abs(Number(b.c.clicks?.available ?? '0'))
        if (c != 0)
            return c
        return -a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_LIMIT_ASCENDING
        return getLimitText(a).localeCompare(getLimitText(b))
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_LIMIT_DESCENDING
        return -getLimitText(a).localeCompare(getLimitText(b))
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_BUDGET_ASCENDING
        const c = Math.abs(Number(a.budget.sheet.total ?? '0')) - Math.abs(Number(b.budget.sheet.total ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_BUDGET_DESCENDING
        const c = - Math.abs(Number(a.budget.sheet.total ?? '0')) + Math.abs(Number(b.budget.sheet.total ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CASH_ASCENDING
        const c = Math.abs(Number(a.budget.sheet.peds ?? '0')) - Math.abs(Number(b.budget.sheet.peds ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CASH_DESCENDING
        const c = - Math.abs(Number(a.budget.sheet.peds ?? '0')) + Math.abs(Number(b.budget.sheet.peds ?? '0'))
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_ITEMS_ASCENDING
        const c = getItemAvailable(a) - getItemAvailable(b)
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_ITEM_DESCENDING
        const c = - getItemAvailable(a) + getItemAvailable(b)
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_TYPE_ASCENDING
        return getItemType(a).localeCompare(getItemType(b))
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_TYPE_DESCENDING
        return -getItemType(a).localeCompare(getItemType(b))
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CLICK_TT_COST_ASCENDING
        const c = getItemClickTTCost(a) - getItemClickTTCost(b)
        if (c != 0)
            return c
        return a.name.localeCompare(b.name)
    },
    (a: BlueprintData, b: BlueprintData) => {
        // SORT_CLICK_TT_COST_DESCENDING
        const c = - getItemClickTTCost(a) + getItemClickTTCost(b)
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
    LIMIT,
    BUDGET,
    CASH,
    ITEMS,
    TYPE,
    CLICK_TT_COST,
    SORT_NAME_ASCENDING,
    sortColumnDefinition,
    nextSortType,
    cloneSortList,
    sortList,
    getItemAvailable,
    getLimitText,
    getItemType,
    getItemClickTTCost,
}
