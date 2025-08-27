import { StreamStateVariable } from "../../stream/data"
import { StreamBuilderState, StreamVariablesBuilder } from "../client/streamVariablesBuilder"
import RefreshManager from "./refreshManager"

class StatusVariablesBuilder implements StreamVariablesBuilder {
    private refreshManager: RefreshManager
    public onChanged?: () => Promise<void>

    constructor(refreshManager: RefreshManager) {
        this.refreshManager = refreshManager
        this.refreshManager.subscribeOnChanged(async () => await this.onChanged?.())
    }

    public getName(): string {
        return 'status'
    }

    public async getVariables(state: StreamBuilderState): Promise<StreamStateVariable[]> {
        const { message } = await this.refreshManager.getStatus()
        return [{ name: 'message', value: message ?? '', description: 'status message' }]
    }
}

export { StatusVariablesBuilder }
