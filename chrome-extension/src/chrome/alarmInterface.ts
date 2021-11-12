import { TimeLeft } from "../common/state"

interface IAlarmManager {
    start(): Promise<void>
    end(): Promise<boolean>
    getTimeLeft(): Promise<TimeLeft>
    getStatus(): Promise<string>
    listen(callback: () => Promise<void>): void
}

export default IAlarmManager
