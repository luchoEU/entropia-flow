import {
    CLASS_NEW_DATE,
    INVENTORY_LIMIT,
    STORAGE_INVENTORY_,
    STORAGE_INVENTORY_STRINGS_,
    STORAGE_QUOTA_BYTES_PER_ITEM
} from '../../common/const'
import { areEqualInventoryList, Inventory, makeLogInventory } from '../../common/state'
import { traceError } from '../../common/trace'
import StringTable from './stringTable'
import IStorageArea from '../../chrome/IStorageArea'
import LZUTF8 from 'lzutf8'
import { serializeInventory, deserializeInventory, serializeStrings } from './inventorySerialization'
import { matchDate } from '../../common/date'

class InventoryStorage {
    private area: IStorageArea
    private list: Array<Inventory>

    constructor(area: IStorageArea) {
        this.area = area
    }

    public async get(): Promise<Array<Inventory>> {
        if (!this.list) {
            this.list = await this._readFromStorage()
        }
        return this.list
    }

    private async _set(list: Array<Inventory>) {
        this.list = list
        await this._writeToStorage(list)
    }

    public async tag(date: number, tag: any): Promise<void> {
        const list = await this.get()
        const item = list.find(v => v.meta.date == date)
        if (item !== undefined) {
            item.tag = {
                ...item.tag,
                ...tag
            }
            await this._set(list)
        }
    }

    public async add(inventory: Inventory, keepDate?: number): Promise<Array<Inventory>> {
        let pushNew = true
        const list = await this.get()
        if (list.length > 0) {
            const last = list[list.length - 1]
            const newDate = new Date()
            newDate.setTime(inventory.meta.date)
            const oldDate = new Date()
            oldDate.setTime(last.meta.date)
            if (newDate.toDateString() === oldDate.toDateString()) {
                // same day
                if (areEqualInventoryList(inventory, last)) {
                    last.meta.lastDate = inventory.meta.date
                    if (inventory.tag !== undefined)
                        last.tag = { ...last.tag, ...inventory.tag }
                    pushNew = false
                }
            } else {
                const invNewDate = makeLogInventory(CLASS_NEW_DATE, oldDate.toDateString())
                invNewDate.meta.date = last.meta.date + 1 // change it else it may be equal to inventor.meta.date
                list.push(invNewDate)
            }
        }

        if (pushNew) {
            list.push(inventory)
            while (list.length > INVENTORY_LIMIT) {
                if (matchDate(list[0], keepDate))
                    list.splice(1, 1)
                else
                    list.shift()
            }
        }

        await this._set(list)
        return list;
    }

    private async _readFromStorage(): Promise<Array<Inventory>> {
        let list = []

        try {
            const sSplits = await this.area.get(`${STORAGE_INVENTORY_STRINGS_}N`)
            if (sSplits !== undefined) {
                let stringBest = ""
                for (let n = 1; n <= sSplits; n++) {
                    const s = await this.area.get(`${STORAGE_INVENTORY_STRINGS_}${n}`)
                    stringBest = stringBest + s
                }
                let stringJson = undefined
                if (stringBest[0] === '[') {
                    stringJson = JSON.parse(stringBest)
                } else {
                    stringJson = JSON.parse(LZUTF8.decompress(stringBest, { inputEncoding: 'Base64' }))
                }
                const strings = new StringTable(stringJson)

                const iSplits = await this.area.get(`${STORAGE_INVENTORY_}N`)
                let invStored = ""
                for (let m = 1; m <= iSplits; m++) {
                    const s = await this.area.get(`${STORAGE_INVENTORY_}${m}`)
                    invStored = invStored + s
                }
                let invData = LZUTF8.decompress(invStored, { inputEncoding: 'Base64', outputEncoding: 'ByteArray' })
                list = deserializeInventory(strings, Array.from(invData))
            }
        } catch (e) {
            traceError('InventoryStorage', 'readFromStorage exception:', e)
            this.area.clear()
        }

        return list
    }

    private async _writeToStorage(list: Array<Inventory>) {
        const strings = serializeStrings(list)
        const stringStorage = strings.getToStore()
        const stringJson = JSON.stringify(stringStorage)
        const stringBase64 = LZUTF8.encodeBase64(LZUTF8.compress(stringJson))
        const stringBest = stringBase64.length < stringJson.length ? stringBase64 : stringJson
        const sSplits = Math.ceil(stringBest.length / STORAGE_QUOTA_BYTES_PER_ITEM)
        await this.area.set(`${STORAGE_INVENTORY_STRINGS_}N`, sSplits)
        for (let n = 1; n <= sSplits; n++) {
            const s = stringBest.slice((n - 1) * STORAGE_QUOTA_BYTES_PER_ITEM, n * STORAGE_QUOTA_BYTES_PER_ITEM)
            await this.area.set(`${STORAGE_INVENTORY_STRINGS_}${n}`, s)
        }

        const invData = Uint8Array.from(serializeInventory(strings, list))
        const invStored = LZUTF8.compress(invData, { outputEncoding: 'Base64' })
        const iSplits = Math.ceil(invStored.length / STORAGE_QUOTA_BYTES_PER_ITEM)
        await this.area.set(`${STORAGE_INVENTORY_}N`, iSplits)
        for (let m = 1; m <= iSplits; m++) {
            const s = invStored.slice((m - 1) * STORAGE_QUOTA_BYTES_PER_ITEM, m * STORAGE_QUOTA_BYTES_PER_ITEM)
            await this.area.set(`${STORAGE_INVENTORY_}${m}`, s)
        }
    }
}

export default InventoryStorage
