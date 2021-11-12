import IAlarmManager from '../../chrome/alarmInterface'
import {
    CLASS_ERROR,
    STRING_PLEASE_LOG_IN
} from '../../common/const'
import {
    Inventory,
    Status,
    STATUS_TYPE_TIME,
    STATUS_TYPE_AUTO_REQUEST_OFF,
    STATUS_TYPE_LOG,
    ViewState
} from '../../common/state'
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
                const isAutoRequestOn = await this.alarmSettings.isAutoRequestOn()
                if (isAutoRequestOn)
                    status = { type: STATUS_TYPE_LOG, log: { class: _class, message } }
                else
                    status = { type: STATUS_TYPE_AUTO_REQUEST_OFF }
            }
            else
                status = await this._getAlarmStatus()
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

    private async _getAlarmStatus(): Promise<Status> {
        const isAutoRequestOn = await this.alarmSettings.isAutoRequestOn()
        if (!isAutoRequestOn) {
            return { type: STATUS_TYPE_AUTO_REQUEST_OFF }
        }
        const time = await this.alarm.getTimeLeft()
        if (time !== undefined) {
            return { type: STATUS_TYPE_TIME, time }
        } else {
            return { type: STATUS_TYPE_LOG, log: { class: CLASS_ERROR, message: STRING_PLEASE_LOG_IN } }
        }
    }
}

export default ViewStateManager
export {
    ViewState
}