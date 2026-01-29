import { atom } from 'jotai'
import { Inventory } from '../../../common/state'
import { ViewItemData, ViewInventory } from '../state/history'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import {
    getText,
    getLatestFromInventoryList,
    reduceHistorySortBy,
    reduceToggleActionsView
} from '../helpers/history'
import { getDifference } from '../helpers/diff'

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
export const inventoryListAtom = atom<Inventory[]>([])
export const historyLoadingAtom = atom<boolean>(true)

// Computed atoms
export const historyAtom = atom<HistoryComputedState>(get => {
    const list = get(inventoryListAtom)
    const ui = get(historyUIAtom)
    const viewList: ViewInventory[] = []

    for (let n = 0; n < list.length; n++) {
        const inv = list[n]
        let prev: Inventory | undefined = undefined
        let m = n + 1
        while (prev === undefined && m < list.length) {
            if (list[m].itemlist !== undefined)
                prev = list[m]
            else
                m++
        }

        const key = inv.meta.date * 1000000 + n
        const expanded = ui.expandedItems.includes(key)
        const sortType = ui.sortTypes[key] ?? 0
        const showActions = ui.showActionsMap[key] ?? true

        viewList.push({
            key,
            text: getText(inv),
            info: '',
            class: '',
            expanded,
            sortType,
            canBeLast: inv.log === undefined,
            diff: getDifference(inv, prev),
            rawInventory: inv,
            showActions
        } as ViewInventory)
    }

    return {
        list: viewList,
        hiddenError: viewList.length > 0 && !viewList[0].canBeLast ? viewList[0].text : undefined
    }
})

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

export const setItemExpandedAtom = atom(
    null,
    async (get, set, { key, expanded }: { key: number, expanded: boolean }) => {
        const currentUI = get(historyUIAtom)

        // Update persisted UI state
        const newExpandedItems = expanded
            ? [...currentUI.expandedItems, key]
            : currentUI.expandedItems.filter(k => k !== key)
        const newUI = { ...currentUI, expandedItems: newExpandedItems }
        set(historyUIAtom, newUI)
        await saveUIToStorage(newUI)
    }
)

export const sortByAtom = atom(
    null,
    async (get, set, { key, part }: { key: number, part: number }) => {
        const currentUI = get(historyUIAtom)
        const currentComputed = get(historyAtom)

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
    }
)

export const toggleActionsViewAtom = atom(
    null,
    async (get, set, key: number) => {
        const currentUI = get(historyUIAtom)
        const currentComputed = get(historyAtom)

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
    }
)

export const exportToFileAtom = atom(
    null,
    (get, _set, key: number) => {
        const { list } = get(historyAtom)
        const inventories = get(inventoryListAtom)
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
