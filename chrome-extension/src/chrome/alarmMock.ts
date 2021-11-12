import { TimeLeft } from "../common/state"
import IAlarmManager from "./alarmInterface"

class MockAlarmManager implements IAlarmManager {
    startMock = jest.fn()
    async start(): Promise<void> {
        return this.startMock()
    }

    endMock = jest.fn()
    async end(): Promise<boolean> {
        return this.endMock()
    }

    getTimeLeftMock = jest.fn()
    async getTimeLeft(): Promise<TimeLeft> {
        return this.getTimeLeftMock()
    }

    getStatusMock = jest.fn()
    async getStatus(): Promise<string> {
        return this.getStatusMock()
    }

    listenMock = jest.fn()
    listen(callback: () => Promise<void>): void {
        this.listenMock(callback)
    }
}

export default MockAlarmManager
