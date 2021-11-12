import IPortManager, { IPort, PortHandlers } from "./portInterface"

type MessageHandlers = { [key: string]: IPortManager }

interface IMessagesHub {
    connect(tabId: number, portName: string, handlers: PortHandlers): IPort
    listen(handlers: MessageHandlers): void
}

export default IMessagesHub
export {
    MessageHandlers
}