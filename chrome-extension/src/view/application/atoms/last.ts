import { atom } from 'jotai'
import { LastRequiredState, ViewPedData } from '../state/last'
import { ViewItemData } from '../state/history'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { SORT_VALUE_DESCENDING, nextSortType, sortList, cloneSortList } from '../helpers/inventory.sort'
import { Inventory } from '../../../common/state'
import { getDifference, getValue } from '../helpers/diff'
import { getLatestFromInventoryList, getText } from '../helpers/history'
import { _applyExcludes, _applyPermanentExclude, _applyWarning, _findInventory, _pedSum } from '../../../background/inventory/lastDeltaVariablesBuilder'
import messagesApi from '../../services/api/messages'

const STORAGE_KEY = 'view.last'

// Computed state (not persisted)
interface ComputedState {
    anyInventory: boolean
    text?: string
    delta?: number
    date: number
    diff?: ViewItemData[]
    latestInventoryKey?: number
}

const initialComputedState: ComputedState = {
    anyInventory: false,
    date: 0
}

// Initial state for persisted data
const initialPersistedState: LastRequiredState = {
    c: {
        anyInventory: false,
        date: 0
    },
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
export const lastPersistedAtom = atom(initialPersistedState)

// Computed state atom (not persisted)
export const lastComputedAtom = atom<ComputedState>(initialComputedState)

// Loading state atom
export const lastLoadingAtom = atom<boolean>(true)

// Persistence helper
const saveToStorage = async (state: typeof initialPersistedState) => {
    await LOCAL_STORAGE.set(STORAGE_KEY, state)
}

// Initialize last state from storage
export const initializeLastAtom = atom(
    null,
    async (get, set) => {
        const stored = await LOCAL_STORAGE.get(STORAGE_KEY)
        if (stored) {
            set(lastPersistedAtom, {
                ...initialPersistedState,
                ...stored
            })
        }
        set(lastLoadingAtom, false)
    }
)

// Compute last state from inventory data (equivalent to reduceOnLast)
export const computeLastAtom = atom(
    null,
    (get, set, { list, last }: { list: Inventory[], last: number }) => {
        const persisted = get(lastPersistedAtom)
        const currentComputed = get(lastComputedAtom)

        const inv = _findInventory(list, last)
        if (inv === null) {
            set(lastComputedAtom, {
                ...currentComputed,
                date: 0,
                anyInventory: false
            })
            return
        }

        const lastInv: Inventory = getLatestFromInventoryList(list)
        const latestInventoryKey = lastInv?.meta?.date
        if (inv === lastInv) {
            // it is the most recent valid inventory in history
            set(lastComputedAtom, {
                ...currentComputed,
                delta: 0,
                anyInventory: true,
                text: getText(inv, true),
                date: last,
                diff: undefined,
                latestInventoryKey,
            })
        } else {
            let d = Number(lastInv.meta.total) - Number(inv.meta.total)
            const diff = getDifference(lastInv, inv)
            if (diff) {
                d = _applyExcludes(d, diff, currentComputed.diff)
                d = _applyPermanentExclude(d, diff, persisted.permanentBlacklist)
                _applyWarning(diff, persisted.blacklist)
                sortList(diff, persisted.sortType)
            }
            d += _pedSum(persisted.peds)
            set(lastComputedAtom, {
                ...currentComputed,
                delta: d,
                anyInventory: true,
                text: getText(inv, true),
                diff: diff || currentComputed.diff,
                latestInventoryKey,
            })
        }
    }
)

// Write atoms for actions

export const setExpandedAtom = atom(
    null,
    async (get, set, expanded: boolean) => {
        const current = get(lastPersistedAtom)
        const newState = { ...current, expanded }
        set(lastPersistedAtom, newState)
        await saveToStorage(newState)
    }
)

export const setLastShowMarkupAtom = atom(
    null,
    async (get, set, showMarkup: boolean) => {
        const current = get(lastPersistedAtom)
        const newState = { ...current, showMarkup }
        set(lastPersistedAtom, newState)
        await saveToStorage(newState)
    }
)

export const setLastShowActionsAtom = atom(
    null,
    async (get, set, showActions: boolean) => {
        const current = get(lastPersistedAtom)
        const newState = { ...current, showActions }
        set(lastPersistedAtom, newState)
        await saveToStorage(newState)
    }
)

export const sortByAtom = atom(
    null,
    async (get, set, part: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const sortType = nextSortType(part, current.sortType)
        const newState = { ...current, sortType }
        set(lastPersistedAtom, newState)
        // Also re-sort the diff
        if (computed.diff) {
            set(lastComputedAtom, {
                ...computed,
                diff: cloneSortList(computed.diff, sortType)
            })
        }
        await saveToStorage(newState)
    }
)

export const includeItemAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find(i => i.key === key)
        if (!item) return

        const diff = computed.diff?.map(i => i.key === key ? { ...i, e: false } : i)
        const blacklist = current.blacklist.filter(s => s !== item.n)
        if (diff) _applyWarning(diff, blacklist)
        const delta = Number(computed.delta) + getValue(item)

        const newState = { ...current, blacklist }
        set(lastPersistedAtom, newState)
        set(lastComputedAtom, { ...computed, delta, diff })
        await saveToStorage(newState)
    }
)

