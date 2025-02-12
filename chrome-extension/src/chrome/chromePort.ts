import { IPort } from './IPort'

//// Ports ////

class ChromePort implements IPort {
    private tabId: number
    private port: chrome.runtime.Port

    constructor(tabId: number, port: chrome.runtime.Port) {
        this.tabId = tabId
        this.port = port
    }

    public getTabId() {
        return this.tabId
    }

    public send(name: string, data: object) {
        this.port.postMessage({ name, ...data })
    }

    public onDisconnect(callback: (port: IPort) => void) {
        this.port.onDisconnect.addListener(() => callback(this))
    }
}

export default ChromePort
