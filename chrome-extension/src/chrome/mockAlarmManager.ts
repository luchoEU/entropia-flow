import { TimeLeft } from "../common/state"
import IAlarmManager from "./IAlarmManager"

class MockAlarmManager implements IAlarmManager {
    startMock = jest.fn()
    async start(periodInSeconds: number): Promise<void> {
        return this.startMock(periodInSeconds)
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
