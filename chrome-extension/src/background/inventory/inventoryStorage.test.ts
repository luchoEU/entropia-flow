import '@jest/globals'
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
import IStorageArea from '../../chrome/IStorageArea'
//import { test, beforeEach, describe, expect } from '@jest/globals'

traceOff()

//// Mock ////

class TestStorageArea implements IStorageArea {
    storage: any = {}

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

const INV_STORED = "EAIBAQXDqQDEASM="
//{
//  itemlist: [{ id: '1', n: 'hola', q: '5', v: '2.33', c: 'chau', r: '0' }],
//  meta: { date: 35, total: '2.33' }
//}

const INV_STRINGS = "[\"chau\",\"hola\"]"
const DAY = 24 * 60 * 60 * 1000
const MS = 1 / DAY

function makeInv(day: number, id: string): Inventory {
    return {
        itemlist: [{
            ...SIMPLE_ITEM_DATA,
            n: `item-${id}`
        }],
        meta: { date: day * DAY }
    };
}

//// Tests /////

describe('inventory storage default limit', () => {
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
            expect(area.storage[`${STORAGE_INVENTORY_}1`].length).toBe(8012)
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
                        ...REAL_INVENTORY_1.itemlist!, {
                            ...SIMPLE_ITEM_DATA,
                            id: (REAL_INVENTORY_1.itemlist!.length + 1).toString(),
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
            for (let i = 1; i <= INVENTORY_LIMIT * 2; i++) {
                await inv.add(makeInv(i, `n${i}`));
            }
            const list = await inv.get()
            expect(list.length).toBe(INVENTORY_LIMIT)
        })
    })

    describe('days section tests', () => {
        test('keeps multiple items for the newest day', async () => {
            // same day
            await inv.add(makeInv(10, 'a'));
            await inv.add(makeInv(10, 'b'));
            await inv.add(makeInv(10, 'c'));

            const list = await inv.get();
            expect(list.length).toBe(3);
            expect(list.every(i => i.meta.date === 10 * DAY)).toBe(true);
        });

        test('preserves order newest to oldest after prune', async () => {
            await inv.add(makeInv(.3, 'b'));
            await inv.add(makeInv(.2, 'c'));
            await inv.add(makeInv(.1, 'd'));

            const list = await inv.get();
            const dates = list.map(i => i.meta.date / DAY);
            expect(dates).toEqual([.1, .2, .3]);
        });
    })

    test('date separator', async () => {
        await inv.add(makeInv(1, 'a'));
        await inv.add(makeInv(1.1, 'b'));
        await inv.add(makeInv(2, 'c'));
        const list = await inv.get()
        const days = list.map(i => i.meta.date / DAY);
        expect(days).toEqual([1, 1.1, 1.1 + MS, 2]);
        expect(list[2].log?.message).toBe(new Date(1 * DAY).toDateString());
    })
})

describe('inventory storage custom limit', () => {
    let area: TestStorageArea

    beforeEach(() => {
        area = new TestStorageArea()
    })

    test('does not remove items when exactly at limit', async () => {
        const inv = new InventoryStorage(area, 3, 0);
        for (let i = 0; i < 3; i++) {
            await inv.add(makeInv(i / 10, i.toString()));
        }

        const list = await inv.get();
        const days = list.map(i => i.meta.date / DAY);

        expect(days).toEqual([0, .1, .2]);
    });

    test('keep date', async () => {
        const inv = new InventoryStorage(area, 5, 2)
        for (let i = 1; i <= 10; i++) {
            await inv.add(makeInv(i, i.toString()), 3 * DAY);
        }
        const list = await inv.get()
        const days = list.map(i => i.meta.date / DAY);

        expect(days).toEqual([3, 8, 9, 9+MS, 10]);
    })

    test('no date when keep is at border', async () => {
        const inv = new InventoryStorage(area, 5, 2)
        await inv.add(makeInv(1, 'a'))
        await inv.add(makeInv(2, 'b'))
        for (let i = 1; i <= 9; i++) {
            await inv.add(makeInv(2 + i * .1, i.toString()), 2.6 * DAY);
        }
        const list = await inv.get()
        const days = list.map(i => i.meta.date / DAY);
        const byDays = list.map(i => i.meta.byDays);

        expect(days).toEqual([1, 2.6, 2.7, 2.8, 2.9]);
        expect(byDays).toEqual([true, false, false, false, false]);
    })
})
