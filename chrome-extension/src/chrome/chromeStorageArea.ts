import { Component, traceError } from '../common/trace'
import IStorageArea from './IStorageArea'

class ChromeStorageArea implements IStorageArea {
    private area: chrome.storage.StorageArea

    constructor(area: chrome.storage.StorageArea) {
        this.area = area
    }

    async get(name: string): Promise<any> {
        // promise version doesn't work, chrome 92
        const promise = new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            this.area.get(name, (result) => {
                if (chrome.runtime.lastError)
                    reject(chrome.runtime.lastError)
                else
                    resolve(result[name])
            })
        })
        return await promise
    }

    async set(name: string, value: any): Promise<void> {
        this.area.set({ [name]: value }, () => {
            const error = chrome.runtime.lastError;
            if (error) {
                const errorMessage = error.message || 'Unknown error occurred';
                traceError(Component.ChromeStorageArea, `set value in '${name}' length ${JSON.stringify(value).length} error ${errorMessage}:`, error)
                throw new Error(errorMessage)
            }
        })
    }

    async remove(name: string): Promise<void> {
        return await this.area.remove(name)
    }

    async clear(): Promise<void> {
        return await this.area.clear()
    }
}

const LOCAL_STORAGE = new ChromeStorageArea(chrome.storage.local)
const SYNC_STORAGE = new ChromeStorageArea(chrome.storage.sync)

export {
    LOCAL_STORAGE,
    SYNC_STORAGE
}