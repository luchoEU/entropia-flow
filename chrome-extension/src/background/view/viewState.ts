import IAlarmManager from '../../chrome/alarmInterface'
import {
    CLASS_ERROR,
    STRING_PLEASE_LOG_IN
} from '../../common/const'
import {
    Inventory,
    Status,
    ViewState,
    StatusType
} from '../../common/state'
import { LootLogData } from '../client/logData'
import InventoryManager from '../inventory/inventory'
import AlarmSettings from '../settings/alarmSettings'
import ViewSettings from '../settings/viewSettings'

class ViewStateManager {
    private alarm: IAlarmManager
    private alarmSettings: AlarmSettings
    private viewSettings: ViewSettings
    private inventory: InventoryManager
    public onChange: (state: ViewState) => Promise<void>

    constructor(alarm: IAlarmManager, alarmSettings: AlarmSettings, viewSettings: ViewSettings, inventory: InventoryManager) {
        this.alarm = alarm
        this.alarmSettings = alarmSettings
        this.viewSettings = viewSettings
        this.inventory = inventory
    }

    public async get(): Promise<ViewState> {
        const list = await this.inventory.getList()
        const last = await this.viewSettings.getLast()
        const status = await this._getAlarmStatus()
        return { list, last, status }
    }

    public async reload(): Promise<void> {
        if (this.onChange) {
            const state = await this.get()
            await this.onChange(state)
        }
    }

    public async setStatus(_class?: string, message?: string): Promise<void> {
        if (this.onChange) {
            let status: Status
            if (message !== undefined) {
                const isMonitoring = await this.alarmSettings.isMonitoringOn()
                status = { type: StatusType.Log, log: { class: _class, message }, isMonitoring }
            }
            else {
                status = await this._getAlarmStatus()
            }
            await this.onChange({ status })
        }
    }

    public async setList(list: Array<Inventory>): Promise<void> {
        if (this.onChange) {
            const last = await this.viewSettings.getLast()
            const status = await this._getAlarmStatus()
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

    private async _getAlarmStatus(): Promise<Status> {
        const isMonitoring = await this.alarmSettings.isMonitoringOn()
        const time = await this.alarm.getTimeLeft()
        if (time !== undefined) {
            return { type: StatusType.Time, time, isMonitoring }
        } else {
            return { type: StatusType.Log, log: { class: CLASS_ERROR, message: STRING_PLEASE_LOG_IN }, isMonitoring }
        }
    }
}

export default ViewStateManager
export {
    ViewState
}
