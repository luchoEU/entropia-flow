import IWebSocketClient from "./webSocketInterface";

class MockWebSocketClient implements IWebSocketClient {
    startMock = jest.fn()
    public start() {
        this.startMock()
    }

    sendMock = jest.fn()
    public send(type: string, data: any) {
        this.sendMock(type, data)
    }

    closeMock = jest.fn()
    public close() {
        this.closeMock()
    }

    public onMessage: (msg: any) => Promise<void>;
    public onStateChanged: (state: string, message: string) => Promise<void>;
}

export default MockWebSocketClient
