import { StreamStateVariable } from "../../stream/data"
import { StreamBuilderState, StreamVariablesBuilder } from "../client/streamVariablesBuilder"
import RefreshManager from "./refreshManager"
import InventoryManager from "../inventory/inventory"

class StatusVariablesBuilder implements StreamVariablesBuilder {
    private refreshManager: RefreshManager
    private inventoryManager: InventoryManager
    public onChanged?: () => Promise<void>

    constructor(refreshManager: RefreshManager, inventoryManager: InventoryManager) {
        this.refreshManager = refreshManager
        this.inventoryManager = inventoryManager
        this.refreshManager.subscribeOnChanged(async () => await this.onChanged?.())
        this.inventoryManager.subscribeOnChanged(async () => await this.onChanged?.())
    }

    public getName(): string {
        return 'status'
    }

    public async getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]> {
        const { message } = await this.refreshManager.getStatus()
        const list = await this.inventoryManager.getList()
        const avatarName = list.find(v => v.avatarName)?.avatarName
        return [
            { name: 'message', value: message ?? '', description: 'status message' },
            { name: 'avatar', value: avatarName ?? '', description: 'avatar name' }
        ]
    }
}

export { StatusVariablesBuilder }
