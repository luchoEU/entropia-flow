import { atom, WritableAtom } from 'jotai'
import { PersistedLastState, ComputedLastState, ViewPedData } from '../state/last'
import { ViewItemData } from '../state/history'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { SORT_VALUE_DESCENDING, nextSortType, sortList } from '../helpers/inventory.sort'
import { getDifference } from '../helpers/diff'
import { getLatestFromInventoryList, getText, copyDiffToClipboard } from '../helpers/history'
import { _applyExcludes, _applyBlacklist, _applyPermanentExclude, _applyWarning, _pedSum } from '../../../background/inventory/lastDeltaVariablesBuilder'
import messagesApi from '../../services/api/messages'
import { historyAtom, INVENTORY_KEY_SCALE } from './history'
import { atomWithStorage } from 'jotai/utils'

// Extended computed state with additional UI state
interface ComputedStateExtended extends ComputedLastState {
    latestInventoryKey?: number
}

const initialComputedState: ComputedStateExtended = {
    anyInventory: false,
    date: 0
}

// Initial state for persisted data
const initialPersistedState: PersistedLastState = {
    expanded: false,
    sortType: SORT_VALUE_DESCENDING,
    showMarkup: false,
    showActions: false,
    blacklist: [] as string[],
    permanentBlacklist: [] as string[],
    peds: [] as ViewPedData[],
    notificationsDone: [] as string[]
}

// Base atom for persisted last state
export const lastPersistedAtom = atomWithStorage<PersistedLastState>('last-persisted', initialPersistedState)

// Timestamp of the last inventory being viewed
export const lastTimestampAtom = atom<number>(0)

// Track which item key is in edit mode for markup editing (primitive writable atom)
export const lastItemEditModeKeyAtom = atom<number | undefined>(undefined) as WritableAtom<number | undefined, [number | undefined], void>

// Loading state atom
export const lastLoadingAtom = atom<boolean>(true)

// Computed state atom (derived from historyAtom and lastTimestampAtom)
export const lastComputedAtom = atom<ComputedStateExtended>((get) => {
    const history = get(historyAtom)
    const persisted = get(lastPersistedAtom)
    let lastTimestamp = get(lastTimestampAtom)

    if (!history.list.length) {
        return initialComputedState
    }

    const lastInv = getLatestFromInventoryList(
        history.list.map(v => v.rawInventory)
    )
    const inv = history.list.find(v => v.key === lastTimestamp * INVENTORY_KEY_SCALE)?.rawInventory ?? lastInv

    const latestInventoryKey = lastInv?.meta?.date
    if (inv === lastInv) {
        // it is the most recent valid inventory in history
        return {
            delta: 0,
            anyInventory: true,
            text: getText(inv, true),
            date: lastTimestamp,
            diff: undefined,
            latestInventoryKey,
        }
    }

    let d = Number(lastInv.meta.total) - Number(inv.meta.total)
    const diff = getDifference(lastInv, inv)
    if (diff) {
        d = _applyExcludes(d, diff, undefined)
        d = _applyBlacklist(d, diff, persisted.blacklist)
        d = _applyPermanentExclude(d, diff, persisted.permanentBlacklist)
        _applyWarning(diff, persisted.blacklist)
        sortList(diff, persisted.sortType)
    }
    d += _pedSum(persisted.peds)
    return {
        delta: d,
        anyInventory: true,
        text: getText(inv, true),
        date: lastTimestamp,
        diff: diff || undefined,
        latestInventoryKey,
    }
})

// Set the timestamp of the last inventory being viewed
export const setLastTimestampAtom = atom(
    null,
    (_get, set, last: number) => {
        set(lastTimestampAtom, last)
    }
)

// Write atoms for actions

export const setExpandedAtom = atom(
    null,
    async (get, set, expanded: boolean) => {
        const current = get(lastPersistedAtom)
        const newState = { ...current, expanded }
        set(lastPersistedAtom, newState)
    }
)

export const setLastShowMarkupAtom = atom(
    null,
    async (get, set, showMarkup: boolean) => {
        const current = get(lastPersistedAtom)
        const newState = { ...current, showMarkup }
        set(lastPersistedAtom, newState)
    }
)

