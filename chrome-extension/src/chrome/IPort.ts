import TabStorage from "../background/tabStorage"
import IMessagesHub from "./IMessagesHub"
import ITabManager, { ITab } from "./ITab"

type PortHandler = (message: any, sender?: IMessageSender) => Promise<any>
type PortHandlers = { [key: string]: PortHandler }
type PortManagerFactory = (storage: TabStorage, messages: IMessagesHub, tabs: ITabManager, portName: string) => IPortManager

interface IMessageSender {
    send(name: string, data?: object): void
}

interface IPort extends IMessageSender {
    getTabId(): number
    onDisconnect(callback: (port: IPort) => void): void
}

interface IPortManager {
    isEmpty(): Promise<boolean>
    first(): Promise<IPort>
    firstTab(): Promise<ITab>
    all(): Promise<Array<IPort>>
    remove(port: IPort): Promise<void>
    handle(tabId: number, tabTitle: string): Promise<void>

    onConnect: (port: IPort) => Promise<void>
    onDisconnect: (port: IPort) => Promise<void>
    handlers: PortHandlers
}

export default IPortManager
export {
    IPort,
    IMessageSender,
    PortHandler,
    PortHandlers,
    PortManagerFactory
}