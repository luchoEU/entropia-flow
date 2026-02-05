import { getDefaultStore } from 'jotai'
import { itemsMapAtom } from '../atoms/items'
import { settingsAtom } from '../atoms/settings'
import { ItemsSheetInterfaceCallbacks, syncItemsToSheet, reloadItemsFromSheet } from './itemsSheetSynchronization'
import sheetsApi from '../../services/api/sheets/sheets'
import { saveItemsToStorage } from '../atoms/itemsStorage'

// Track the current stage for progress updates
let currentStage = 0

// Track debounce timeout ID
let debounceTimeoutId: NodeJS.Timeout | null = null
let countdownIntervalId: NodeJS.Timeout | null = null

const getCallbacks = (setStage: (stage: number) => void): ItemsSheetInterfaceCallbacks => ({
    setStage,
    getItemsSheet: async (settings) => {
        return await sheetsApi.loadItemsSheet(settings, setStage)
    }
})

export async function syncItemsSheetFunc() {
    const store = getDefaultStore()
    const itemsState = store.get(itemsMapAtom)
    const settings = store.get(settingsAtom)

    // Skip if persistence mode is 'browser'
    if (settings.sheet.itemsSheetPersistenceMode === 'browser') {
        return
    }

    // Build the state object with the map
    const itemsStateWithMap = {
        map: itemsState,
        editModeMaterialName: undefined
    }

    const setStage = (stage: number) => {
        currentStage = stage
    }

    await syncItemsToSheet(settings, itemsStateWithMap, getCallbacks(setStage))
}

export async function startItemsSheetSyncDebounce(
    set: any,
    setItemsSyncStatusAtom: any,
    setItemsDebounceTimeAtom: any
): Promise<void> {
    const DEBOUNCE_MS = 3000

    // Clear any existing timers
    if (debounceTimeoutId) clearTimeout(debounceTimeoutId)
    if (countdownIntervalId) clearInterval(countdownIntervalId)

    // Set status to pending
    set(setItemsSyncStatusAtom, 'pending')
    set(setItemsDebounceTimeAtom, DEBOUNCE_MS)

    // Start countdown timer
    let remaining = DEBOUNCE_MS
    countdownIntervalId = setInterval(() => {
        remaining -= 100
        if (remaining > 0) {
            set(setItemsDebounceTimeAtom, remaining)
        } else {
            if (countdownIntervalId) clearInterval(countdownIntervalId)
            set(setItemsDebounceTimeAtom, 0)
        }
    }, 100) as any

    // Set debounce timeout
    debounceTimeoutId = setTimeout(async () => {
        if (countdownIntervalId) clearInterval(countdownIntervalId)

        try {
            set(setItemsSyncStatusAtom, 'syncing')
            await syncItemsSheetFunc()
            set(setItemsSyncStatusAtom, 'idle')
        } catch (error) {
            console.error('Failed to sync items to sheet:', error)
            set(setItemsSyncStatusAtom, 'error')
        }
    }, DEBOUNCE_MS) as any
}

export async function reloadItemsSheetFunc(): Promise<void> {
    const store = getDefaultStore()
    const settings = store.get(settingsAtom)
    const currentItems = store.get(itemsMapAtom)

    // Skip if persistence mode is 'browser'
    if (settings.sheet.itemsSheetPersistenceMode === 'browser') {
        console.log('Items persistence mode is browser storage, skipping sheet reload')
        return
    }

    const setStage = (stage: number) => {
        currentStage = stage
    }

    try {
        const sheetItems = await reloadItemsFromSheet(settings, getCallbacks(setStage))

        // Merge sheet data with local data to preserve non-synced fields (calc, web, user, refined)
        const mergedItems = { ...currentItems }
        for (const itemName in sheetItems) {
            const sheetItem = sheetItems[itemName]
            const localItem = currentItems[itemName]

            // Merge: keep synced fields from sheet, preserve local-only fields
            mergedItems[itemName] = {
                ...localItem,
                ...sheetItem,
                // Ensure local-only fields are preserved
                calc: localItem?.calc,
                web: localItem?.web,
                user: localItem?.user,
                refined: localItem?.refined
            }
        }

        // Update the atom with merged items
        store.set(itemsMapAtom, mergedItems)

        // Save to storage
        await saveItemsToStorage(mergedItems)

        console.log('Items reloaded from sheet:', Object.keys(sheetItems).length, 'items (merged with local data)')
    } catch (error) {
        console.error('Failed to reload items from sheet:', error)
        throw error
    }
}
