import IAlarmManager from "../../chrome/IAlarmManager";
import { CLASS_ERROR, CLASS_INFO, DEAD_CHECK_WAIT_SECONDS, ERROR_425, FROZEN_CHECK_WAIT_SECONDS, START_SLEEP_MODE_AFTER_SECONDS, STRING_LOADING_ITEMS, STRING_LOADING_PAGE, STRING_NO_DATA, STRING_NOT_READY, STRING_PLEASE_LOG_IN, TICK_SECONDS } from "../../common/const";
import { Inventory, Log, Status } from "../../common/state";
import { Component, traceError } from "../../common/trace";
import AlarmSettings from "../settings/alarmSettings";

interface IContentTab {
    setStatus(isMonitoring: boolean): Promise<void>
    requestItems(tag?: any, forced?: boolean): Promise<string>
    setSleepMode(sleepMode: boolean): Promise<string>
    wakeUp(): Promise<boolean>
    checkFrozen(): Promise<boolean>
    onConnected: () => Promise<void>
    onDisconnected: () => Promise<void>
}

class RefreshManager {
    private ajaxAlarm: IAlarmManager
    private frozenAlarm: IAlarmManager
    private sleepAlarm: IAlarmManager
    private deadAlarm: IAlarmManager
    private tickAlarm: IAlarmManager
    private alarmSettings: AlarmSettings
    private contentTab: IContentTab
    private stickyStatus: Log | undefined
    private sleepMode: boolean
    public onInventory: (inventory: Inventory) => Promise<void>
    public setViewStatus: (status: Status) => Promise<void>

    constructor(ajaxAlarm: IAlarmManager, frozenAlarm: IAlarmManager, sleepAlarm: IAlarmManager, deadAlarm: IAlarmManager, tickAlarm: IAlarmManager, alarmSettings: AlarmSettings) {
        this.ajaxAlarm = ajaxAlarm;
        this.frozenAlarm = frozenAlarm;
        this.sleepAlarm = sleepAlarm;
        this.deadAlarm = deadAlarm;
        this.tickAlarm = tickAlarm;
        this.alarmSettings = alarmSettings;
        this.sleepMode = false

        // prepare alarms
        this.ajaxAlarm?.listen(async () => {
            if (this.stickyStatus?.message !== STRING_LOADING_ITEMS) {
                await this.contentTab.wakeUp()
            }
            await this.frozenAlarm?.start(FROZEN_CHECK_WAIT_SECONDS);
            await this.deadAlarm?.start(DEAD_CHECK_WAIT_SECONDS);
            return false;
        })
        this.frozenAlarm?.listen(async () => {
            const frozen = await this.contentTab.checkFrozen();
            return !frozen; // if not frozen, continue the alarm
        })
        this.sleepAlarm?.listen(async () => {
            await this.setSleepMode(true);
            return false;
        })
        this.deadAlarm?.listen(async () => {
            await this._setViewStatus(CLASS_ERROR, STRING_PLEASE_LOG_IN);
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
            await this.setViewStatus({ class: _class ?? '', message, isMonitoring })
            this.stickyStatus = { class: _class ?? '', message }
        } else {
            await this.setViewStatus(await this.getStatus())
        }
    }

    public async handleNewInventory(inventory: Inventory) {
        if (inventory.itemlist?.length === 0) {
            // This happens when the system enters maintenance mode   
            await this._setViewStatus(CLASS_ERROR, STRING_NO_DATA)
            return
        }

        try {
            await this.frozenAlarm?.end()
            await this.deadAlarm?.end()
            const logMessage = inventory.log?.message
            if (logMessage === STRING_NOT_READY || logMessage === STRING_PLEASE_LOG_IN || logMessage == ERROR_425) {
                // Don't start the alarm
                await this._setViewStatus(CLASS_ERROR, logMessage)
            } else if (logMessage == STRING_NOT_READY) {
                // The page has not load the first item list yet
                // Don't add no data to history since it is common in my items page reload
                // Don't start the alarm either, it will be started when the items are loaded in the page and it sends a MSG_NAME_NEW_INVENTORY message
            } else {
                this.stickyStatus = undefined
                await this.ajaxAlarm.start(inventory.waitSeconds!)
                if (this.onInventory) {
                    await this.onInventory(inventory)
                }
            }
        } catch (e) {
            traceError(Component.RefreshManager, 'handleNewInventory exception:', e)
            await this._setViewStatus(CLASS_ERROR, e.message)
        }
    }

    public async handleRemainingSeconds(remainingSeconds: number) {
        await this.ajaxAlarm.end()
        await this.ajaxAlarm.start(remainingSeconds)
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
        const message = await this.contentTab.requestItems(tag, forced)
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

    private async setSleepMode(sleepMode: boolean) {
        if (this.sleepMode === sleepMode) return
        this.sleepMode = sleepMode
        await this.contentTab?.setSleepMode(sleepMode)
    }

    public async onLogMessageReceived() {
        if (this.sleepMode) return;
        this.sleepAlarm?.end()
        this.sleepAlarm?.start(START_SLEEP_MODE_AFTER_SECONDS)
    }

    public async onWebSocketStateChanged(connected: boolean) {
        if (connected) {
            await this.setSleepMode(false)
        }
    }
}

export { IContentTab }
export default RefreshManager
