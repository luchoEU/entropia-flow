import { Inventory } from "../../../common/state"
import { getDifference, getValue, hasValue } from "./diff"
import { sort, SORT_VALUE_DESCENDING } from "./sort"
import { getLatestFromInventoryList, getText } from "./history"
import { ViewItemData } from "../state/history"
import { matchDate } from "../../../common/date"
import { LastRequiredState, ViewPedData } from "../state/last"

const initialState: LastRequiredState = {
    show: false,
    expanded: false,
    date: 0,
    diff: null,
    peds: [],
    sortType: SORT_VALUE_DESCENDING,
    blacklist: []
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

function applyWarning(diff: Array<ViewItemData>, blacklist: Array<string>) {
    diff.forEach(item => item.w = !item.e && hasValue(item) && blacklist.includes(item.n))
}

function getDeltaAndClass(delta: number) {
    let deltaClass: string
    let deltaWord: string
    if (delta > 0) {
        deltaClass = "positive"
        deltaWord = "Profit"
    } else if (delta < 0) {
        deltaClass = "negative"
        deltaWord = "Loss"
    } else {
        deltaClass = ""
        deltaWord = ""
    }
    return {
        delta: delta.toFixed(2),
        deltaClass,
        deltaWord
    }
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
    return {
        ...state,
        ...getDeltaAndClass(Number(state.delta) + getValue(item) * mult),
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
        ...getDeltaAndClass(delta),
        diff
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

function setBlacklist(state: LastRequiredState, list: Array<string>): LastRequiredState {
    return {
        ...state,
        blacklist: list
    }
}

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
                ...getDeltaAndClass(0),
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
                applyWarning(diff, state.blacklist)
                sort(diff, state.sortType)
            }
            state.peds.forEach(p => d += Number(p.value))
            return {
                ...state,
                ...getDeltaAndClass(d),
                show: true,
                text: getText(inv, true),
                diff: diff || state.diff
            }
        }
    }
}

const setPeds = (state: LastRequiredState, inState: Array<ViewPedData>) => ({
    ...state,
    peds: inState
})

const addPeds = (state: LastRequiredState, value: string): LastRequiredState => {
    const v = Number(value)
    const delta = Number(state.delta) + v
    return {
        ...state,
        ...getDeltaAndClass(delta),
        peds: [...state.peds, { key: new Date().getTime(), value: v.toFixed(2) }]
    }
}

const removePeds = (state: LastRequiredState, key: number) => {
    const p = state.peds.find(s => s.key === key)
    const v = Number(p.value)
    const delta = Number(state.delta) - v
    return {
        ...state,
        ...getDeltaAndClass(delta),
        peds: state.peds.filter(s => s.key !== key)
    }
}

export {
    LastRequiredState,
    initialState,
    setBlacklist,
    onLast,
    setExpanded,
    include,
    exclude,
    excludeWarnings,
    setPeds,
    addPeds,
    removePeds
}