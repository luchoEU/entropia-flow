// Track debounce timeout ID
let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null
let countdownIntervalId: ReturnType<typeof setInterval> | null = null

export function startItemsSheetSyncDebounce(
    setSyncStatus: (status: 'pending' | 'syncing' | 'idle' | 'error') => void,
    setDebounceTime: (time: number) => void,
    syncFunc: (setSheetUrl: (url: string) => void, setError: (error: string | undefined) => void) => Promise<void>,
    setSheetUrl: (url: string) => void,
    setError: (error: string | undefined) => void
): void {
    const DEBOUNCE_MS = 3000

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
