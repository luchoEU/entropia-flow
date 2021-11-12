import IPortManager, { IPort, PortHandlers } from "./portInterface";
import { ITab } from "./tabsInterface";

class MockPort implements IPort {
    getTabIdMock = jest.fn()
    getTabId(): number {
        return this.getTabIdMock()
    }

    sendMock = jest.fn()
    send(name: string, data: object): void {
        return this.sendMock(name, data)
    }

    onDisconnectMock = jest.fn()
    onDisconnect(callback: (port: IPort) => void): void {
        return this.onDisconnectMock(callback)
    }
}

class MockPortManager implements IPortManager {
    isEmptyMock = jest.fn()
    async isEmpty(): Promise<boolean> {
        return this.isEmptyMock()
    }

    allMock = jest.fn()
    async all(): Promise<IPort[]> {
        return this.allMock()
    }

    firstMock = jest.fn()
    async first(): Promise<IPort> {
        return this.firstMock()
    }

    firstTabMock = jest.fn()
    async firstTab(): Promise<ITab> {
        return this.firstTabMock()
    }

    removeMock = jest.fn()
    async remove(port: IPort): Promise<void> {
        this.removeMock(port)
    }

    handleMock = jest.fn()
    async handle(tabId: number): Promise<void> {
        return this.handleMock(tabId)
    }

    onConnect: (port: IPort) => Promise<void>
    onDisconnect: (port: IPort) => Promise<void>
    handlers: PortHandlers
}

export default MockPortManager
export {
    MockPort
}