export const setLastShowActionsAtom = atom(
    null,
    async (get, set, showActions: boolean) => {
        const current = get(lastPersistedAtom)
        const newState = { ...current, showActions }
        set(lastPersistedAtom, newState)
    }
)

export const sortByAtom = atom(
    null,
    async (get, set, part: number) => {
        const current = get(lastPersistedAtom)
        const sortType = nextSortType(part, current.sortType)
        const newState = { ...current, sortType }
        set(lastPersistedAtom, newState)
    }
)

export const includeItemAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find((i: ViewItemData) => i.key === key)
        if (!item) return

        const blacklist = current.blacklist.filter(s => s !== item.n)

        const newState = { ...current, blacklist }
        set(lastPersistedAtom, newState)
    }
)

export const excludeItemAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find((i: ViewItemData) => i.key === key)
        if (!item) return

        let blacklist = current.blacklist
        if (!blacklist.includes(item.n)) {
            blacklist = [...blacklist, item.n]
        }

        const newState = { ...current, blacklist }
        set(lastPersistedAtom, newState)
    }
)

export const excludeWarningsAtom = atom(
    null,
    async (_get, _set) => {
        // This action is now handled automatically by the derived lastComputedAtom
        // when persisted state changes
    }
)

export const permanentExcludeOnAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find((i: ViewItemData) => i.key === key)
        if (!item) return

        let permanentBlacklist = current.permanentBlacklist || []
        if (!permanentBlacklist.includes(item.n)) {
            permanentBlacklist = [...permanentBlacklist, item.n]
        }

        const newState = { ...current, permanentBlacklist }
        set(lastPersistedAtom, newState)
    }
)

export const permanentExcludeOffAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find((i: ViewItemData) => i.key === key)
        if (!item) return

        const permanentBlacklist = current.permanentBlacklist.filter(s => s !== item.n)

        const newState = { ...current, permanentBlacklist }
        set(lastPersistedAtom, newState)
    }
)

export const addPedsAtom = atom(
    null,
    async (get, set, value: string) => {
        const current = get(lastPersistedAtom)
        const pedValue = Number(value)
        const peds = [...current.peds, { key: Date.now(), value: pedValue.toFixed(2) }]

        const newState = { ...current, peds }
        set(lastPersistedAtom, newState)
    }
)

export const removePedsAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const peds = current.peds.filter(p => p.key !== key)

        const newState = { ...current, peds }
        set(lastPersistedAtom, newState)
    }
)

export const resetLastAtom = atom(
    null,
    async (get, set) => {
        const current = get(lastPersistedAtom)
        const newState = {
            ...current,
            expanded: false,
            peds: [],
            notificationsDone: []
        }
        set(lastPersistedAtom, newState)
    }
)

export const addNotificationsDoneAtom = atom(
    null,
    async (get, set, messages: string[]) => {
        const current = get(lastPersistedAtom)
        const notificationsDone = [...current.notificationsDone, ...messages]
        const newState = { ...current, notificationsDone }
        set(lastPersistedAtom, newState)
    }
)

// Set current inventory as session start (communicates with backend)
export const setLastAtom = atom(
    null,
    async (get, set) => {
        const computed = get(lastComputedAtom)
        if (computed.latestInventoryKey) {
            messagesApi.requestSetLast(true, computed.latestInventoryKey)
        }
        // Reset UI state
        const current = get(lastPersistedAtom)
        const newState = {
            ...current,
            expanded: false,
            peds: [],
            notificationsDone: []
        }
        set(lastPersistedAtom, newState)
    }
)

// Set a specific timestamp as session start
export const setAsLastAtom = atom(
    null,
    async (_get, _set, last: number) => {
        messagesApi.requestSetLast(false, last)
    }
)

// Copy diff to clipboard
export const copyLastAtom = atom(
    null,
    (get, _set, useComma: boolean = false) => {
        const computed = get(lastComputedAtom)
        copyDiffToClipboard(computed.diff, useComma)
    }
)
