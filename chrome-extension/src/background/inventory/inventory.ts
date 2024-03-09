import { CLASS_INFO, STRING_NO_DATA } from '../../common/const'
import { Inventory, makeLogInventory } from '../../common/state'
import InventoryStorage from './inventoryStorage'

//// INVENTORY ////

class InventoryManager {
    private storage: InventoryStorage
    public onChanged: (list: Array<Inventory>) => Promise<void>

    constructor(storage: InventoryStorage) {
        this.storage = storage
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
        return await this.storage.add(inventory, keepDate)
    }

    private _adjust(inventory: Inventory) {
        let total = 0;
        inventory.itemlist.forEach(item => {
            total += Number(item.v)

            // Some names have '&apos;' in the json but a ' when read from html
            item.n = item.n.replace(/&apos;/g, "'");

            // The Hub container has '&#10;' in the json but an '\r' when read from html
            item.c = item.c.replace(/&#10;/g, '\r');

            const c_index = item.c.lastIndexOf('(');
            const res = item.c.match(/.*\(([\d)]+)\)/);
            if (res !== null) {
                item.c = item.c.substring(0, c_index).trim();
                item.r = res[1];
            } else {
                item.r = '0';
            }
        })
        inventory.meta = {
            date: (new Date()).getTime(),
            total: total.toFixed(2)
        }
    }
}

export default InventoryManager