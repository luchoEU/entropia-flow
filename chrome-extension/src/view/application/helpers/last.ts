import { Inventory } from "../../../common/state"
import { getDifference, getValue, hasValue } from "./diff"
import { cloneSortList, nextSortType, sortList, SORT_VALUE_DESCENDING } from "./inventory.sort"
import { getLatestFromInventoryList, getText } from "./history"
import { ViewItemData } from "../state/history"
import { matchDate } from "../../../common/date"
import { LastRequiredState, ViewPedData } from "../state/last"
import { AvailableCriteria } from "../state/inventory"
import { getItemAction } from "./soldDetector"

const initialState: LastRequiredState = {
    show: false,
    expanded: false,
    date: 0,
    diff: null,
    peds: [],
    sortType: SORT_VALUE_DESCENDING,
    blacklist: [],
    permanentBlacklist: []
}

function applyExcludes(d: number, diff: Array<ViewItemData>, last: Array<ViewItemData>): number {
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
            if (item.c === 'AUCTION') {
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

function applyPermanentExclude(d: number, diff: Array<ViewItemData>, permanentBlacklist: Array<string>): number {
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

function applyWarning(diff: Array<ViewItemData>, blacklist: Array<string>) {
    diff.forEach(item => item.w = !item.e && hasValue(item) && blacklist.includes(item.n))
}

const setExpanded = (state: LastRequiredState, expanded: boolean) => ({
    ...state,
    expanded
})

function changeExclude(state: LastRequiredState, key: number, excluded: boolean, mult: number): LastRequiredState {
    const item = state.diff.find(i => i.key === key)
    const diff = state.diff.map(
        i => i.key === key ? { ...i, e: excluded } : i)
    let blacklist = state.blacklist
    if (excluded) {
        if (!blacklist.includes(item.n))
            blacklist = [...blacklist, item.n]
    } else {
        blacklist = blacklist.filter(s => s !== item.n)
    }
    applyWarning(diff, blacklist)
    const delta = Number(state.delta) + getValue(item) * mult
    return {
        ...state,
        delta,
        diff,
        blacklist
    }
}

const include = (state: LastRequiredState, key: number) =>
    changeExclude(state, key, false, 1)

const exclude = (state: LastRequiredState, key: number) =>
    changeExclude(state, key, true, -1)

function excludeWarnings(state: LastRequiredState): LastRequiredState {
    let delta = Number(state.delta)
    state.diff.forEach(item => {
        if (item.w && !item.e) {
            delta -= getValue(item)
        }
    })
    const diff = state.diff.map(i => ({ ...i, e: i.e || i.w, w: false }))
    return {
        ...state,
        delta,
        diff
    }
}

function permanentExclude(state: LastRequiredState, key: number, value: boolean): LastRequiredState {
    const item = state.diff.find(i => i.key === key)
    const diff = state.diff.map(
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
        diff,
        permanentBlacklist
    }
}

function findInventory(list: Array<Inventory>, lastRefresh: number) {
    if (lastRefresh === undefined)
        return null

    for (let inv of list) {
        if (matchDate(inv, lastRefresh))
            return inv
    }
    return null
}

const setBlacklist = (state: LastRequiredState, list: Array<string>): LastRequiredState => ({
    ...state,
    blacklist: list
})

const setPermanentBlacklist = (state: LastRequiredState, list: Array<string>): LastRequiredState => ({
    ...state,
    permanentBlacklist: list
})

function onLast(state: LastRequiredState, list: Array<Inventory>, last: number): LastRequiredState {
    const inv = findInventory(list, last)
    if (inv === null) {
        return {
            ...state,
            date: 0,
            show: false
        }
    } else {
        const lastInv: Inventory = getLatestFromInventoryList(list)
        if (inv === lastInv) {
            return {
                ...state,
                delta: 0,
                show: true,
                text: getText(inv, true),
                date: last,
                diff: null,
                peds: []
            }
        } else {
            let d = Number(lastInv.meta.total) - Number(inv.meta.total)
            const diff = getDifference(lastInv, inv)
            if (diff !== null) {
                d = applyExcludes(d, diff, state.diff)
                d = applyPermanentExclude(d, diff, state.permanentBlacklist)
                applyWarning(diff, state.blacklist)
                sortList(diff, state.sortType)
            }
            state.peds.forEach(p => d += Number(p.value))
            return {
                ...state,
                delta: d,
                show: true,
                text: getText(inv, true),
                diff: diff || state.diff
            }
        }
    }
}

const addActions = (state: LastRequiredState, availableCriteria: AvailableCriteria): LastRequiredState => ({
    ...state,
    diff: state.diff === null ? null : state.diff.map(d => ({
        ...d,
        a: getItemAction(d, availableCriteria)
    }))
})

const setPeds = (state: LastRequiredState, inState: Array<ViewPedData>): LastRequiredState => ({
    ...state,
    peds: inState
})

const addPeds = (state: LastRequiredState, value: string): LastRequiredState => {
    const v = Number(value)
    const delta = Number(state.delta) + v
    return {
        ...state,
        delta,
        peds: [...state.peds, { key: new Date().getTime(), value: v.toFixed(2) }]
    }
}

const removePeds = (state: LastRequiredState, key: number): LastRequiredState => {
    const p = state.peds.find(s => s.key === key)
    const v = Number(p.value)
    const delta = Number(state.delta) - v
    return {
        ...state,
        delta,
        peds: state.peds.filter(s => s.key !== key)
    }
}

function sortByPart(state: LastRequiredState, part: number): LastRequiredState {
    const sortType = nextSortType(part, state.sortType)
    return {
        ...state,
        sortType,
        diff: cloneSortList(state.diff, sortType)
    }
}

export {
    LastRequiredState,
    initialState,
    setBlacklist,
    setPermanentBlacklist,
    onLast,
    addActions,
    setExpanded,
    include,
    exclude,
    excludeWarnings,
    permanentExclude,
    setPeds,
    addPeds,
    removePeds,
    sortByPart,
}