import IMessagesHub, { MessageHandlers } from "./messagesInterface";
import { PortHandlers, IPort } from "./portInterface";

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