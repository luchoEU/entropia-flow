import MemoryStorageArea from "../../chrome/memoryStorageArea"
import { Inventory, ItemData } from "../../common/state"
import { getDifference } from "../../view/application/helpers/diff"
import InventoryManager from "./inventory"
import InventoryStorage from "./inventoryStorage"

const _adjust = async (itemlist: Array<ItemData>): Promise<Inventory> => {
    // pass through InventoryManager to clean data
    const inv = new InventoryManager(new InventoryStorage(new MemoryStorageArea()));
    const date = 0;
    await inv.onNew({ meta: { date }, itemlist}, date);
    const list = await inv.getList()
    return list[0];
}

describe('read items', () => {
    test('double space', async () => {
        const listJson = await _adjust([{
            id: "2566",
            n: "Zombies Trucker Cap  Blueprint",
            q: "1",
            v: "0.01",
            c: "Rocktropia Blueprint Book Tailoring Vol I (1891)"
        }])
        const listHtml = await _adjust([{
            id: "2566",
            n: "Zombies Trucker Cap Blueprint",
            q: "1",
            v: "0.01",
            c: "Rocktropia Blueprint Book Tailoring Vol I (1891)"
        }]);
        const diff = getDifference(listJson, listHtml);
        expect(diff).toEqual(null);
    })
})
