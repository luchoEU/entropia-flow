import ListStorage from "../background/listStorage"
import IMessagesHub from "./messagesInterface"
import ITabManager, { ITab } from "./tabsInterface"

type PortHandler = (message: any) => Promise<any>
type PortHandlers = { [key: string]: PortHandler }
type PortManagerFactory = (storage: ListStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) => IPortManager

interface IPort {
    getTabId(): number
    send(name: string, data: object): void
    onDisconnect(callback: (port: IPort) => void): void
}

interface IPortManager {
    isEmpty(): Promise<boolean>
    first(): Promise<IPort>
    firstTab(): Promise<ITab>
    all(): Promise<Array<IPort>>
    remove(port: IPort): Promise<void>
    handle(tabId: number): Promise<void>

    onConnect: (port: IPort) => Promise<void>
    onDisconnect: (port: IPort) => Promise<void>
    handlers: PortHandlers
}

export default IPortManager
export {
    IPort,
    PortHandler,
    PortHandlers,
    PortManagerFactory
}