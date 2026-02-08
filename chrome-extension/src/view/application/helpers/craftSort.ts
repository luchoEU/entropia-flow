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

const getLimitText = (dName: string, d: BlueprintData, autoCalcData?: any): string => {
    const autoCalc = autoCalcData?.[dName] || d.user?.materials?.length > 0 ? { clicks: undefined } : { clicks: undefined };
    return autoCalc?.clicks?.limitingItems?.length > 2 ?
        `${autoCalc.clicks?.limitingItems.slice(0, 2).join(', ')}, ${autoCalc.clicks?.limitingItems.length - 2} more` :
        autoCalc?.clicks?.limitingItems?.join(', ') ?? '';
}

const getItemAvailable = (dName: string, d: BlueprintData, autoCalcData?: any): number => {
    const autoCalc = autoCalcData?.[dName];
    return autoCalc?.materials?.find(m => m.name === autoCalc?.itemName)?.available ?? 0;
}

const getItemType = (d: BlueprintData): string =>
    d.web?.blueprint.data?.value.type ?? '';

const getItemClickTTCost = (dName: string, d: BlueprintData, autoCalcData?: any): number => {
    const autoCalc = autoCalcData?.[dName];
    return autoCalc?.clicks?.ttCost ?? 0;
}

const comparer = [
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_NAME_ASCENDING
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_NAME_DESCENDING
        return -a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData], autoCalcData?: any) => {
        // SORT_CLICKS_ASCENDING
        const aAutoCalc = autoCalcData?.[a[0]];
        const bAutoCalc = autoCalcData?.[b[0]];
        const c = Math.abs(Number(aAutoCalc?.clicks?.available ?? '0')) - Math.abs(Number(bAutoCalc?.clicks?.available ?? '0'))
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData], autoCalcData?: any) => {
        // SORT_CLICKS_DESCENDING
        const aAutoCalc = autoCalcData?.[a[0]];
        const bAutoCalc = autoCalcData?.[b[0]];
        const c = - Math.abs(Number(aAutoCalc?.clicks?.available ?? '0')) + Math.abs(Number(bAutoCalc?.clicks?.available ?? '0'))
        if (c != 0)
            return c
        return -a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_LIMIT_ASCENDING
        return getLimitText(a[0], a[1]).localeCompare(getLimitText(b[0], b[1]))
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_LIMIT_DESCENDING
        return -getLimitText(a[0], a[1]).localeCompare(getLimitText(b[0], b[1]))
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_BUDGET_ASCENDING
        const c = Math.abs(Number(a[1].budget.sheet.total ?? '0')) - Math.abs(Number(b[1].budget.sheet.total ?? '0'))
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_BUDGET_DESCENDING
        const c = - Math.abs(Number(a[1].budget.sheet.total ?? '0')) + Math.abs(Number(b[1].budget.sheet.total ?? '0'))
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_CASH_ASCENDING
        const c = Math.abs(Number(a[1].budget.sheet.peds ?? '0')) - Math.abs(Number(b[1].budget.sheet.peds ?? '0'))
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_CASH_DESCENDING
        const c = - Math.abs(Number(a[1].budget.sheet.peds ?? '0')) + Math.abs(Number(b[1].budget.sheet.peds ?? '0'))
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_ITEMS_ASCENDING
        const c = getItemAvailable(a[0], a[1]) - getItemAvailable(b[0], b[1])
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_ITEM_DESCENDING
        const c = - getItemAvailable(a[0], a[1]) + getItemAvailable(b[0], b[1])
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_TYPE_ASCENDING
        return getItemType(a[1]).localeCompare(getItemType(b[1]))
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_TYPE_DESCENDING
        return -getItemType(a[1]).localeCompare(getItemType(b[1]))
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_CLICK_TT_COST_ASCENDING
        const c = getItemClickTTCost(a[0], a[1]) - getItemClickTTCost(b[0], b[1])
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
    (a: [string, BlueprintData], b: [string, BlueprintData]) => {
        // SORT_CLICK_TT_COST_DESCENDING
        const c = - getItemClickTTCost(a[0], a[1]) + getItemClickTTCost(b[0], b[1])
        if (c != 0)
            return c
        return a[0].localeCompare(b[0])
    },
]

const nextSortType = (part: number, currentSortType: number): number =>
    (currentSortType === defaultSort[part]) ? contrarySort[part] : defaultSort[part]

// warning: it mutates the list
function sortList(sortType: number, list: Array<[string, BlueprintData]>): Array<[string, BlueprintData]> {
    list.sort(comparer[sortType])
    return list
}

function cloneSortList(sortType: number, list: Array<[string, BlueprintData]>): Array<[string, BlueprintData]> {
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
