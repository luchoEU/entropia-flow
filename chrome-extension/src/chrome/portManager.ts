import TabStorage, { TabData } from "../background/tabStorage"
import { trace } from "../common/trace"
import IMessagesHub from "./IMessagesHub"
import IPortManager, { IPort, PortHandlers } from "./IPort"
import ITabManager, { ITab } from "./ITab"

class PortManager implements IPortManager {
    private storage: TabStorage
    private messages: IMessagesHub
    private tabs: ITabManager
    private portName: string
    private ports: { [tabId: number]: IPort; }
    public handlers: PortHandlers
    public onConnect: (port: IPort) => Promise<void>
    public onDisconnect: (port: IPort) => Promise<void>

    constructor(storage: TabStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) {
        this.storage = storage
        this.messages = messages
        this.tabs = tabs
        this.portName = portName
        this.ports = {}
    }

    public async handle(tabId: number, tabTitle: string): Promise<void> {
        await this._connect(tabId, tabTitle, false)
    }

    private async _connect(tabId: number, tabTitle: string, isReconnect: boolean): Promise<IPort> {
        const tab = await this.tabs.get(tabId)
        if (tab) {
            const port = this.messages.connect(tabId, this.portName, this.handlers)
            this.ports[tabId] = port
            trace(`PortManager._connect connected: tab ${tabId} title '${tabTitle}'`)
            await this.storage.add(tabId, tabTitle)
            if (!isReconnect && this.onConnect)
                await this.onConnect(port) // don't call on reconnect to avoid a duplicate requestItems
            port.onDisconnect(async () => {
                this.ports[tabId] = null
                await this.storage.remove(tabId)
                await this.onDisconnect(port)
            })
            return port
        } else {
            trace(`PortManager._connect not found: tab ${tabId} title '${tabTitle}'`)
            return undefined
        }
    }

    private async _getList(): Promise<Array<IPort>> {
        const tabList = await this.storage.get()
        trace(`PortManager._getList start: tabList ${JSON.stringify(tabList)}`)

        const portList: Array<IPort> = await Promise.all(tabList.map(async (tab: TabData) => {
            let port = this.ports[tab.id]
            if (!port) {
                // reconnect needed because service worker goes inactive and loses the connections
                trace(`PortManager._getList trying to reconnect: tab ${tab.id} title '${tab.title}'`)
                port = await this._connect(tab.id, tab.title, true)
            }
            return port
        }))

        const tabsToRemove: Array<number> = []
        const validPortList: Array<IPort> = portList
            .filter((port, index) => {
                if (!port) {
                    tabsToRemove.push(tabList[index].id)
                    return false
                } else {
                    return true
                }
            })
        await this.storage.removeAll(tabsToRemove)

        trace(`PortManager._getList start: tabsToRemove ${JSON.stringify(tabsToRemove)} validPortList ${JSON.stringify(validPortList.map(p => p.getTabId()))}`)
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
            return await this.tabs.get(tabList[0].id)
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

export default PortManager