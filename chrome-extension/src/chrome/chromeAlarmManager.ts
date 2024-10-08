/// <reference types="chrome"/>
import { STRING_ALARM_OFF } from '../common/const'
import { TimeLeft } from '../common/state'
import IAlarmManager from './IAlarmManager'

class ChromeAlarmManager implements IAlarmManager {
    private name: string
    private periodInSeconds: number | undefined
    public onStarted: () => Promise<void>
    public onEnded: () => Promise<void>

    constructor(name: string) {
        this.name = name
    }

    public listen(callback: () => Promise<void>) {
        chrome.alarms.onAlarm.addListener(async function(alarm) {
            if (alarm.name == this.name)
                await callback()
            if (this.periodInSeconds)
                chrome.alarms.create(this.name, { when: Date.now() + this.periodInSeconds * 1000 });
        }.bind(this))
    }

    public async start(periodInSeconds: number): Promise<void> {
        this.periodInSeconds = periodInSeconds
        chrome.alarms.create(this.name, { when: Date.now() + periodInSeconds * 1000 });
        if (this.onStarted)
            await this.onStarted()
    }

    public async end(): Promise<boolean> {
        this.periodInSeconds = undefined
        const res = await chrome.alarms.clear(this.name)
        if (this.onEnded)
            await this.onEnded()
        return res
    }

    public async getTimeLeft(): Promise<TimeLeft> {
        const alarm = await chrome.alarms.get(this.name)
        if (alarm) {
            const ms = alarm.scheduledTime - (new Date()).getTime()
            const minutes = Math.floor((ms / 1000) / 60)
            const seconds = Math.floor((ms / 1000) % 60)
            return { minutes, seconds }
        } else {
            return undefined
        }
    }

    public async getStatus() {
        const time = await this.getTimeLeft()
        if (time !== undefined) {
            return `${time.minutes}:${time.seconds.toString().padStart(2, '0')}`
        } else {
            return STRING_ALARM_OFF
        }
    }
}

export default ChromeAlarmManager