export const excludeItemAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find(i => i.key === key)
        if (!item) return

        const diff = computed.diff?.map(i => i.key === key ? { ...i, e: true } : i)
        let blacklist = current.blacklist
        if (!blacklist.includes(item.n)) {
            blacklist = [...blacklist, item.n]
        }
        if (diff) _applyWarning(diff, blacklist)
        const delta = Number(computed.delta) - getValue(item)

        const newState = { ...current, blacklist }
        set(lastPersistedAtom, newState)
        set(lastComputedAtom, { ...computed, delta, diff })
        await saveToStorage(newState)
    }
)

export const excludeWarningsAtom = atom(
    null,
    async (get, set) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)

        let delta = Number(computed.delta)
        computed.diff?.forEach(item => {
            if (item.w && !item.e) {
                delta -= getValue(item)
            }
        })
        const diff = computed.diff?.map(i => ({ ...i, e: i.e || i.w, w: false }))

        set(lastComputedAtom, { ...computed, delta, diff })
    }
)

export const permanentExcludeOnAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find(i => i.key === key)
        if (!item) return

        const diff = computed.diff?.map(i => i.key === key ? { ...i, x: true } : i)
        let permanentBlacklist = current.permanentBlacklist || []
        if (!permanentBlacklist.includes(item.n)) {
            permanentBlacklist = [...permanentBlacklist, item.n]
        }

        const newState = { ...current, permanentBlacklist }
        set(lastPersistedAtom, newState)
        set(lastComputedAtom, { ...computed, diff })
        await saveToStorage(newState)
    }
)

export const permanentExcludeOffAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const item = computed.diff?.find(i => i.key === key)
        if (!item) return

        const diff = computed.diff?.map(i => i.key === key ? { ...i, x: false } : i)
        const permanentBlacklist = current.permanentBlacklist.filter(s => s !== item.n)

        const newState = { ...current, permanentBlacklist }
        set(lastPersistedAtom, newState)
        set(lastComputedAtom, { ...computed, diff })
        await saveToStorage(newState)
    }
)

export const setLastItemModeAtom = atom(
    null,
    (get, set, { key, mode }: { key: number, mode: { type: number, data: any } | undefined }) => {
        const computed = get(lastComputedAtom)
        const diff = computed.diff?.map(d => d.key === key ? { ...d, m: mode } : d)
        set(lastComputedAtom, { ...computed, diff })
    }
)

export const addPedsAtom = atom(
    null,
    async (get, set, value: string) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const pedValue = Number(value)
        const peds = [...current.peds, { key: Date.now(), value: pedValue.toFixed(2) }]
        const delta = Number(computed.delta) + pedValue

        const newState = { ...current, peds }
        set(lastPersistedAtom, newState)
        set(lastComputedAtom, { ...computed, delta })
        await saveToStorage(newState)
    }
)

export const removePedsAtom = atom(
    null,
    async (get, set, key: number) => {
        const current = get(lastPersistedAtom)
        const computed = get(lastComputedAtom)
        const removedPed = current.peds.find(p => p.key === key)
        const peds = current.peds.filter(p => p.key !== key)
        const delta = Number(computed.delta) - (removedPed ? Number(removedPed.value) : 0)

        const newState = { ...current, peds }
        set(lastPersistedAtom, newState)
        set(lastComputedAtom, { ...computed, delta })
        await saveToStorage(newState)
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
        await saveToStorage(newState)
    }
)

export const addNotificationsDoneAtom = atom(
    null,
    async (get, set, messages: string[]) => {
        const current = get(lastPersistedAtom)
        const notificationsDone = [...current.notificationsDone, ...messages]
        const newState = { ...current, notificationsDone }
        set(lastPersistedAtom, newState)
        await saveToStorage(newState)
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
        await saveToStorage(newState)
    }
)

// Copy diff to clipboard
export const copyLastAtom = atom(
    null,
    (get, _set, useComma: boolean = false) => {
        const computed = get(lastComputedAtom)
        if (computed.diff) {
            const text = computed.diff.map(d =>
                `${d.n}\t${d.q}\t${useComma ? d.v.replace('.', ',') : d.v}`
            ).join('\n')
            navigator.clipboard.writeText(text).catch(err =>
                console.error('Failed to copy text: ', err)
            )
        }
    }
)
