import IActionManager from "./IActionManager";

class MockActionManager implements IActionManager {
    clickListenMock = jest.fn()
    clickListen(listener: (tab: chrome.tabs.Tab) => void): void {
        return this.clickListenMock(listener)
    }
}

export default MockActionManager