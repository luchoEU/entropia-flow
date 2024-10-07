import IMessagesHub, { MessageHandlers } from "./IMessagesHub";
import { PortHandlers, IPort } from "./IPort";

class MockMessagesHub implements IMessagesHub {
    connectMock = jest.fn()
    connect(tabId: number, portName: string, handlers: PortHandlers): IPort {
        return this.connectMock(tabId, portName, handlers)
    }

    listenMock = jest.fn()
    listen(handlers: MessageHandlers): void {
        this.listenMock(handlers)
    }
}

export default MockMessagesHub