import { getDefaultStore } from 'jotai'
import { itemsMapAtom, itemsSheetUrlAtom, itemsSyncErrorAtom } from '../atoms/items'
import { settingsAtom } from '../atoms/settings'
import { ItemsSheetInterfaceCallbacks, syncItemsToSheet, reloadItemsFromSheet } from './itemsSheetSynchronization'
import sheetsApi from '../../services/api/sheets/sheets'

// Track the current stage for progress updates
let currentStage = 0

// Track debounce timeout ID
let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null
let countdownIntervalId: ReturnType<typeof setInterval> | null = null

const getCallbacks = (setStage: (stage: number) => void): ItemsSheetInterfaceCallbacks => ({
    setStage,
    getItemsSheet: async (settings) => {
        const sheet = await sheetsApi.loadItemsSheet(settings, setStage)
        if (!sheet) {
            throw new Error('Failed to load items sheet')
        }
        return sheet
    }
})

export async function syncItemsSheetFunc(setSheetUrl: (url: string) => void, setError: (error: string | undefined) => void) {
    const store = getDefaultStore()
    const itemsState = store.get(itemsMapAtom)

    // Read settings from both atom and localStorage to ensure we get the latest
    let settings = store.get(settingsAtom)

    // If atom shows undefined/empty, try to load from localStorage directly
    if (!settings.sheet?.budgetDocumentId && !settings.sheet?.itemsSheetPersistenceMode) {
        try {
            const storedSheet = localStorage.getItem('settings-sheet')
            const storedFeatures = localStorage.getItem('settings-features')

            if (storedSheet) {
                const sheet = JSON.parse(storedSheet)
                const features = storedFeatures ? JSON.parse(storedFeatures) : []
                settings = { sheet, features }
            }
        } catch (error) {
            console.warn('[ItemsSync] Failed to load from localStorage:', error)
        }
    }

    // Skip if persistence mode is 'browser' or if sheet credentials are not configured
    if (
        !settings.sheet ||
        settings.sheet.itemsSheetPersistenceMode === 'browser' ||
        !settings.sheet.budgetDocumentId ||
        settings.sheet.itemsSheetPersistenceMode === undefined
    ) {
        let errorMsg = 'Sheet sync disabled'
        if (!settings.sheet) {
            errorMsg = 'Sheet configuration not loaded'
        } else if (settings.sheet.itemsSheetPersistenceMode === undefined) {
            errorMsg = 'Sheet persistence mode not configured'
        } else if (settings.sheet.itemsSheetPersistenceMode === 'browser') {
            errorMsg = 'Using browser storage (sheet sync disabled)'
        } else if (!settings.sheet.budgetDocumentId) {
            errorMsg = 'Google Sheets not configured'
        }
        console.warn('[ItemsSync] Skipping sync -', errorMsg)
        setError(errorMsg)
        return
    }

    setError(undefined)

    // Build the state object with the map
    const itemsStateWithMap = {
        map: itemsState,
        editModeMaterialName: undefined
    }

    const setStage = (stage: number) => {
        currentStage = stage
    }

    try {
        // Load the sheet and cache its URL
        const itemsSheet = await sheetsApi.loadItemsSheet(settings, setStage)
        if (itemsSheet) {
            const url = itemsSheet.getUrl()
            setSheetUrl(url)
        } else {
            console.warn('Failed to load items sheet - returned undefined')
        }

        await syncItemsToSheet(settings, itemsStateWithMap, getCallbacks(setStage))
    } catch (error) {
        console.error('Error in syncItemsSheetFunc:', error)
        throw error
    }
}

export function startItemsSheetSyncDebounce(
    setSyncStatus: (status: 'pending' | 'syncing' | 'idle' | 'error') => void,
    setDebounceTime: (time: number) => void,
    syncFunc: (setSheetUrl: (url: string) => void, setError: (error: string | undefined) => void) => Promise<void>,
    setSheetUrl: (url: string) => void,
    setError: (error: string | undefined) => void
): void {
    const DEBOUNCE_MS = 3000

    console.log('[ItemsSync] Starting debounce...')

    // Clear any existing timers
    if (debounceTimeoutId) clearTimeout(debounceTimeoutId)
    if (countdownIntervalId) clearInterval(countdownIntervalId)

    // Set status to pending
    setSyncStatus('pending')
    setDebounceTime(DEBOUNCE_MS)

    // Start countdown timer
    let remaining = DEBOUNCE_MS
    countdownIntervalId = setInterval(() => {
        remaining -= 100
        if (remaining > 0) {
            setDebounceTime(remaining)
        } else {
            if (countdownIntervalId) clearInterval(countdownIntervalId)
            setDebounceTime(0)
        }
    }, 100)

    // Set debounce timeout
    debounceTimeoutId = setTimeout(async () => {
        if (countdownIntervalId) clearInterval(countdownIntervalId)

        try {
            setSyncStatus('syncing')
            await syncFunc(setSheetUrl, setError)
            setSyncStatus('idle')
        } catch (error) {
            console.error('[ItemsSync] Failed to sync items to sheet:', error)
            setSyncStatus('error')
        }
    }, DEBOUNCE_MS)
}

export async function reloadItemsSheetFunc(): Promise<void> {
    const store = getDefaultStore()
    const settings = store.get(settingsAtom)
    const currentItems = store.get(itemsMapAtom)

    // Skip if persistence mode is 'browser' or if sheet credentials are not configured
    if (
        !settings.sheet ||
        settings.sheet.itemsSheetPersistenceMode === 'browser' ||
        !settings.sheet.budgetDocumentId ||
        settings.sheet.itemsSheetPersistenceMode === undefined
    ) {
        console.log('Items persistence mode is browser storage or not configured, skipping sheet reload')
        return
    }

    const setStage = (stage: number) => {
        currentStage = stage
    }

    try {
        // Load the sheet and cache its URL
        const itemsSheet = await sheetsApi.loadItemsSheet(settings, setStage)
        if (itemsSheet) {
            const url = itemsSheet.getUrl()
            console.log('Items sheet loaded, URL:', url)
            store.set(itemsSheetUrlAtom, url)
        } else {
            console.warn('Failed to load items sheet - returned undefined')
        }

        const sheetItems = await reloadItemsFromSheet(settings, getCallbacks(setStage))

        // Merge sheet data with local data to preserve non-synced fields (web, user, refined)
        const mergedItems = { ...currentItems }
        for (const itemName in sheetItems) {
            const sheetItem = sheetItems[itemName]
            const localItem = currentItems[itemName]

            // Merge: keep synced fields from sheet, preserve local-only fields
            mergedItems[itemName] = {
                ...localItem,
                ...sheetItem,
                // Ensure local-only fields are preserved
                web: localItem?.web,
                user: localItem?.user,
                refined: localItem?.refined
            }
        }

        // Update the atom with merged items (atomWithStorage will persist automatically)
        store.set(itemsMapAtom, mergedItems)

        console.log('Items reloaded from sheet:', Object.keys(sheetItems).length, 'items (merged with local data)')
    } catch (error) {
        console.error('Failed to reload items from sheet:', error)
        throw error
    }
}
