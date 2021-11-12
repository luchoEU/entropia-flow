import ListStorage from '../background/listStorage'
import IPortManager, { IPort, PortHandlers } from './portInterface'
import ITabManager, { ITab } from './tabsInterface'
import IMessagesHub from './messagesInterface'

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

class ChromePortManager implements IPortManager {
    private storage: ListStorage
    private messages: IMessagesHub
    private tabs: ITabManager
    private portName: string
    private ports: { [tabId: number]: IPort; }
    public handlers: PortHandlers
    public onConnect: (port: IPort) => Promise<void>
    public onDisconnect: (port: IPort) => Promise<void>

    constructor(storage: ListStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) {
        this.storage = storage
        this.messages = messages
        this.tabs = tabs
        this.portName = portName
        this.ports = {}
    }

    public async handle(tabId: number): Promise<void> {
        await this._connect(tabId)
    }

    private async _connect(tabId: number): Promise<IPort> {
        const tab = await this.tabs.get(tabId)
        if (tab) {
            const port = this.messages.connect(tabId, this.portName, this.handlers)
            this.ports[tabId] = port
            await this.storage.add(tabId)
            await this.onConnect(port)
            port.onDisconnect(async () => {
                this.ports[tabId] = null
                await this.storage.remove(tabId)
                await this.onDisconnect(port)
            })
            return port
        } else {
            return undefined
        }
    }

    private async _getList(): Promise<Array<IPort>> {
        const tabList = await this.storage.get()

        const portList: Array<IPort> = await Promise.all(tabList.map(async (tabId) => {
            let port = this.ports[tabId]
            if (!port)
                port = await this._connect(tabId) // reconnect needed because service worker goes inactive and loses the connections
            return port
        }))

        const tabsToRemove: Array<number> = []
        const validPortList: Array<IPort> = portList
            .filter((port, index) => {
                if (port === undefined) {
                    tabsToRemove.push(tabList[index])
                    return false
                } else {
                    return true
                }
            })
        await this.storage.removeAll(tabsToRemove)

        return validPortList
    }

    public all(): Promise<Array<IPort>> {
        return this._getList()
    }

    public async first(): Promise<IPort> {
        const portList = await this._getList()
        if (portList.length > 0)
            return portList[0]
        else
            return undefined
    }

    public async firstTab(): Promise<ITab> {
        const tabList = await this.storage.get()
        if (tabList.length > 0)
            return await this.tabs.get(tabList[0])
        else
            return undefined
    }

    public async isEmpty(): Promise<boolean> {
        const portList = await this._getList()
        return portList.length === 0
    }

    public async remove(port: IPort) {
        await this.storage.remove(port.getTabId())
    }
}

export default ChromePortManager
export {
    ChromePort
}