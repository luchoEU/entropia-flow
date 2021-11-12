import ITabManager, { ITab } from "./tabsInterface";

class MockTab implements ITab {
    selectMock = jest.fn()
    async select() {
        this.selectMock()
    }
}

class MockTabManager implements ITabManager {
    createMock = jest.fn()
    async create(url: string): Promise<ITab> {
        return this.createMock(url)
    }

    getMock = jest.fn()
    async get(tabId: number): Promise<ITab> {
        return this.getMock(tabId)
    }

}

export default MockTabManager
export {
    MockTab
}