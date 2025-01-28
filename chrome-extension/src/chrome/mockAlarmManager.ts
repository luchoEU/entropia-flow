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

    isActiveMock = jest.fn()
    async isActive(): Promise<boolean> {
        return this.isActiveMock()
    }

    listenMock = jest.fn()
    listen(callback: () => Promise<boolean>): void {
        this.listenMock(callback)
    }
}

export default MockAlarmManager
