import { atom } from 'jotai'
import { Inventory } from '../../../common/state'
import { ViewItemData, ViewInventory } from '../state/history'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import {
    getText,
    getLatestFromInventoryList,
    reduceSetHistoryList,
    reduceHistorySortBy,
    reduceToggleActionsView
} from '../helpers/history'

const STORAGE_KEY = 'view.history'

// Persisted UI state
interface HistoryUIState {
    expandedItems: number[]
    sortTypes: { [key: number]: number }
    showActionsMap: { [key: number]: boolean }
}

const initialUIState: HistoryUIState = {
    expandedItems: [],
    sortTypes: {},
    showActionsMap: {}
}

// Computed state (not persisted)
interface HistoryComputedState {
    list: ViewInventory[]
    hiddenError?: string
}

const initialComputedState: HistoryComputedState = {
    list: [],
    hiddenError: undefined
}

// Base atoms
export const historyUIAtom = atom<HistoryUIState>(initialUIState)
export const historyComputedAtom = atom<HistoryComputedState>(initialComputedState)
export const historyLoadingAtom = atom<boolean>(true)

// Persistence helper
const saveUIToStorage = async (state: HistoryUIState) => {
    await LOCAL_STORAGE.set(STORAGE_KEY, state)
}

// Load UI state from storage
const loadUIFromStorage = async (): Promise<HistoryUIState | null> => {
    return await LOCAL_STORAGE.get(STORAGE_KEY)
}

// Initialize history state from storage
export const initializeHistoryAtom = atom(
    null,
    async (get, set) => {
        const stored = await loadUIFromStorage()
        if (stored) {
            set(historyUIAtom, {
                ...initialUIState,
                ...stored
            })
        }
        set(historyLoadingAtom, false)
    }
)

// Write atoms (actions)

export const setHistoryListAtom = atom(
    null,
    (get, set, { list, last }: { list: Inventory[], last?: number }) => {
        const currentUI = get(historyUIAtom)

        // Create initial state with empty list
        const initialHistoryState: HistoryComputedState = {
            list: [],
            hiddenError: undefined
        }

        // Use the helper function to reduce the history list
        const newHistoryState = reduceSetHistoryList(initialHistoryState, list, last)

        // Update computed state
        set(historyComputedAtom, newHistoryState)
    }
)

export const setItemExpandedAtom = atom(
    null,
    async (get, set, { key, expanded }: { key: number, expanded: boolean }) => {
        const currentUI = get(historyUIAtom)
        const currentComputed = get(historyComputedAtom)

        // Update persisted UI state
        const newExpandedItems = expanded
            ? [...currentUI.expandedItems, key]
            : currentUI.expandedItems.filter(k => k !== key)
        const newUI = { ...currentUI, expandedItems: newExpandedItems }
        set(historyUIAtom, newUI)
        await saveUIToStorage(newUI)

        // Update computed list
        const newList = currentComputed.list.map(inv =>
            inv.key === key ? { ...inv, expanded } : inv
        )
        set(historyComputedAtom, { ...currentComputed, list: newList })
    }
)

export const sortByAtom = atom(
    null,
    async (get, set, { key, part }: { key: number, part: number }) => {
        const currentUI = get(historyUIAtom)
        const currentComputed = get(historyComputedAtom)

        // Use the helper to update the history state
        const updatedState = reduceHistorySortBy(currentComputed, key, part)

        // Find the item that was sorted
        const sortedItem = updatedState.list.find(inv => inv.key === key)
        if (sortedItem) {
            const newSortTypes = { ...currentUI.sortTypes, [key]: sortedItem.sortType }
            const newUI = { ...currentUI, sortTypes: newSortTypes }
            set(historyUIAtom, newUI)
            await saveUIToStorage(newUI)
        }

        set(historyComputedAtom, updatedState)
    }
)

export const toggleActionsViewAtom = atom(
    null,
    async (get, set, key: number) => {
        const currentUI = get(historyUIAtom)
        const currentComputed = get(historyComputedAtom)

        // Use the helper to update the history state
        const updatedState = reduceToggleActionsView(currentComputed, key)

        // Find the item that was toggled
        const toggledItem = updatedState.list.find(inv => inv.key === key)
        if (toggledItem) {
            const newShowActionsMap = { ...currentUI.showActionsMap, [key]: toggledItem.showActions }
            const newUI = { ...currentUI, showActionsMap: newShowActionsMap }
            set(historyUIAtom, newUI)
            await saveUIToStorage(newUI)
        }

        set(historyComputedAtom, updatedState)
    }
)

export const exportToFileAtom = atom(
    null,
    (get, _set, key: number) => {
        const { list } = get(historyComputedAtom)
        const inv = list.find(i => i.key === key)
        if (!inv) return

        const data = JSON.stringify({
            date: new Date(inv.rawInventory.meta.lastDate ?? inv.rawInventory.meta.date).toString(),
            items: inv.rawInventory.itemlist
        }, null, 2)

        // Save to file
        const blob = new Blob([data], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'entropia-flow-items.json'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        }, 0)
    }
)
