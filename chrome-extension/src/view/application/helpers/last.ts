import { Inventory } from "../../../common/state"
import { getDifference, getValue, hasValue } from "./diff"
import { cloneSortList, nextSortType, sortList, SORT_VALUE_DESCENDING } from "./inventory.sort"
import { getLatestFromInventoryList, getText } from "./history"
import { ViewItemData, ViewItemMode } from "../state/history"
import { matchDate } from "../../../common/date"
import { LastRequiredState, ViewPedData } from "../state/last"
import { InventoryState } from "../state/inventory"
import { getItemAction } from "./soldDetector"
import { ItemsMap } from "../state/items"
import { getValueWithMarkup } from "./items"

const initialState: LastRequiredState = {
    expanded: false,
    peds: [],
    sortType: SORT_VALUE_DESCENDING,
    blacklist: [],
    permanentBlacklist: [],
    notificationsDone: [],
    showMarkup: false,
    c: {
        anyInventory: false,
        date: 0,
        diff: null,
    }
}

const reduceSetLastState = (state: LastRequiredState, newState: LastRequiredState): LastRequiredState => newState

function _applyExcludes(d: number, diff: Array<ViewItemData>, last: Array<ViewItemData>): number {
    // transfer excluded from previous list
    if (last !== null) {
        for (const item of last) {
            if (item.e) {
                const i = diff.find(i => {
                    return !i.e
                        && i.n === item.n
                        && i.q === item.q
                        && i.v === item.v
                        && i.c === item.c
                })
                if (i !== undefined) {
                    i.e = true
                    d -= getValue(i)
                }
            }
        }
    }
    // mark auction sells as excluded, unless they are all auction changes
    if (diff.find(i => i.c !== 'AUCTION')) {
        for (const item of diff) {
            if (item.c === 'AUCTION' && Number(item.q) < 0) { // < 0 are sells
                const existed = last && last.find(i => {
                    return i.n === item.n
                        && i.q === item.q
                        && i.v === item.v
                        && i.c === item.c
                })
                if (!existed) {
                    item.e = true
                    d -= getValue(item)
                }
            }
        }
    }
    return d
}

function _applyPermanentExclude(d: number, diff: Array<ViewItemData>, permanentBlacklist: Array<string>): number {
    diff.forEach(item => {
        if (hasValue(item) && permanentBlacklist.includes(item.n)) {
            item.x = true
            if (!item.e) {
                item.e = true
                d -= getValue(item)
            }
        }
    })
    return d
}

function _applyWarning(diff: Array<ViewItemData>, blacklist: Array<string>) {
    diff.forEach(item => item.w = !item.e && hasValue(item) && blacklist.includes(item.n))
}

const reduceSetExpanded = (state: LastRequiredState, expanded: boolean) => ({
    ...state,
    expanded
})

function _changeExclude(state: LastRequiredState, key: number, excluded: boolean, mult: number): LastRequiredState {
    const item = state.c.diff.find(i => i.key === key)
    const diff = state.c.diff.map(
        i => i.key === key ? { ...i, e: excluded } : i)
    let blacklist = state.blacklist
    if (excluded) {
        if (!blacklist.includes(item.n))
            blacklist = [...blacklist, item.n]
    } else {
        blacklist = blacklist.filter(s => s !== item.n)
    }
    _applyWarning(diff, blacklist)
    const delta = Number(state.c.delta) + getValue(item) * mult
    return {
        ...state,
        blacklist,
        c: {
            ...state.c,
            delta,
            diff
        }
    }
}

const reduceInclude = (state: LastRequiredState, key: number) =>
    _changeExclude(state, key, false, 1)

const reduceExclude = (state: LastRequiredState, key: number) =>
    _changeExclude(state, key, true, -1)

function reduceExcludeWarnings(state: LastRequiredState): LastRequiredState {
    let delta = Number(state.c.delta)
    state.c.diff.forEach(item => {
        if (item.w && !item.e) {
            delta -= getValue(item)
        }
    })
    const diff = state.c.diff.map(i => ({ ...i, e: i.e || i.w, w: false }))
    return {
        ...state,
        c: {
            ...state.c,
            delta,
            diff
        }
    }
}

function reducePermanentExclude(state: LastRequiredState, key: number, value: boolean): LastRequiredState {
    const item = state.c.diff.find(i => i.key === key)
    const diff = state.c.diff.map(
        i => i.key === key ? { ...i, x: value } : i)
    let permanentBlacklist = state.permanentBlacklist
    if (!permanentBlacklist)
    permanentBlacklist = []
    if (value) {
        if (!permanentBlacklist.includes(item.n))
        permanentBlacklist = [...permanentBlacklist, item.n]
    } else {
        permanentBlacklist = permanentBlacklist.filter(s => s !== item.n)
    }
    return {
        ...state,
        permanentBlacklist,
        c: {
            ...state.c,
            diff
        }
    }
}

