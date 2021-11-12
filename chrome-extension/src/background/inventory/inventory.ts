import { CLASS_INFO, STRING_NO_DATA } from '../../common/const'
import { Inventory, makeLogInventory } from '../../common/state'
import InventoryStorage from './inventoryStorage'
import IBackendServerManager from '../server/backendInterface'

//// INVENTORY ////

class InventoryManager {
    private storage: InventoryStorage
    private server: IBackendServerManager
    public onChanged: (list: Array<Inventory>) => Promise<void>

    constructor(storage: InventoryStorage, server: IBackendServerManager) {
        this.storage = storage
        this.server = server
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
        if (!inventory.log) {
            this._adjust(inventory)
            this.server.send(inventory.itemlist);
        }
        return await this.storage.add(inventory, keepDate)
    }

    private _adjust(inventory: Inventory) {
        let total = 0;
        inventory.itemlist.forEach(item => {
            total += Number(item.v)

            item.n = item.n.split('&apos;').join("'")

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