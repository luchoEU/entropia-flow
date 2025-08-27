import { CLASS_INFO, STRING_NO_DATA } from '../../common/const'
import { Inventory, ItemData, makeLogInventory } from '../../common/state'
import InventoryStorage from './inventoryStorage'

//// INVENTORY ////

class InventoryManager {
    private storage: InventoryStorage
    private listeners: Array<(list: Array<Inventory>) => Promise<void>> = []

    constructor(storage: InventoryStorage) {
        this.storage = storage
    }

    public subscribeOnChanged(callback: (list: Array<Inventory>) => Promise<void>): void {
        this.listeners.push(callback);
    }

    public unsubscribeOnChanged(callback: (list: Array<Inventory>) => Promise<void>): void {
        this.listeners = this.listeners.filter(fn => fn !== callback);
    }

    private async notifyChanged(list: Array<Inventory>): Promise<void> {
        for (const listener of this.listeners) {
            await listener(list);
        }
    }

    public async getList(): Promise<Array<Inventory>> {
        const list = await this.storage.get()
        if (list.length === 0) {
            return [makeLogInventory(CLASS_INFO, STRING_NO_DATA)];
        } else {
            return list;
        }
    }

    public async onNew(inventory: Inventory, keepDate: number): Promise<Array<Inventory>> {
        if (inventory.log === undefined)
            this._adjust(inventory)
        const list = await this.storage.add(inventory, keepDate)
        this.notifyChanged(list)
        return list
    }

    private _adjust(inventory: Inventory) {
        let total = 0;
        inventory.itemlist?.forEach(item => {
            total += Number(item.v)

            item.n = item.n.replace(/&amp;/g, "&"); // Some names have '&amp;' in json but a & when read from html, like 'A&amp;P Series Mayhem LP-100, Modified (L)'
            item.n = item.n.replace(/&apos;/g, "'"); // Some names have '&apos;' in json but a ' when read from html
            item.n = item.n.replace(/\s{2,}/g, ' '); // Some blueprints from Rocktropia have extra spaces
            item.n = item.n.trim(); // Remove extra space at the end of 'Mission Galactica Coin (Green) '

            item.c = item.c.replace(/\n/g, " "); // The Hub container has '\n' in json but a space when read from html
            item.c = item.c.replace(/&apos;/g, "'"); // Bukin has '&apos;' in json

            const c_index = item.c.lastIndexOf('(');
            const res = item.c.match(/.*\(([\d)]+)\)/);
            if (res !== null) {
                item.c = item.c.substring(0, c_index).trim();
                item.r = res[1];
            } else {
                item.r = '0';
            }
        })
        inventory.itemlist?.sort((a: ItemData, b: ItemData) => Number(a.id) - Number(b.id)) // sort them because they come in a different order from html or ajax
        inventory.meta = {
            date: (new Date()).getTime(),
            total: total.toFixed(2)
        }
    }
}

export default InventoryManager