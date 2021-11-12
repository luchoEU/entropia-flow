import LZUTF8 from 'lzutf8'
import {
    STORAGE_INVENTORY_,
    STORAGE_INVENTORY_STRINGS_,
    STORAGE_QUOTA_BYTES,
    STORAGE_QUOTA_BYTES_PER_ITEM,
    INVENTORY_LIMIT
} from '../../common/const'
import { Inventory } from '../../common/state'
import { traceOff } from '../../common/trace'
import { EMPTY_INVENTORY, REAL_INVENTORY_1, SIMPLE_ITEM_DATA } from '../examples'
import InventoryStorage from './inventoryStorage'
import IStorageArea from '../../chrome/storageAreaInterface'

traceOff()

//// Mock ////

class TestStorageArea implements IStorageArea {
    storage: object = {}

    async get(name: string): Promise<any> {
        return this.storage[name]
    }

    async set(name: string, value: any): Promise<void> {
        this.storage[name] = value
    }

    async remove(name: string): Promise<void> {
        this.storage[name] = undefined
    }

    async clear(): Promise<void> {
        this.storage = {}
    }
}

//// Test data ////

const INV: Inventory = {
    itemlist: [{
        id: '1',
        n: 'hola',
        q: '5',
        v: '2.33',
        c: 'chau',
        r: '0'
    }],
    meta: {
        date: 35,
        total: '2.33'
    }
}

const INV_STORED = "AgEBBcOpAAAAACM="
//{
//  itemlist: [{ id: '1', n: 'hola', q: '5', v: '2.33', c: 'chau', r: '0' }],
//  meta: { date: 35, total: '2.33' }
//}

const INV_STRINGS = "[\"chau\",\"hola\"]"

//// Tests /////

describe('inventory storage', () => {
    let area: TestStorageArea
    let inv: InventoryStorage

    beforeEach(() => {
        area = new TestStorageArea()
        inv = new InventoryStorage(area)
    })

    describe('basic', () => {
        test('empty', async () => {
            expect(await inv.get()).toEqual([])
        })

        test('add 1', async () => {
            await inv.add(EMPTY_INVENTORY)
            expect(await inv.get()).toEqual([EMPTY_INVENTORY])
        })
    })

    describe('store', () => {
        test('save real data', async () => {
            await inv.add(REAL_INVENTORY_1)

            expect(Object.keys(area.storage).length).toBe(5)
            expect(area.storage[`${STORAGE_INVENTORY_STRINGS_}N`]).toBe(2)
            expect(area.storage[`${STORAGE_INVENTORY_STRINGS_}1`].length).toBe(STORAGE_QUOTA_BYTES_PER_ITEM)
            expect(area.storage[`${STORAGE_INVENTORY_STRINGS_}2`].length).toBe(4392)
            expect(area.storage[`${STORAGE_INVENTORY_}N`]).toBe(1)
            expect(area.storage[`${STORAGE_INVENTORY_}1`].length).toBe(8008)
        })

        test('set to storage', async () => {
            await inv.add(INV)
            expect(area.storage[`${STORAGE_INVENTORY_STRINGS_}N`]).toBe(1)
            expect(area.storage[`${STORAGE_INVENTORY_STRINGS_}1`]).toEqual(INV_STRINGS)
            expect(area.storage[`${STORAGE_INVENTORY_}N`]).toBe(1)
            expect(area.storage[`${STORAGE_INVENTORY_}1`]).toEqual(INV_STORED)
        })

        test('get from storage', async () => {
            area.storage[`${STORAGE_INVENTORY_STRINGS_}N`] = 1
            area.storage[`${STORAGE_INVENTORY_STRINGS_}1`] = INV_STRINGS
            area.storage[`${STORAGE_INVENTORY_}N`] = 1
            area.storage[`${STORAGE_INVENTORY_}1`] = INV_STORED
            expect(await inv.get()).toEqual([INV])
        })

        test('total size', async () => {
            for (let n = 1; n <= INVENTORY_LIMIT; n++) {
                await inv.add({
                    itemlist: [
                        ...REAL_INVENTORY_1.itemlist, {
                            ...SIMPLE_ITEM_DATA,
                            id: (REAL_INVENTORY_1.itemlist.length + 1).toString(),
                            n: `name${n}`
                        }
                    ],
                    meta: {
                        date: n
                    }
                })
            }

            let total = 0
            Object.keys(area.storage).forEach(key => {
                const v = area.storage[key]
                const len = v.length ?? JSON.stringify(v).length
                expect(len).toBeLessThanOrEqual(STORAGE_QUOTA_BYTES_PER_ITEM)
                total += len
            })
            //console.log(total)
            expect(total).toBeLessThanOrEqual(STORAGE_QUOTA_BYTES)
        })
    })

    describe('add', () => {
        test('recover data', async () => {
            await inv.add(REAL_INVENTORY_1)
            const newInv = new InventoryStorage(area)
            expect(await newInv.get()).toEqual([REAL_INVENTORY_1])
        })

        test('same inventory', async () => {
            await inv.add(REAL_INVENTORY_1)
            await inv.add(JSON.parse(JSON.stringify(REAL_INVENTORY_1)))
            const list = await inv.get()
            expect(list.length).toBe(1)
            expect(list[0].meta.lastDate).toBe(list[0].meta.date)
        })

        test('limit', async () => {
            for (let n = 1; n <= INVENTORY_LIMIT * 2; n++) {
                await inv.add({
                    itemlist: [{
                        ...SIMPLE_ITEM_DATA,
                        n: `name${n}`
                    }],
                    meta: {
                        date: n
                    }
                })
            }
            const list = await inv.get()
            expect(list.length).toBe(INVENTORY_LIMIT)
        })

        test('keep date', async () => {
            for (let n = 1; n <= INVENTORY_LIMIT * 2; n++) {
                await inv.add({
                    itemlist: [{
                        ...SIMPLE_ITEM_DATA,
                        n: `name${n}`
                    }],
                    meta: {
                        date: n
                    }
                }, 3)
            }
            const list = await inv.get()
            expect(list[0].meta.date).toBe(3)
            expect(list[1].meta.date).toBe(INVENTORY_LIMIT + 2)
        })
    })
})