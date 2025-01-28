import { TimeLeft } from "../common/state"

interface IAlarmManager {
    start(periodInSeconds: number): Promise<void>
    end(): Promise<boolean>
    getTimeLeft(): Promise<TimeLeft>
    isActive(): Promise<boolean>
    listen(callback: () => Promise<boolean>): void // callback returns true if alarm should be rescheduled
}

export default IAlarmManager
