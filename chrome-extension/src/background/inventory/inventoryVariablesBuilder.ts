import { Inventory } from "../../common/state"
import { StreamStateVariable } from "../../stream/data"
import { StreamBuilderState, StreamVariablesBuilder } from "../client/streamVariablesBuilder"
import InventoryManager from "../inventory/inventory"

class InventoryVariablesBuilder implements StreamVariablesBuilder {
    private inventoryManager: InventoryManager

    constructor(inventoryManager: InventoryManager) {
        this.inventoryManager = inventoryManager
    }

    getName(): string {
        return 'inventory'
    }

    async getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]> {
        const list = [...await this.inventoryManager.getList()]
        list.reverse() // newer first
        const newest = list.find(e => e.log === undefined && e.itemlist !== undefined)
        return newest ? _getInventoryVariables(newest) : []
    }
}

function _getInventoryVariables(inventory: Inventory): StreamStateVariable[] {
    return [
        { name: 'inventoryTime', value: inventory.meta.date, description: 'time of the last inventory update' },
        { name: 'items', value: inventory.itemlist?.map(i => ({ name: i.n, quantity: Number(i.q), value: Number(i.v), container: i.c })) ?? [], description: 'items' }
    ]
}

export { InventoryVariablesBuilder }
