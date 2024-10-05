import {
    Inventory,
    Status,
    ViewState,
    StatusType
} from '../../common/state'
import { LootLogData } from '../client/logData'
import RefreshManager from '../content/refreshManager'
import InventoryManager from '../inventory/inventory'
import ViewSettings from '../settings/viewSettings'

class ViewStateManager {
    private refreshManager: RefreshManager
    private viewSettings: ViewSettings
    private inventory: InventoryManager
    public onChange: (state: ViewState) => Promise<void>

    constructor(refreshManager: RefreshManager, viewSettings: ViewSettings, inventory: InventoryManager) {
        this.refreshManager = refreshManager
        this.viewSettings = viewSettings
        this.inventory = inventory
    }

    public async get(): Promise<ViewState> {
        const list = await this.inventory.getList()
        const last = await this.viewSettings.getLast()
        const status = await this.refreshManager.getAlarmStatus()
        return { list, last, status }
    }

    public async reload(): Promise<void> {
        if (this.onChange) {
            const state = await this.get()
            await this.onChange(state)
        }
    }

    public async setStatus(status: Status): Promise<void> {
        if (this.onChange) {
            await this.onChange({ status })
        }
    }

    public async setList(list: Array<Inventory>): Promise<void> {
        if (this.onChange) {
            const last = await this.viewSettings.getLast()
            const status = await this.refreshManager.getAlarmStatus()
            await this.onChange({ list, last, status })
        }
    }

    public async setGameLog(gameLog: Array<LootLogData>) {
        if (this.onChange) {
            await this.onChange({ gameLog })
        }
    }

    public async setClientState(state: string, message: string): Promise<void> {
        if (this.onChange) {
            await this.onChange({ clientState: { state, message } })
        }
    }
}

export default ViewStateManager
export {
    ViewState
}
