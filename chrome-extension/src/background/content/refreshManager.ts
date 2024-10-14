import IAlarmManager from "../../chrome/IAlarmManager";
import { AFTER_MANUAL_WAIT_SECONDS, CLASS_ERROR, CLASS_INFO, ERROR_425, FIRST_HTML_CHECK_WAIT_SECONDS, NEXT_HTML_CHECK_WAIT_SECONDS, NORMAL_WAIT_SECONDS, STRING_ALARM_OFF, STRING_LOADING_ITEMS, STRING_LOADING_PAGE, STRING_NO_DATA, STRING_NOT_READY, STRING_PLEASE_LOG_IN } from "../../common/const";
import { Inventory, Status, StatusType } from "../../common/state";
import { trace, traceData } from "../../common/trace";
import AlarmSettings from "../settings/alarmSettings";

interface IContentTab {
    setStatus(isMonitoring: boolean): Promise<void>
    requestItemsHtml(): Promise<string>
    requestItemsAjax(tag?: any, waitSeconds?: number, forced?: boolean): Promise<string>
    onConnected: () => Promise<void>
    onDisconnected: () => Promise<void>
}

class RefreshManager {
    private htmlAlarm: IAlarmManager
    private ajaxAlarm: IAlarmManager
    private alarmSettings: AlarmSettings
    private contentTab: IContentTab
    public onInventory: (inventory: Inventory) => Promise<void>
    public setViewStatus: (status: Status) => Promise<void>

    constructor(htmlAlarm: IAlarmManager, ajaxAlarm: IAlarmManager, alarmSettings: AlarmSettings ) {
        this.htmlAlarm = htmlAlarm
        this.ajaxAlarm = ajaxAlarm
        this.alarmSettings = alarmSettings

        // prepare alarms
        this.htmlAlarm?.listen(async () => {
            await this.htmlAlarm.end()
            await this.requestItemsHtml()
        })
        this.ajaxAlarm?.listen(async () => {
            await this.ajaxAlarm.end()
            if (await this.alarmSettings.isMonitoringOn())
                await this.requestItemsAjax()
        })
    }

    public setContentTab(contentTab: IContentTab) {
        this.contentTab = contentTab

        contentTab.onConnected = async () => {
            await this._setViewStatus(CLASS_INFO, STRING_LOADING_PAGE)
            const on = await this.alarmSettings.isMonitoringOn()
            await this.contentTab.setStatus(on)
            await this.htmlAlarm.start(FIRST_HTML_CHECK_WAIT_SECONDS) // read the items loaded by the page when ready
        }

        contentTab.onDisconnected = async () => {
            await this._setViewStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN)
            await this.htmlAlarm.end()
            await this.ajaxAlarm.end()
        }
    }

    private async requestItemsHtml() {
        await this.handleRequestResult(await this.contentTab.requestItemsHtml())
    }

    private async requestItemsAjax(tag?: any, waitSeconds?: number, forced?: boolean) {
        const message = await this.contentTab.requestItemsAjax(tag, waitSeconds, forced)
        await this.handleRequestResult(message)
    }

    private async handleRequestResult(message?: string) {
        if (message !== undefined) {
            await this._setViewStatus(CLASS_ERROR, message)
        } else {
            await this._setViewStatus(CLASS_INFO, STRING_LOADING_ITEMS)
        }
    }

    private async _setViewStatus(_class?: string, message?: string) {
        if (!this.setViewStatus) return

        if (message !== undefined) {
            const isMonitoring = await this.alarmSettings?.isMonitoringOn() ?? true
            await this.setViewStatus({ type: StatusType.Log, log: { class: _class, message }, isMonitoring })
        }
        else {
            await this.setViewStatus(await this.getAlarmStatus())
        }
    }

    public async handleNewInventory(inventory: Inventory) {
        try {
            const logMessage = inventory.log?.message
            if (logMessage === STRING_NOT_READY) {
                await this.htmlAlarm.start(NEXT_HTML_CHECK_WAIT_SECONDS)
            } else if (logMessage === STRING_PLEASE_LOG_IN || logMessage == ERROR_425) {
                // Don't start the alarm
                await this._setViewStatus(CLASS_ERROR, logMessage)
            } else if (logMessage == STRING_NO_DATA) {
                // The page has not load the first item list yet
                // Don't add no data to history since it is common in my items page reload
                // Don't start the alarm either, it will be started when the items are loaded in the page and it sends a MSG_NAME_NEW_INVENTORY message
            } else {
                await this.ajaxAlarm.start(inventory.waitSeconds ?? NORMAL_WAIT_SECONDS)
                if (this.onInventory) {
                    await this.onInventory(inventory)
                }
            }
        } catch (e) {
            trace('RefreshManager.handleNewInventory exception:')
            traceData(e)
            await this._setViewStatus(CLASS_ERROR, e.message)
        }
    }

    public async setTimerOn() {
        const on = await this.alarmSettings.isMonitoringOn()
        if (on) {
            await this._setViewStatus()
        } else {
            await this.alarmSettings.turnMonitoringOn(true)
            if (await this.ajaxAlarm.getStatus() === STRING_ALARM_OFF) {
                await this.requestItemsAjax()
            } else {
                await this._setViewStatus()
            }
        }
        await this.contentTab?.setStatus(true)
    }

    public async setTimerOff() {
        const on = await this.alarmSettings?.isMonitoringOn()
        if (on) {
            await this.alarmSettings.turnMonitoringOn(false)
        }
        await this.contentTab?.setStatus(false)
        await this._setViewStatus()
    }

    public async manualRefresh(tag?: any, forced?: boolean) {
        await this.ajaxAlarm?.end()
        await this.requestItemsAjax(tag, AFTER_MANUAL_WAIT_SECONDS, forced)
    }

    public async getAlarmStatus(): Promise<Status> {
        const isMonitoring = await this.alarmSettings.isMonitoringOn()
        const time = await this.ajaxAlarm.getTimeLeft()
        if (time !== undefined) {
            return { type: StatusType.Time, time, isMonitoring }
        } else {
            return { type: StatusType.Log, log: { class: CLASS_ERROR, message: STRING_PLEASE_LOG_IN }, isMonitoring }
        }
    }
}

export { IContentTab }
export default RefreshManager