const reduceSetLastItemMode = (state: LastRequiredState, key: number, mode: ViewItemMode): LastRequiredState => ({
    ...state,
    c: {
        ...state.c,
        diff: state.c.diff.map(d => d.key === key ? { ...d, m: mode } : d)
    }
})

const reduceSetLastShowMarkup = (state: LastRequiredState, showMarkup: boolean): LastRequiredState => ({
    ...state,
    showMarkup
})

function _findInventory(list: Array<Inventory>, lastRefresh: number) {
    if (lastRefresh === undefined)
        return null

    for (let inv of list) {
        if (matchDate(inv, lastRefresh))
            return inv
    }
    return list[0]
}

function reduceOnLast(state: LastRequiredState, list: Array<Inventory>, last: number): LastRequiredState {
    const inv = _findInventory(list, last)
    if (inv === null) {
        return {
            ...state,
            c: {
                ...state.c,
                date: 0,
                anyInventory: false
            }
        }
    } else {
        const lastInv: Inventory = getLatestFromInventoryList(list)
        if (inv === lastInv) { // it is the most recent valid inventory in history
            return {
                ...state,
                c: {
                    ...state.c,
                    delta: 0,
                    anyInventory: true,
                    text: getText(inv, true),
                    date: last,
                    diff: null,
                }
            }
        } else {
            let d = Number(lastInv.meta.total) - Number(inv.meta.total)
            const diff = getDifference(lastInv, inv)
            if (diff !== null) {
                d = _applyExcludes(d, diff, state.c.diff)
                d = _applyPermanentExclude(d, diff, state.permanentBlacklist)
                _applyWarning(diff, state.blacklist)
                sortList(diff, state.sortType)
            }
            d += _pedSum(state.peds)
            return {
                ...state,
                c: {
                    ...state.c,
                    delta: d,
                    anyInventory: true,
                    text: getText(inv, true),
                    diff: diff || state.c.diff
                }
            }
        }
    }
}

const reduceSetLast = (state: LastRequiredState): LastRequiredState => ({
    ...state,
    expanded: false,
    peds: [],
    notificationsDone: [],
})

const reduceSetAsLast = (state: LastRequiredState, last: number): LastRequiredState => ({
    ...state,
    peds: [],
    notificationsDone: [],
})

const _sumDiff = (diff: ViewItemData[], items: ItemsMap): number =>
    diff?.reduce((p, c) => p + (c.e ? 0 : getValueWithMarkup(c.q, c.v, items[c.n])), 0) ?? 0;

const reduceApplyMarkup = (state: LastRequiredState, items: ItemsMap): LastRequiredState => ({
    ...state,
    c: {
        ...state.c,
        delta: _sumDiff(state.c.diff, items) + _pedSum(state.peds)
    }
})

const reduceAddActions = (state: LastRequiredState, inventory: InventoryState): LastRequiredState => ({
    ...state,
    c: {
        ...state.c,
        diff: state.c.diff === null ? null : state.c.diff.map(d => ({
            ...d,
            a: getItemAction(d, inventory)
        }))
    }
})

const reduceAddNotificationsDone = (state: LastRequiredState, messages: Array<string>): LastRequiredState => ({
    ...state,
    notificationsDone: [ ...state.notificationsDone, ...messages ]
})

const _pedSum = (peds: Array<ViewPedData>) => peds.reduce((p, c) => p + Number(c.value), 0)

const _reduceSetPeds = (state: LastRequiredState, inState: Array<ViewPedData>): LastRequiredState => ({
    ...state,
    peds: inState,
    c: { ...state.c, delta: Number(state.c.delta) - _pedSum(state.peds) + _pedSum(inState) },
})

const reduceAddPeds = (state: LastRequiredState, value: string): LastRequiredState =>
    _reduceSetPeds(state, [...state.peds, { key: new Date().getTime(), value: Number(value).toFixed(2) }]);

const reduceRemovePeds = (state: LastRequiredState, key: number): LastRequiredState =>
    _reduceSetPeds(state, state.peds.filter(s => s.key !== key));

function reduceSortByPart(state: LastRequiredState, part: number): LastRequiredState {
    const sortType = nextSortType(part, state.sortType)
    return {
        ...state,
        sortType,
        c: { ...state.c, diff: cloneSortList(state.c.diff, sortType) }
    }
}

const cleanLastStateForSave = (state: LastRequiredState): Partial<LastRequiredState> => ({
    ...state,
    c: undefined
})

export {
    initialState,
    reduceSetLastState,
    reduceOnLast,
    reduceSetLast,
    reduceSetAsLast,
    reduceAddActions,
    reduceSetExpanded,
    reduceInclude,
    reduceExclude,
    reduceExcludeWarnings,
    reducePermanentExclude,
    reduceSetLastItemMode,
    reduceSetLastShowMarkup,
    reduceAddNotificationsDone,
    reduceAddPeds,
    reduceRemovePeds,
    reduceSortByPart,
    reduceApplyMarkup,
    cleanLastStateForSave,
}