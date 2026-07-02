import { atom, WritableAtom } from 'jotai'
import { PersistedLastState, ComputedLastState, ViewPedData } from '../state/last'
import { ViewItemData } from '../state/history'
import { SYNC_STORAGE } from '../../../chrome/chromeStorageArea'
import { SORT_VALUE_DESCENDING, nextSortType } from '../helpers/inventory.sort'
import { getLatestFromInventoryList, getText, copyDiffToClipboard } from '../helpers/history'
import { calculateInventoryDelta, _sumDiff } from '../helpers/lastDelta'
import messagesApi from '../../services/api/messages'
import { historyAtom, INVENTORY_KEY_SCALE } from './history'
import { atomWithStorage } from 'jotai/utils'
import { STORAGE_VIEW_LAST } from '../../../common/const'
import { itemsMapAtom } from './items'
import { currentGameLogDataAtom } from './gameLog'
import { GameLogData } from '../../../background/client/gameLogData'

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

// Cached storage data - initialized to initial state
let cachedLastData = initialPersistedState

// Base atom for persisted last state
export const lastPersistedAtom = atomWithStorage<PersistedLastState>(
    STORAGE_VIEW_LAST,
    initialPersistedState,
    {
        getItem: (_key: string): PersistedLastState => cachedLastData,
        setItem: async (_key: string, value: PersistedLastState): Promise<void> => {
            try {
                cachedLastData = value
                await SYNC_STORAGE.set(STORAGE_VIEW_LAST, value)
            } catch (error) {
                console.error('Failed to save last state to storage:', error)
            }
        },
        removeItem: (_key: string): void => {
            // Not used
        }
    }
)

/**
 * Initialize last state from Chrome storage
 * Called on app startup to load persisted data
 */
export async function initializeLastFromStorage(): Promise<void> {
    try {
        const storedState = await SYNC_STORAGE.get(STORAGE_VIEW_LAST)
        if (storedState) {
            cachedLastData = storedState
        }
    } catch (error) {
        console.error('Failed to initialize last state from storage:', error)
    }
}

/**
 * Initialize last atom - loads from storage
 * Call once on app startup via: await store.set(initializeLastAtom)
 */
export const initializeLastAtom = atom(
    null,
    async (_get, set) => {
        await initializeLastFromStorage()
        set(lastPersistedAtom, cachedLastData)
    }
)

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
            itemsTotalPed: 0,
        }
    }

    // Use shared calculation function
    const itemsMap = get(itemsMapAtom)
    const result = calculateInventoryDelta({
        lastInv,
        inv,
        previousDiff: undefined,
        blacklist: persisted.blacklist,
        permanentBlacklist: persisted.permanentBlacklist,
        sortType: persisted.sortType,
        peds: persisted.peds,
        itemsMap
    })

    // Use preference to determine which delta to return
    const d = persisted.showMarkup ? result.deltaWithMarkup : result.deltaNoMarkup
    const itemsTotalPed = _sumDiff(result.diff ?? undefined, persisted.showMarkup ? itemsMap : {})

    return {
        delta: d,
        anyInventory: true,
        text: getText(inv, true),
        date: lastTimestamp,
        diff: result.diff || undefined,
        latestInventoryKey,
        itemsTotalPed,
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

export interface HunterSessionSnapshot {
    persisted: PersistedLastState
    gameLog: GameLogData
    lastTimestamp: number
}

// Reset hunter session: set current inventory as baseline, clear game log, and preserve blacklist
// Returns a snapshot for undo
export const resetHunterSessionAtom = atom(
    null,
    async (get, set): Promise<HunterSessionSnapshot> => {
        const snapshot: HunterSessionSnapshot = {
            persisted: get(lastPersistedAtom),
            gameLog: get(currentGameLogDataAtom),
            lastTimestamp: get(lastTimestampAtom),
        }

        const computed = get(lastComputedAtom)
        if (computed.latestInventoryKey) {
            messagesApi.requestSetLast(true, computed.latestInventoryKey)
        }
        set(lastPersistedAtom, {
            ...snapshot.persisted,
            expanded: false,
            peds: [],
            notificationsDone: []
        })

        return snapshot
    }
)

// Undo a hunter session reset by restoring the saved snapshot
export const undoResetHunterSessionAtom = atom(
    null,
    async (_get, set, snapshot: HunterSessionSnapshot) => {
        set(lastPersistedAtom, snapshot.persisted)
        messagesApi.requestSetLast(false, snapshot.lastTimestamp)
        messagesApi.restoreGameLog(snapshot.gameLog)
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
