import IAlarmManager from "../../chrome/IAlarmManager";
import { AFTER_MANUAL_WAIT_SECONDS, CLASS_ERROR, CLASS_INFO, ERROR_425, NORMAL_WAIT_SECONDS, STRING_LOADING_ITEMS, STRING_LOADING_PAGE, STRING_NO_DATA, STRING_NOT_READY, STRING_PLEASE_LOG_IN, TICK_SECONDS } from "../../common/const";
import { Inventory, Log, Status } from "../../common/state";
import { Component, traceError } from "../../common/trace";
import AlarmSettings from "../settings/alarmSettings";

interface IContentTab {
    setStatus(isMonitoring: boolean): Promise<void>
    requestItems(tag?: any, waitSeconds?: number, forced?: boolean): Promise<string>
    wakeUp(): Promise<void>
    onConnected: () => Promise<void>
    onDisconnected: () => Promise<void>
}

class RefreshManager {
    private ajaxAlarm: IAlarmManager
    private tickAlarm: IAlarmManager
    private alarmSettings: AlarmSettings
    private contentTab: IContentTab
    private stickyStatus: Log
    public onInventory: (inventory: Inventory) => Promise<void>
    public setViewStatus: (status: Status) => Promise<void>

    constructor(ajaxAlarm: IAlarmManager, tickAlarm: IAlarmManager, alarmSettings: AlarmSettings ) {
        this.ajaxAlarm = ajaxAlarm
        this.tickAlarm = tickAlarm
        this.alarmSettings = alarmSettings

        // prepare alarms
        this.ajaxAlarm?.listen(async () => {
            if (this.stickyStatus?.message !== STRING_LOADING_ITEMS) {
                await this.contentTab.wakeUp()
            }
            return false;
        })
        this.tickAlarm?.listen(async () => {
            this._setViewStatus();
            return true;
        })
    }

    public async setContentTab(contentTab: IContentTab) {
        this.contentTab = contentTab;
        await this._setViewStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN);

        contentTab.onConnected = async () => {
            await this._setViewStatus(CLASS_INFO, STRING_LOADING_PAGE);
            const on = await this.alarmSettings.isMonitoringOn();
            await this.contentTab.setStatus(on);
            await this.tickAlarm?.start(TICK_SECONDS);
        }

        contentTab.onDisconnected = async () => {
            await this._setViewStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN);
            await this.ajaxAlarm?.end();
            await this.tickAlarm?.end();
        }
    }

    private async _setViewStatus(_class?: string, message?: string) {
        if (!this.setViewStatus) return

        if (message !== undefined) {
            const isMonitoring = await this.alarmSettings?.isMonitoringOn() ?? true
            await this.setViewStatus({ class: _class, message, isMonitoring })
            this.stickyStatus = { class: _class, message }
        } else {
            await this.setViewStatus(await this.getStatus())
        }
    }

    public async handleNewInventory(inventory: Inventory) {
        try {
            const logMessage = inventory.log?.message
            if (logMessage === STRING_NOT_READY || logMessage === STRING_PLEASE_LOG_IN || logMessage == ERROR_425) {
                // Don't start the alarm
                await this._setViewStatus(CLASS_ERROR, logMessage)
            } else if (logMessage == STRING_NO_DATA) {
                // The page has not load the first item list yet
                // Don't add no data to history since it is common in my items page reload
                // Don't start the alarm either, it will be started when the items are loaded in the page and it sends a MSG_NAME_NEW_INVENTORY message
            } else {
                this.stickyStatus = undefined
                await this.ajaxAlarm.start(inventory.waitSeconds ?? NORMAL_WAIT_SECONDS)
                if (this.onInventory) {
                    await this.onInventory(inventory)
                }
            }
        } catch (e) {
            traceError(Component.RefreshManager, 'handleNewInventory exception:', e)
            await this._setViewStatus(CLASS_ERROR, e.message)
        }
    }

    public async handleLoading(loading: boolean) {
        if (loading) {
            await this._setViewStatus(CLASS_INFO, STRING_LOADING_ITEMS)
        } else {
            await this._setViewStatus()
        }
    }

    public async setTimerOn() {
        const on = await this.alarmSettings.isMonitoringOn()
        if (on) {
            await this._setViewStatus()
        } else {
            await this.alarmSettings.turnMonitoringOn(true)
            if (await this.ajaxAlarm.isActive()) {
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
        const message = await this.contentTab.requestItems(tag, AFTER_MANUAL_WAIT_SECONDS, forced)
        if (message !== undefined) {
            await this._setViewStatus(CLASS_ERROR, message)
        }
    }

    public async getStatus(): Promise<Status> {
        const isMonitoring = await this.alarmSettings?.isMonitoringOn()
        if (this.stickyStatus) {
            return { ...this.stickyStatus, isMonitoring }
        }

        let when: string
        const time = await this.ajaxAlarm?.getTimeLeft()
        if (!time || time.minutes === 0 && time.seconds === 0) {
            when = 'now';
        } else {
            const pad = (n: number) => n.toString().padStart(2, '0');
            when = `in ${pad(time.minutes)}:${pad(time.seconds)}`;
        }

        const message = `${isMonitoring ? 'updates' : 'safe to refresh'} ${when}`;
        return { class: CLASS_INFO, message, isMonitoring }
    }
}

export { IContentTab }
export default RefreshManager
