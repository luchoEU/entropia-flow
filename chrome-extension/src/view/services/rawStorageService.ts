import pako from 'pako'

type StorageArea = 'sync' | 'local'

interface StorageInfo {
    bytes: number
    quota: number
    available: number
    percentUsed: number
}

function isCompressed(value: any): boolean {
    if (typeof value !== 'string') return false
    // Check if it looks like base64 (compressed values are stored as base64)
    try {
        return /^[A-Za-z0-9+/=]+$/.test(value) && value.length > 20
    } catch {
        return false
    }
}

function tryDecompress(value: any): any {
    if (!isCompressed(value)) return value

    try {
        const compressedData = Buffer.from(value, 'base64')
        const uncompressed = pako.inflate(compressedData, { to: 'string' })
        return JSON.parse(uncompressed)
    } catch {
        // If decompression fails, return original value
        return value
    }
}

async function getAllSyncStorage(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve(result || {})
            }
        })
    })
}

async function getAllLocalStorage(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(null, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve(result || {})
            }
        })
    })
}

async function getStorageValue(area: StorageArea, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local
        storage.get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve(result[key])
            }
        })
    })
}

async function setStorageValue(area: StorageArea, key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local
        storage.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve()
            }
        })
    })
}

async function deleteStorageKey(area: StorageArea, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local
        storage.remove(key, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve()
            }
        })
    })
}

async function clearStorage(area: StorageArea): Promise<void> {
    return new Promise((resolve, reject) => {
        const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local
        storage.clear(() => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            } else {
                resolve()
            }
        })
    })
}

async function getStorageInfo(area: StorageArea): Promise<StorageInfo> {
    return new Promise((resolve, reject) => {
        const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local

        if (!storage.getBytesInUse) {
            // Fallback for browsers that don't support getBytesInUse
            resolve({
                bytes: 0,
                quota: 0,
                available: 0,
                percentUsed: 0
            })
            return
        }

        storage.getBytesInUse(null, (bytes) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
                return
            }

            // Chrome storage quota limits
            // Sync: 100 KB per item, 100 KB total
            // Local: 10 MB per item, 5-10 MB total (depends on browser)
            const quota = area === 'sync' ? 102400 : 10485760
            const available = Math.max(0, quota - bytes)
            const percentUsed = quota > 0 ? (bytes / quota) * 100 : 0

            resolve({
                bytes,
                quota,
                available,
                percentUsed
            })
        })
    })
}

export {
    getAllSyncStorage,
    getAllLocalStorage,
    getStorageValue,
    setStorageValue,
    deleteStorageKey,
    clearStorage,
    getStorageInfo,
    isCompressed,
    tryDecompress,
    type StorageArea,
    type StorageInfo
}
